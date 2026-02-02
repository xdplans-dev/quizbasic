import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  duration: number; // in seconds
  onTimeout: () => void;
  isRunning: boolean;
  resetKey: number; // Increment to reset timer
}

export function Timer({ duration, onTimeout, isRunning, resetKey }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeout]);

  const percentage = (timeLeft / duration) * 100;
  const isUrgent = timeLeft < 5;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end text-sm font-mono font-medium tracking-wider">
        <span className={isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"}>
          TEMPO RESTANTE
        </span>
        <span className={isUrgent ? "text-destructive text-xl" : "text-primary text-xl"}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      
      <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <motion.div
          className={`h-full ${isUrgent ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]"}`}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
    </div>
  );
}
