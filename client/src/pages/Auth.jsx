import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "@/lib/authStorage";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) {
      setLocation("/");
    }
  }, [setLocation]);

  const resetErrors = () => setError("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetErrors();

    if (!emailRegex.test(email)) {
      setError("Informe um email valido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (mode === "register") {
      if (!nickname.trim()) {
        setError("Informe um apelido para o ranking.");
        return;
      }
      if (nickname.trim().length > 15) {
        setError("O apelido deve ter 15 caracteres ou menos.");
        return;
      }
      if (password !== confirm) {
        setError("A confirmacao de senha nao confere.");
        return;
      }
      if (!acceptTerms) {
        setError("Aceite os termos e politicas para continuar.");
        return;
      }
    }

    setIsLoading(true);
    const response =
      mode === "register"
        ? await registerUser({ email, password, acceptTerms, nickname })
        : await loginUser({ email, password });

    setIsLoading(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }

    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border border-white/10 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-400 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">XD Plans</h1>
          <p className="text-muted-foreground text-sm">
            Crie sua conta ou entre para continuar o quiz.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              resetErrors();
            }}
            className={`px-4 py-2 rounded-xl font-mono text-sm border ${
              mode === "register"
                ? "bg-primary text-white border-primary"
                : "bg-secondary/50 border-border text-muted-foreground"
            }`}
          >
            Criar conta
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              resetErrors();
            }}
            className={`px-4 py-2 rounded-xl font-mono text-sm border ${
              mode === "login"
                ? "bg-primary text-white border-primary"
                : "bg-secondary/50 border-border text-muted-foreground"
            }`}
          >
            Entrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                Apelido (fixo no ranking)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                placeholder="ex: MestreDoCodigo99"
              />
              <p className="text-xs text-muted-foreground/80">
                Esse apelido nao podera ser alterado depois do cadastro.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-secondary/50 border-2 border-border rounded-xl pl-10 pr-4 py-3 font-mono"
                placeholder="voce@xdplans.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-secondary/50 border-2 border-border rounded-xl pl-10 pr-4 py-3 font-mono"
                placeholder="********"
              />
            </div>
          </div>

          {mode === "register" && (
            <>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  Confirmacao de senha
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="w-full bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 font-mono"
                  placeholder="********"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  Eu aceito os termos e politicas do quiz XD Plans.
                </span>
              </label>
            </>
          )}

          {error && (
            <div className="text-sm text-destructive font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
          >
            {isLoading
              ? "Processando..."
              : mode === "register"
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
