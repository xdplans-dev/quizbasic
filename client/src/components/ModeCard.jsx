import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModeCard({ mode, isSelected, onSelect, onPlay }) {
  const handleSelect = () => onSelect(mode.id);
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(mode.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "glass-card rounded-3xl p-6 border border-white/10 transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-primary/70",
        isSelected
          ? "ring-2 ring-primary/80 shadow-[0_0_25px_rgba(124,58,237,0.35)]"
          : "hover:border-primary/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]",
      )}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl mb-3">{mode.icon}</div>
          <h3 className="text-xl font-bold font-display text-white mb-1">{mode.title}</h3>
          <p className="text-sm text-muted-foreground">{mode.description}</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 font-mono">
          {isSelected ? "Selecionado" : "Modo"}
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-muted-foreground font-mono">
        {mode.rules.map((rule) => (
          <li key={rule} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            {rule}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPlay(mode);
          }}
          className="w-full px-6 py-3 rounded-xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
        >
          PLAY
        </button>
      </div>
    </motion.div>
  );
}
