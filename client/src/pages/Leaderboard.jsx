import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Trophy, ArrowLeft, Calendar, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getLeaderboard } from "@/lib/quizStorage";
import { getCurrentUser } from "@/lib/authStorage";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLocation("/auth");
      return;
    }
    const stored = getLeaderboard();
    setScores(stored);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-secondary/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Inicio
        </button>

        <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Hall da Fama
        </h1>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground animate-pulse">
              Buscando melhores pontuacoes...
            </p>
          </div>
        ) : scores.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">
            Nenhuma pontuacao registrada ainda. Seja o primeiro!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/50 border-b border-white/5">
                  <th className="p-6 font-mono text-xs uppercase tracking-wider text-muted-foreground w-20 text-center">
                    Posicao
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Jogador
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-wider text-muted-foreground text-right">
                    Pontos
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-wider text-muted-foreground text-right hidden md:table-cell">
                    Modo
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scores.map((entry, index) => {
                  const isTop3 = index < 3;
                  const medalColor =
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                        ? "text-gray-300"
                        : "text-amber-600";

                  return (
                    <motion.tr
                      key={entry.id || `${entry.nickname}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 md:p-6 text-center font-mono font-bold text-lg">
                        {isTop3 ? (
                          <Medal className={cn("w-6 h-6 mx-auto", medalColor)} />
                        ) : (
                          <span className="text-muted-foreground/50">
                            #{index + 1}
                          </span>
                        )}
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="font-bold text-white group-hover:text-primary transition-colors text-lg">
                          {entry.nickname}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-right font-mono font-bold text-primary text-lg">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="p-4 md:p-6 text-right text-muted-foreground hidden md:table-cell text-xs">
                        {entry.mode || "padrao"}
                      </td>
                      <td className="p-4 md:p-6 text-right text-muted-foreground text-sm hidden sm:table-cell">
                        <span className="flex items-center justify-end gap-2">
                          <Calendar className="w-3 h-3 opacity-50" />
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
