import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function Timer({ duration, onTimeout, isRunning, resetKey, onTick }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timeoutTriggeredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(duration);
    timeoutTriggeredRef.current = false;
    if (onTick) onTick(duration);
  }, [resetKey, duration, onTick]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
        if (onTick) onTick(next);
        if (next <= 0 && !timeoutTriggeredRef.current) {
          timeoutTriggeredRef.current = true;
          onTimeout();
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, onTick, onTimeout]);

  const percentage = duration > 0 ? (timeLeft / duration) * 100 : 0;
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
          className={`h-full ${
            isUrgent
              ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              : "bg-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
    </div>
  );
}
