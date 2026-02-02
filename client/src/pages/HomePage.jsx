import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Terminal, Trophy, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import gameModes from "@/data/gameModes";
import { ModeCard } from "@/components/ModeCard";
import { getCurrentUser, logoutUser } from "@/lib/authStorage";
import { saveSessionConfig } from "@/lib/quizStorage";

function getDailySeed(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const iso = `${year}-${month}-${day}`;
  const numeric = Number(iso.replace(/-/g, ""));
  return {
    dailySeed: iso,
    seedNumber: Number.isNaN(numeric) ? Date.now() : numeric,
  };
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedModeId, setSelectedModeId] = useState(
    gameModes[0]?.id || "classic",
  );

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLocation("/auth");
      return;
    }
    setCurrentUser(user);
  }, [setLocation]);

  const selectedMode = useMemo(
    () => gameModes.find((mode) => mode.id === selectedModeId) || gameModes[0],
    [selectedModeId],
  );

  const handleLogout = () => {
    logoutUser();
    setLocation("/auth");
  };

  const handlePlay = (mode) => {
    if (!currentUser) {
      setLocation("/auth");
      return;
    }

    if (mode.routeAction?.type === "custom") {
      setLocation("/custom");
      return;
    }

    const defaults = mode.defaults || {};
    const { dailySeed, seedNumber } = getDailySeed();
    const seed = mode.id === "dailyChallenge" ? seedNumber : Date.now();

    const sessionConfig = {
      nickname: currentUser.nickname,
      speedMode: defaults.speedMode || "medium",
      difficultyMode: defaults.difficultyMode || "medium",
      questionCount: Number.isFinite(defaults.questionCount)
        ? defaults.questionCount
        : 0,
      challengeMode: defaults.challengeMode || "none",
      timeLimit: Number.isFinite(defaults.timeLimit) ? defaults.timeLimit : null,
      seed,
      modeId: mode.id,
      dailySeed: mode.id === "dailyChallenge" ? dailySeed : "",
    };

    saveSessionConfig(sessionConfig);
    setLocation("/play");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Enter") return;
      const tagName = event.target?.tagName;
      if (["INPUT", "TEXTAREA", "BUTTON", "SELECT", "A"].includes(tagName)) {
        return;
      }
      if (selectedMode) {
        handlePlay(selectedMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMode, currentUser]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-14 h-14 bg-gradient-to-tr from-primary to-purple-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30"
              >
                <Terminal className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold font-display text-white">
                  XD Quiz<span className="text-primary">.br</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Escolha seu modo e comece a rodada.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {currentUser && (
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  {currentUser.nickname} • {currentUser.email}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setLocation("/leaderboard")}
                  className="px-4 py-2 rounded-xl font-mono text-xs border border-border hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Ranking
                </button>
                <button
                  type="button"
                  onClick={() => setLocation("/settings")}
                  className="px-4 py-2 rounded-xl font-mono text-xs border border-border hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl font-mono text-xs border border-border hover:border-destructive/40 hover:text-destructive transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              Modos de Jogo
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecione um card e pressione Enter para jogar.
            </p>
          </div>
          {selectedMode && (
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              Selecionado: {selectedMode.title}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {gameModes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              isSelected={mode.id === selectedModeId}
              onSelect={setSelectedModeId}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
