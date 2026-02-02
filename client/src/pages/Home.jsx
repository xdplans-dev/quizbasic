import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Terminal, Trophy, Play } from "lucide-react";
import { motion } from "framer-motion";
import { getQuizSettings, saveQuizSettings } from "@/lib/quizStorage";
import { getCurrentUser, logoutUser } from "@/lib/authStorage";

export default function Home() {
  const [speedMode, setSpeedMode] = useState("medium");
  const [difficultyMode, setDifficultyMode] = useState("medium");
  const [countMode, setCountMode] = useState("auto");
  const [customCount, setCustomCount] = useState(10);
  const [challengeMode, setChallengeMode] = useState("none");
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLocation("/auth");
      return;
    }
    setCurrentUser(user);
    const stored = getQuizSettings();
    if (!stored) return;
    if (stored.speedMode) setSpeedMode(stored.speedMode);
    if (stored.difficultyMode) setDifficultyMode(stored.difficultyMode);
    if (stored.challengeMode) setChallengeMode(stored.challengeMode);
    if (Number.isFinite(stored.questionCount)) {
      if (stored.questionCount === 0) {
        setCountMode("auto");
      } else if ([5, 10, 15].includes(stored.questionCount)) {
        setCountMode(String(stored.questionCount));
      } else {
        setCountMode("custom");
        setCustomCount(stored.questionCount);
      }
    }
  }, [setLocation]);

  const handleLogout = () => {
    logoutUser();
    setLocation("/auth");
  };

  const handleStart = (event) => {
    event.preventDefault();
    if (!currentUser) {
      setLocation("/auth");
      return;
    }

    const questionCount =
      countMode === "auto"
        ? 0
        : countMode === "custom"
          ? Math.max(0, Math.min(15, Number(customCount) || 0))
          : Number(countMode);

    saveQuizSettings({
      nickname: currentUser.nickname,
      speedMode,
      difficultyMode,
      questionCount,
      challengeMode,
    });

    setLocation("/quiz");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          {currentUser && (
            <div className="flex justify-center items-center gap-3 text-xs text-muted-foreground font-mono uppercase tracking-widest">
              <span>{currentUser.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-full border border-white/10 hover:border-primary/30 hover:text-primary transition-colors"
              >
                Sair
              </button>
            </div>
          )}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-tr from-primary to-purple-400 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/30"
          >
            <Terminal className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              XD Quiz<span className="text-primary">.br</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Monte seu modo de jogo e teste seus conhecimentos contra o relogio.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <form onSubmit={handleStart} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                NICKNAME DO RANKING
              </label>
              <div className="w-full bg-secondary/40 border-2 border-border rounded-xl px-5 py-4 text-lg font-mono">
                {currentUser?.nickname || "—"}
              </div>
              <p className="text-xs text-muted-foreground/80 ml-1">
                Seu nickname foi definido no cadastro e nao pode ser alterado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  Velocidade
                </label>
                <select
                  value={speedMode}
                  onChange={(event) => setSpeedMode(event.target.value)}
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                >
                  <option value="fast">Rapido (10s)</option>
                  <option value="medium">Medio (15s)</option>
                  <option value="slow">Lento (25s)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  Dificuldade
                </label>
                <select
                  value={difficultyMode}
                  onChange={(event) => setDifficultyMode(event.target.value)}
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                >
                  <option value="easy">Facil</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Dificil</option>
                  <option value="custom">Custom (mix)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  Quantidade
                </label>
                <select
                  value={countMode}
                  onChange={(event) => setCountMode(event.target.value)}
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                >
                  <option value="auto">Padrao (pela dificuldade)</option>
                  <option value="5">5 perguntas</option>
                  <option value="10">10 perguntas</option>
                  <option value="15">15 perguntas</option>
                  <option value="custom">Custom (0-15)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  Desafio
                </label>
                <select
                  value={challengeMode}
                  onChange={(event) => setChallengeMode(event.target.value)}
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                >
                  <option value="none">Sem desafio</option>
                  <option value="sudden_death">Morte subita</option>
                  <option value="perfect_run">Perfeito</option>
                  <option value="marathon">Maratona</option>
                  <option value="random_chaos">Caos aleatorio</option>
                </select>
              </div>
            </div>

            {countMode === "custom" && (
              <div className="space-y-2">
                <label htmlFor="customCount" className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  Quantidade custom (0-15)
                </label>
                <input
                  id="customCount"
                  type="number"
                  min="0"
                  max="15"
                  value={customCount}
                  onChange={(event) =>
                    setCustomCount(Math.max(0, Math.min(15, Number(event.target.value) || 0)))
                  }
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                />
                <p className="text-xs text-muted-foreground/80">
                  Use 0 para seguir o padrao da dificuldade.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLocation("/leaderboard")}
                className="w-full px-6 py-4 rounded-xl font-bold font-display border-2 border-border hover:bg-secondary/80 hover:border-primary/30 hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ranking
              </button>

              <button
                type="submit"
                className="w-full px-6 py-4 rounded-xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Comecar Quiz
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <p className="text-xs text-muted-foreground/50 font-mono">
            CONFIGURE E PRESSIONE COMECAR PARA INICIAR A SESSAO
          </p>
          <div className="pt-4 border-t border-white/5">
            <p className="text-sm font-medium text-muted-foreground/70">
              Desenvolvido por <span className="text-primary">David Xavier</span>
            </p>
            <p className="text-xs text-muted-foreground/40 font-mono uppercase tracking-widest">
              XD Plans
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
