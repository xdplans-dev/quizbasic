import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Save, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/authStorage";
import { getUserProfile, saveUserProfile } from "@/lib/userProfileStorage";
import { getLeaderboard } from "@/lib/quizStorage";

const MOTIVATIONAL_PHRASES = [
  "Voce esta no caminho, continue jogando.",
  "Boa! Mais uma rodada e voce sobe.",
  "Nao desista, seu top 3 esta proximo.",
  "Consistencia vence, mantenha o ritmo.",
  "Seu proximo recorde esta a uma rodada.",
  "Treino forte, resultado vem rapido.",
  "Cada partida conta, segue firme.",
  "Foco total, voce vai chegar la.",
];

function hashString(value) {
  const text = String(value || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickMotivation(seed) {
  const hash = hashString(seed);
  return MOTIVATIONAL_PHRASES[hash % MOTIVATIONAL_PHRASES.length];
}

export default function UserSettings() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLocation("/auth");
      return;
    }
    setCurrentUser(user);
    const stored = getUserProfile(user.id);
    if (stored) {
      setFullName(stored.fullName || "");
      setBirthDate(stored.birthDate || "");
      setAddress(stored.address || "");
    }
    setLeaderboardEntries(getLeaderboard());
  }, [setLocation]);

  const rankInfo = useMemo(() => {
    if (!currentUser) return { rank: null, entry: null };
    const list = leaderboardEntries || [];
    const byUserId = list.findIndex((entry) => entry.userId === currentUser.id);
    const byNickname = list.findIndex((entry) => entry.nickname === currentUser.nickname);
    const index = byUserId >= 0 ? byUserId : byNickname;
    if (index < 0) return { rank: null, entry: null };
    return { rank: index + 1, entry: list[index] };
  }, [currentUser, leaderboardEntries]);

  const motivationalText = useMemo(() => {
    if (!currentUser) return "";
    const seed = `${currentUser.id}-${new Date().toDateString()}`;
    return pickMotivation(seed);
  }, [currentUser]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!currentUser) return;
    saveUserProfile(currentUser.id, {
      fullName: fullName.trim(),
      birthDate,
      address: address.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border border-white/10 w-full max-w-2xl"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-white">
                Configuracoes do usuario
              </h1>
              <p className="text-muted-foreground text-sm">
                Atualize seus dados pessoais.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground font-mono uppercase tracking-widest">
            {currentUser?.nickname || "—"}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-4 md:p-5 mb-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Status no ranking
          </div>
          {rankInfo.rank && rankInfo.rank <= 3 ? (
            <div className="mt-2 text-sm text-emerald-400 font-mono uppercase tracking-widest">
              Parabens, mantenha-se no topo. Entraremos em contato em breve.
            </div>
          ) : rankInfo.rank ? (
            <div className="mt-2 text-sm text-muted-foreground font-mono uppercase tracking-widest">
              Rank #{rankInfo.rank} • {motivationalText}
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground font-mono uppercase tracking-widest">
              Sem ranking ainda. Jogue uma partida para entrar.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                Nome e sobrenome
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                placeholder="ex: Ana Silva"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                Data de nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
              Endereco
            </label>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
              placeholder="Rua, numero, bairro, cidade"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 font-mono uppercase tracking-widest">
                Dados salvos
              </span>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
