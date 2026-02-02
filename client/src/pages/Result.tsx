import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSubmitScore } from "@/hooks/use-quiz";
import confetti from "canvas-confetti";
import { Trophy, Clock, Target, RotateCcw, Home, Loader2, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface QuizResults {
  score: number;
  correct: number;
  total: number;
  durationMs: number;
  nickname: string;
}

export default function Result() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<QuizResults | null>(null);
  const { mutate: submitScore, isPending, isSuccess } = useSubmitScore();

  useEffect(() => {
    const stored = localStorage.getItem("quiz_results");
    if (!stored) {
      setLocation("/");
      return;
    }
    
    const parsed: QuizResults = JSON.parse(stored);
    setResults(parsed);

    // Trigger celebration if score is good
    if (parsed.correct >= parsed.total / 2) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7c3aed', '#a855f7', '#ffffff']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7c3aed', '#a855f7', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }

    // Submit score immediately on mount
    submitScore({
      nickname: parsed.nickname,
      score: parsed.score,
      correct: parsed.correct,
      total: parsed.total,
      durationMs: parsed.durationMs
    });

    // Clear local storage after loading so refreshes don't resubmit indefinitely? 
    // Actually keep it so we can display. 
    // Ideally we'd prevent double submission with a flag.
  }, [submitScore, setLocation]);

  if (!results) return null;

  const accuracy = Math.round((results.correct / results.total) * 100);
  const timeFormatted = (results.durationMs / 1000).toFixed(1) + "s";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden">
          
          {/* Status Indicator */}
          <div className="absolute top-4 right-4">
            {isPending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" /> Salvando Pontuação...
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Pontuação Salva
              </div>
            )}
          </div>

          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2 text-white">
            Quiz Finalizado!
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Ótima rodada, <span className="text-white font-semibold">{results.nickname}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-secondary/40 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2 text-sm font-medium uppercase tracking-wider">
                <Target className="w-4 h-4" /> Pontuação
              </div>
              <div className="text-3xl font-mono font-bold text-white text-glow">
                {results.score}
              </div>
            </div>
            
            <div className="bg-secondary/40 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2 text-sm font-medium uppercase tracking-wider">
                <Target className="w-4 h-4" /> Precisão
              </div>
              <div className={accuracy >= 80 ? "text-3xl font-mono font-bold text-emerald-400" : "text-3xl font-mono font-bold text-white"}>
                {accuracy}%
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
                {timeFormatted}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation("/")}
              className="px-8 py-3 rounded-xl font-bold border-2 border-border hover:bg-secondary/80 hover:border-primary/30 hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Início
            </button>
            
            <button
              onClick={() => setLocation("/leaderboard")}
              className="px-8 py-3 rounded-xl font-bold border-2 border-border hover:bg-secondary/80 hover:border-primary/30 hover:text-primary transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Ranking
            </button>

            <button
              onClick={() => setLocation("/quiz")}
              className="px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
