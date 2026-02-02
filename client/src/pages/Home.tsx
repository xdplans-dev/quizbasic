import { useState } from "react";
import { useLocation } from "wouter";
import { Terminal, Trophy, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("Por favor, insira um apelido para começar");
      return;
    }
    if (nickname.length > 15) {
      setError("O apelido deve ter 15 caracteres ou menos");
      return;
    }
    
    // Store in localStorage or pass via URL. 
    // Using URL param is cleaner for stateless refresh but localStorage works better across components here.
    localStorage.setItem("quiz_nickname", nickname);
    setLocation("/quiz");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
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
            <p className="text-muted-foreground text-lg">Teste seus conhecimentos de programação contra o relógio.</p>
          </motion.div>
        </div>

        {/* Card Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden"
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <form onSubmit={handleStart} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-muted-foreground ml-1">
                INSIRA SEU APELIDO
              </label>
              <div className="relative group">
                <input
                  id="nickname"
                  type="text"
                  placeholder="ex: MestreDoCodigo99"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-5 py-4 text-lg font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  autoComplete="off"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium ml-1 animate-in slide-in-from-top-1 fade-in">
                  {error}
                </p>
              )}
            </div>

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
                Começar Quiz
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <p className="text-xs text-muted-foreground/50 font-mono">
            PRESSIONE COMEÇAR PARA INICIAR A SESSÃO
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
