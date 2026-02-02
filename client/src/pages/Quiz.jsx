import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Timer } from "@/components/Timer";
import { QuestionCard } from "@/components/QuestionCard";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  calculateScore,
  formatModeLabel,
  generateQuiz,
  getQuestionDuration,
} from "@/lib/quizEngine";
import {
  getQuizSettings,
  getSessionConfig,
  saveLeaderboardEntry,
  saveQuizResults,
} from "@/lib/quizStorage";
import { getCurrentUser } from "@/lib/authStorage";
import { getUserProfile } from "@/lib/userProfileStorage";

const REVEAL_DELAY_MS = 1300;

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

function getAgeGroup(age) {
  if (!Number.isFinite(age)) return "sem_dados";
  if (age <= 25) return "0-25";
  if (age <= 50) return "26-50";
  if (age <= 75) return "51-75";
  return "76+";
}

function resolveModeId(settings) {
  if (settings.modeId) return settings.modeId;
  if (settings.challengeMode === "sudden_death") return "suddenDeath";
  if (settings.challengeMode === "time_attack") return "timeAttack";
  if (settings.challengeMode === "daily_challenge") return "dailyChallenge";
  return "custom";
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [resetTimerKey, setResetTimerKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [endedEarly, setEndedEarly] = useState(false);
  const [endedByTime, setEndedByTime] = useState(false);
  const [globalTimerKey, setGlobalTimerKey] = useState(0);

  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const streakRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const answersRef = useRef([]);
  const currentUserRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.nickname) {
      setLocation("/auth");
      return;
    }
    currentUserRef.current = user;
    const settings = getSessionConfig() || getQuizSettings();
    if (!settings) {
      setLocation("/");
      return;
    }
    const generated = generateQuiz({
      ...settings,
      nickname: user.nickname,
    });
    setQuiz(generated);
    const initialDuration =
      generated.settings.challengeMode === "time_attack"
        ? Number(generated.settings.timeLimit) || 60
        : getQuestionDuration(generated.settings, 0);
    setTimeLeft(initialDuration);
  }, [setLocation]);

  const currentQuestion = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const progress = totalQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const isTimeAttack = quiz?.settings?.challengeMode === "time_attack";
  const currentDuration = quiz
    ? isTimeAttack
      ? Number(quiz.settings.timeLimit) || 60
      : getQuestionDuration(quiz.settings, currentIndex)
    : 0;

  useEffect(() => {
    if (!quiz || !isTimeAttack) return;
    setTimeLeft(currentDuration);
  }, [quiz, isTimeAttack, currentDuration, globalTimerKey]);

  useEffect(() => {
    if (!quiz || !isTimeAttack) return;
    setGlobalTimerKey((prev) => prev + 1);
  }, [quiz, isTimeAttack]);

  useEffect(() => {
    if (!quiz || isTimeAttack) return;
    setTimeLeft(currentDuration);
  }, [quiz, isTimeAttack, currentDuration, resetTimerKey]);

  const updateScore = useCallback((points) => {
    scoreRef.current += points;
    setScore(scoreRef.current);
  }, []);

  const updateCorrect = useCallback((isCorrect) => {
    if (isCorrect) {
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
    }
  }, []);

  const updateStreak = useCallback((isCorrect) => {
    streakRef.current = isCorrect ? streakRef.current + 1 : 0;
    setStreak(streakRef.current);
    return streakRef.current;
  }, []);

  const finishGame = useCallback((options = {}) => {
    if (!quiz) return;
    const durationMs = Date.now() - startTimeRef.current;
    const total = quiz.questions.length;
    let finalScore = scoreRef.current;
    let perfectRunBonus = 0;
    const endedEarlyValue =
      typeof options.endedEarly === "boolean" ? options.endedEarly : endedEarly;
    const endedByTimeValue =
      typeof options.endedByTime === "boolean" ? options.endedByTime : endedByTime;
    const currentUser = currentUserRef.current;
    const userProfile = getUserProfile(currentUser?.id);
    const age = calculateAge(userProfile?.birthDate);
    const ageGroup = getAgeGroup(age);
    const modeId = resolveModeId(quiz.settings);

    if (quiz.settings.challengeMode === "perfect_run" && correctRef.current === total) {
      perfectRunBonus = Math.floor(finalScore * 0.25);
      finalScore += perfectRunBonus;
    }

    const results = {
      id: `result_${Date.now()}`,
      nickname: quiz.settings.nickname,
      score: finalScore,
      rawScore: scoreRef.current,
      correct: correctRef.current,
      total,
      durationMs,
      modeLabel: formatModeLabel(quiz.settings),
      settings: quiz.settings,
      answers: answersRef.current,
      perfectRunBonus,
      endedEarly: endedEarlyValue,
      endedByTime: endedByTimeValue,
      date: new Date().toISOString(),
    };

    saveQuizResults(results);
    saveLeaderboardEntry({
      id: results.id,
      nickname: results.nickname,
      score: results.score,
      mode: results.modeLabel,
      date: results.date,
      userId: currentUser?.id || "",
      fullName: userProfile?.fullName || "",
      modeId,
      difficultyMode: quiz.settings.difficultyMode,
      speedMode: quiz.settings.speedMode,
      challengeMode: quiz.settings.challengeMode,
      age,
      ageGroup,
    });

    setLocation("/result");
  }, [endedByTime, endedEarly, quiz, setLocation]);

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      if (!isTimeAttack) {
        setResetTimerKey((prev) => prev + 1);
      }
    } else {
      finishGame();
    }
  }, [currentIndex, finishGame, isTimeAttack, quiz]);

  const recordAnswer = useCallback(
    (index, timedOut = false) => {
      if (!quiz || !currentQuestion) return;
      if (isAnswerRevealed) return;

      const isCorrect = index === currentQuestion.correctIndex;
      const nextStreak = updateStreak(isCorrect);
      const safeTimeLeft = Math.max(0, Math.min(timeLeft, currentDuration));
      const scoring = isCorrect
        ? calculateScore({
            difficulty: currentQuestion.difficulty,
            speedMode: quiz.settings.speedMode,
            timeLeft: safeTimeLeft,
            timeTotal: currentDuration,
            streak: nextStreak,
            chaos: quiz.settings.chaos,
          })
        : null;

      let totalPoints = scoring?.total || 0;
      let suddenDeathMultiplier = 1;
      let suddenDeathBonus = 0;

      if (isCorrect && scoring && quiz.settings.challengeMode === "sudden_death") {
        suddenDeathMultiplier = 1 + nextStreak * 0.1;
        totalPoints = Math.round(scoring.total * suddenDeathMultiplier);
        suddenDeathBonus = totalPoints - scoring.total;
      }

      if (isCorrect && scoring) {
        updateScore(totalPoints);
        updateCorrect(true);
      }

      const answerRecord = {
        id: currentQuestion.id,
        text: currentQuestion.text,
        options: currentQuestion.options,
        correctIndex: currentQuestion.correctIndex,
        explanation: currentQuestion.explanation,
        difficulty: currentQuestion.difficulty,
        selectedIndex: index,
        isCorrect,
        timedOut,
        timeLeft: safeTimeLeft,
        timeTotal: currentDuration,
        points: totalPoints,
        basePoints: scoring?.basePoints || 0,
        timeBonus: scoring?.timeBonus || 0,
        streakBonus: scoring?.streakBonus || 0,
        suddenDeathMultiplier,
        suddenDeathBonus,
      };

      const nextAnswers = [...answersRef.current];
      nextAnswers[currentIndex] = answerRecord;
      answersRef.current = nextAnswers;

      setSelectedOption(index);
      setIsAnswerRevealed(true);

      if (quiz.settings.challengeMode === "sudden_death" && !isCorrect) {
        setEndedEarly(true);
        setTimeout(() => finishGame({ endedEarly: true }), REVEAL_DELAY_MS);
        return;
      }

      setTimeout(() => handleNextQuestion(), REVEAL_DELAY_MS);
    },
    [
      currentDuration,
      currentIndex,
      currentQuestion,
      finishGame,
      handleNextQuestion,
      isAnswerRevealed,
      quiz,
      timeLeft,
      updateCorrect,
      updateScore,
      updateStreak,
    ],
  );

  const handleAnswer = (index) => {
    recordAnswer(index, false);
  };

  const handleTimeout = useCallback(() => {
    if (!quiz) return;
    if (quiz.settings.challengeMode === "time_attack") {
      setEndedByTime(true);
      finishGame({ endedByTime: true });
      return;
    }
    recordAnswer(null, true);
  }, [finishGame, quiz, recordAnswer]);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-mono">
            PREPARANDO DESAFIO...
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center border-destructive/50">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro ao carregar quiz</h2>
          <p className="text-muted-foreground mb-6">
            Nao encontramos perguntas suficientes para esse modo.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-0 z-50 bg-background/80 backdrop-blur-lg py-4 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold font-mono text-primary border border-white/5">
            {currentIndex + 1}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Questao
            </span>
            <span className="text-sm font-medium text-white/80">
              de {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            {formatModeLabel(quiz.settings)}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Pontos
            </span>
            <span className="text-xl font-mono font-bold text-primary text-glow">
              {score}
            </span>
            {streak > 1 && (
              <span className="text-xs text-emerald-400 font-mono">
                Streak {streak}x
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <Timer
          duration={currentDuration}
          onTimeout={handleTimeout}
          isRunning={!isAnswerRevealed}
          resetKey={isTimeAttack ? globalTimerKey : resetTimerKey}
          onTick={setTimeLeft}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center pb-20">
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          selectedOption={selectedOption}
          showResult={isAnswerRevealed}
        />
      </div>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-secondary">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
