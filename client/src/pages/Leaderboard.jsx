import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Trophy, ArrowLeft, Calendar, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getLeaderboard } from "@/lib/quizStorage";
import { getCurrentUser } from "@/lib/authStorage";
import { getUserProfile } from "@/lib/userProfileStorage";
import gameModes from "@/data/gameModes";

const LEVEL_LABELS = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
  custom: "Custom",
};

const AGE_GROUP_LABELS = {
  "0-25": "0-25",
  "26-50": "26-50",
  "51-75": "51-75",
  "76+": "76+",
  sem_dados: "Sem dados",
};

function normalizeLabel(value) {
  return String(value || "").toLowerCase();
}

function resolveModeId(entry) {
  if (entry.modeId) return entry.modeId;
  if (entry.challengeMode === "sudden_death") return "suddenDeath";
  if (entry.challengeMode === "time_attack") return "timeAttack";
  if (entry.challengeMode === "daily_challenge") return "dailyChallenge";
  const label = normalizeLabel(entry.mode);
  if (label.includes("morte")) return "suddenDeath";
  if (label.includes("contra")) return "timeAttack";
  if (label.includes("diario")) return "dailyChallenge";
  return "custom";
}

function resolveDifficulty(entry) {
  if (entry.difficultyMode) return entry.difficultyMode;
  const label = normalizeLabel(entry.mode);
  if (label.includes("facil")) return "easy";
  if (label.includes("dificil")) return "hard";
  if (label.includes("custom")) return "custom";
  if (label.includes("medio")) return "medium";
  return "";
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age;
}

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("global");
  const [modeFilter, setModeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");

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

  const modeOptions = useMemo(
    () => [
      { id: "all", label: "Todos os modos" },
      ...gameModes.map((mode) => ({ id: mode.id, label: mode.title })),
    ],
    [],
  );

  const filteredScores = useMemo(() => {
    let list = scores;
    if (filterType === "mode" && modeFilter !== "all") {
      list = list.filter((entry) => resolveModeId(entry) === modeFilter);
    }
    if (filterType === "level" && levelFilter !== "all") {
      list = list.filter((entry) => resolveDifficulty(entry) === levelFilter);
    }
    if (filterType === "age" && ageFilter !== "all") {
      list = list.filter((entry) => (entry.ageGroup || "sem_dados") === ageFilter);
    }
    return list;
  }, [scores, filterType, modeFilter, levelFilter, ageFilter]);

  const profilesById = useMemo(() => {
    const map = {};
    scores.forEach((entry) => {
      if (!entry.userId || map[entry.userId]) return;
      map[entry.userId] = getUserProfile(entry.userId);
    });
    return map;
  }, [scores]);

  const modeLabelById = useMemo(
    () =>
      gameModes.reduce((acc, mode) => {
        acc[mode.id] = mode.title;
        return acc;
      }, {}),
    [],
  );

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
          Ranking Mundial
        </h1>
      </motion.div>

      <div className="glass-card rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "global", label: "Geral" },
            { id: "mode", label: "Por modo" },
            { id: "level", label: "Por nivel" },
            { id: "age", label: "Por idade" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilterType(option.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-widest border transition-colors",
                filterType === option.id
                  ? "bg-primary text-white border-primary"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-primary hover:border-primary/40",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {filterType === "mode" && (
            <select
              value={modeFilter}
              onChange={(event) => setModeFilter(event.target.value)}
              className="w-full sm:w-64 bg-secondary/50 border-2 border-border rounded-xl px-4 py-2 font-mono text-sm"
            >
              {modeOptions.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          )}
          {filterType === "level" && (
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="w-full sm:w-64 bg-secondary/50 border-2 border-border rounded-xl px-4 py-2 font-mono text-sm"
            >
              <option value="all">Todos os niveis</option>
              <option value="easy">Facil</option>
              <option value="medium">Medio</option>
              <option value="hard">Dificil</option>
              <option value="custom">Custom</option>
            </select>
          )}
          {filterType === "age" && (
            <select
              value={ageFilter}
              onChange={(event) => setAgeFilter(event.target.value)}
              className="w-full sm:w-64 bg-secondary/50 border-2 border-border rounded-xl px-4 py-2 font-mono text-sm"
            >
              <option value="all">Todas as idades</option>
              <option value="0-25">0-25</option>
              <option value="26-50">26-50</option>
              <option value="51-75">51-75</option>
              <option value="76+">76+</option>
              <option value="sem_dados">Sem dados</option>
            </select>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground animate-pulse">
              Buscando melhores pontuacoes...
            </p>
          </div>
        ) : filteredScores.length === 0 ? (
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
                    {filterType === "level"
                      ? "Nivel"
                      : filterType === "age"
                        ? "Faixa"
                        : "Modo"}
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredScores.map((entry, index) => {
                  const isTop3 = index < 3;
                  const medalColor =
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                        ? "text-gray-300"
                        : "text-amber-600";
                  const medalEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                  const profile = profilesById[entry.userId];
                  const fullName = entry.fullName || profile?.fullName || entry.nickname;
                  const ageValue = Number.isFinite(entry.age)
                    ? entry.age
                    : calculateAge(profile?.birthDate);
                  const resolvedModeId = resolveModeId(entry);
                  const modeLabel = modeLabelById[resolvedModeId] || "Personalizado";
                  const levelLabel =
                    LEVEL_LABELS[resolveDifficulty(entry)] || "Indefinido";
                  const ageLabel =
                    AGE_GROUP_LABELS[entry.ageGroup || "sem_dados"] || "Sem dados";

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
                        {isTop3 && (
                          <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                            {medalEmoji} {fullName}
                            {Number.isFinite(ageValue) ? `, ${ageValue}` : ""}
                          </div>
                        )}
                        <div className="font-bold text-white group-hover:text-primary transition-colors text-lg">
                          {entry.nickname}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-right font-mono font-bold text-primary text-lg">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="p-4 md:p-6 text-right text-muted-foreground hidden md:table-cell text-xs">
                        {filterType === "level"
                          ? levelLabel
                          : filterType === "age"
                            ? ageLabel
                            : modeLabel}
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
