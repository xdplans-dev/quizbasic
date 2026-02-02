import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import {
  Trophy,
  Clock,
  Target,
  RotateCcw,
  Home,
  ListChecks,
} from "lucide-react";
import { motion } from "framer-motion";
import { getQuizResults } from "@/lib/quizStorage";
import { getCurrentUser } from "@/lib/authStorage";

export default function Result() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLocation("/auth");
      return;
    }
    const stored = getQuizResults();
    if (!stored) {
      setLocation("/");
      return;
    }

    setResults(stored);

    if (stored.correct >= stored.total / 2) {
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#7c3aed", "#a855f7", "#ffffff"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#7c3aed", "#a855f7", "#ffffff"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [setLocation]);

  const summary = useMemo(() => {
    if (!results) return null;
    const accuracy = results.total
      ? Math.round((results.correct / results.total) * 100)
      : 0;
    const timeFormatted = (results.durationMs / 1000).toFixed(1) + "s";
    return { accuracy, timeFormatted };
  }, [results]);

  if (!results || !summary) return null;
  const answerList = results.answers || [];
  const perfectRunBonus = results.perfectRunBonus || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl"
      >
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2 text-white">
            Quiz Finalizado!
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Otima rodada, <span className="text-white font-semibold">{results.nickname}</span>
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            {results.modeLabel}
          </p>

          {results.endedEarly && (
            <div className="mt-4 text-xs text-destructive font-mono uppercase tracking-widest">
              Finalizado por morte subita
            </div>
          )}
          {results.endedByTime && (
            <div className="mt-2 text-xs text-muted-foreground font-mono uppercase tracking-widest">
              Tempo esgotado
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10">
            <div className="bg-secondary/40 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2 text-sm font-medium uppercase tracking-wider">
                <Target className="w-4 h-4" /> Pontuacao
              </div>
              <div className="text-3xl font-mono font-bold text-white text-glow">
                {results.score}
              </div>
              {results.rawScore !== results.score && (
                <div className="text-xs text-muted-foreground mt-1">
                  Base {results.rawScore} + bonus {perfectRunBonus}
                </div>
              )}
            </div>

            <div className="bg-secondary/40 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2 text-sm font-medium uppercase tracking-wider">
                <Target className="w-4 h-4" /> Precisao
              </div>
              <div
                className={
                  summary.accuracy >= 80
                    ? "text-3xl font-mono font-bold text-emerald-400"
                    : "text-3xl font-mono font-bold text-white"
                }
              >
                {summary.accuracy}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {results.correct}/{results.total} Corretas
              </div>
            </div>

            <div className="bg-secondary/40 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2 text-sm font-medium uppercase tracking-wider">
                <Clock className="w-4 h-4" /> Tempo
              </div>
              <div className="text-3xl font-mono font-bold text-white">
                {summary.timeFormatted}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation("/")}
              className="px-8 py-3 rounded-xl font-bold border-2 border-border hover:bg-secondary/80 hover:border-primary/30 hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Inicio
            </button>

            <button
              onClick={() => setLocation("/leaderboard")}
              className="px-8 py-3 rounded-xl font-bold border-2 border-border hover:bg-secondary/80 hover:border-primary/30 hover:text-primary transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ListChecks className="w-4 h-4" />
              Ranking
            </button>

            <button
              onClick={() => setLocation("/play")}
              className="px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente
            </button>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-4 text-muted-foreground uppercase tracking-widest text-xs font-bold">
          <ListChecks className="w-4 h-4" /> Explicacoes por pergunta
        </div>
        <div className="space-y-4">
          {answerList.map((answer, index) => (
            <div
              key={answer.id}
              className="glass-card rounded-2xl p-6 border border-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="text-sm text-muted-foreground font-mono">
                  Questao {index + 1} • {answer.difficulty}
                </div>
                <div
                  className={
                    answer.isCorrect
                      ? "text-emerald-400 text-xs font-mono uppercase tracking-widest"
                      : "text-destructive text-xs font-mono uppercase tracking-widest"
                  }
                >
                  {answer.isCorrect ? "Correta" : answer.timedOut ? "Tempo esgotado" : "Errada"}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {answer.text}
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Sua resposta:{" "}
                  <span className="text-white">
                    {answer.selectedIndex === null || answer.selectedIndex === undefined
                      ? "Nenhuma"
                      : answer.options[answer.selectedIndex]}
                  </span>
                </p>
                <p>
                  Correta:{" "}
                  <span className="text-emerald-400">
                    {answer.options[answer.correctIndex]}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Explicacao: {answer.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
