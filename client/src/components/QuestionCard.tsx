import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  selectedOption: number | null;
  showResult: boolean;
}

export function QuestionCard({ question, onAnswer, selectedOption, showResult }: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-white/10 relative overflow-hidden group">
          
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500" />

          <h2 className="text-2xl md:text-3xl font-bold font-display mb-8 text-white leading-tight relative z-10">
            {question.text}
          </h2>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === question.correctIndex;
              
              let variant = "default";
              if (showResult) {
                if (isCorrect) variant = "correct";
                else if (isSelected && !isCorrect) variant = "wrong";
                else variant = "dimmed";
              } else if (isSelected) {
                variant = "selected";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showResult && onAnswer(idx)}
                  disabled={showResult}
                  className={cn(
                    "relative w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 group/btn font-mono text-base md:text-lg",
                    
                    // Default State
                    variant === "default" && "bg-secondary/40 border-border hover:border-primary/50 hover:bg-secondary/60 active:scale-[0.99]",
                    
                    // Selected State (before reveal)
                    variant === "selected" && "bg-primary/20 border-primary text-primary-foreground shadow-[0_0_15px_rgba(124,58,237,0.2)]",
                    
                    // Correct State (revealed)
                    variant === "correct" && "bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
                    
                    // Wrong State (revealed)
                    variant === "wrong" && "bg-destructive/20 border-destructive text-destructive-foreground shadow-[0_0_15px_rgba(239,68,68,0.2)]",
                    
                    // Dimmed State (revealed)
                    variant === "dimmed" && "bg-secondary/20 border-transparent opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-4">
                      <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border",
                        variant === "default" && "bg-background/50 border-white/10 text-muted-foreground group-hover/btn:border-primary/50 group-hover/btn:text-primary",
                        variant === "selected" && "bg-primary border-primary text-white",
                        variant === "correct" && "bg-emerald-500 border-emerald-500 text-white",
                        variant === "wrong" && "bg-destructive border-destructive text-white",
                        variant === "dimmed" && "bg-background/30 border-white/5 text-muted-foreground/50"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </span>
                    
                    {variant === "correct" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {variant === "wrong" && <XCircle className="w-6 h-6 text-destructive" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
