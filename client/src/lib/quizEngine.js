import QUESTIONS from "@/data/questions";

export const SPEEDS = {
  fast: 10,
  medium: 15,
  slow: 25,
};

export const SPEED_MULTIPLIER = {
  slow: 1.0,
  medium: 1.2,
  fast: 1.5,
};

export const BASE_POINTS = {
  easy: 100,
  medium: 200,
  hard: 350,
};

export const SPEED_LABELS = {
  fast: "rapido",
  medium: "medio",
  slow: "lento",
};

export const DIFFICULTY_LABELS = {
  easy: "facil",
  medium: "medio",
  hard: "dificil",
  custom: "custom",
};

export const CHALLENGE_LABELS = {
  none: "sem desafio",
  sudden_death: "morte subita",
  perfect_run: "perfeito",
  marathon: "maratona",
  random_chaos: "caos aleatorio",
  time_attack: "contra o tempo",
  daily_challenge: "desafio diario",
};

const CHAOS_MODIFIERS = [
  {
    id: "time_rush",
    label: "Relogio instavel (-15% tempo)",
    timeMultiplier: 0.85,
  },
  {
    id: "score_boost",
    label: "Pontuacao turbinada (+20%)",
    scoreMultiplier: 1.2,
  },
  {
    id: "streak_overdrive",
    label: "Streak agressivo (+15 ate 150)",
    streakStep: 15,
    streakCap: 150,
  },
  {
    id: "no_time_bonus",
    label: "Sem bonus de tempo",
    disableTimeBonus: true,
  },
];

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createRng(seed) {
  let value = Math.abs(Number(seed) || Date.now()) % 2147483647;
  if (value === 0) value = 123456;
  return () => {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
}

function shuffle(list, rng) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function resolveQuestionCount(difficultyMode, questionCount) {
  const baseCount =
    difficultyMode === "easy"
      ? 5
      : difficultyMode === "hard"
        ? 15
        : 10;
  return questionCount > 0 ? questionCount : baseCount;
}

function pickQuestionsByDifficulty(bank, difficulty, count, rng) {
  const pool = shuffle(
    bank.filter((q) => q.difficulty === difficulty),
    rng,
  );
  const selected = pool.slice(0, count);
  const selectedIds = new Set(selected.map((q) => q.id));
  if (selected.length < count) {
    const remaining = shuffle(
      bank.filter((q) => !selectedIds.has(q.id)),
      rng,
    );
    selected.push(...remaining.slice(0, count - selected.length));
  }
  return selected;
}

function pickMixedQuestions(bank, count, rng) {
  const per = Math.floor(count / 3);
  const remainder = count % 3;
  const difficulties = shuffle(["easy", "medium", "hard"], rng);
  const counts = { easy: per, medium: per, hard: per };
  for (let i = 0; i < remainder; i += 1) {
    counts[difficulties[i]] += 1;
  }

  const picked = [];
  const usedIds = new Set();
  ["easy", "medium", "hard"].forEach((difficulty) => {
    const selection = pickQuestionsByDifficulty(bank, difficulty, counts[difficulty], rng);
    selection.forEach((q) => {
      if (!usedIds.has(q.id)) {
        picked.push(q);
        usedIds.add(q.id);
      }
    });
  });

  if (picked.length < count) {
    const remaining = shuffle(
      bank.filter((q) => !usedIds.has(q.id)),
      rng,
    );
    picked.push(...remaining.slice(0, count - picked.length));
  }

  return shuffle(picked, rng).slice(0, count);
}

function applyRandomChaos(settings, rng) {
  const randomCount = Math.floor(rng() * 16);
  const modifier = CHAOS_MODIFIERS[Math.floor(rng() * CHAOS_MODIFIERS.length)];

  return {
    ...settings,
    questionCount: randomCount,
    chaos: {
      ...modifier,
      randomCount,
    },
  };
}

export function normalizeSettings(input) {
  const speedMode = input.speedMode || "medium";
  const difficultyMode = input.difficultyMode || "medium";
  const challengeMode = input.challengeMode || "none";
  const questionCount = clampNumber(
    Number.isFinite(input.questionCount) ? input.questionCount : 0,
    0,
    15,
  );
  const timeLimit = Number.isFinite(input.timeLimit) ? input.timeLimit : null;

  return {
    nickname: input.nickname || "",
    speedMode,
    difficultyMode,
    challengeMode,
    questionCount,
    seed: input.seed || Date.now(),
    timeLimit,
    modeId: input.modeId || "",
    dailySeed: input.dailySeed || "",
  };
}

export function generateQuiz(settingsInput) {
  let settings = normalizeSettings(settingsInput);
  const rng = createRng(settings.seed);

  if (settings.challengeMode === "random_chaos") {
    settings = applyRandomChaos(settings, rng);
  }

  const resolvedCount = resolveQuestionCount(
    settings.difficultyMode,
    settings.questionCount,
  );

  const selectedQuestions =
    settings.difficultyMode === "custom"
      ? pickMixedQuestions(QUESTIONS, resolvedCount, rng)
      : pickQuestionsByDifficulty(QUESTIONS, settings.difficultyMode, resolvedCount, rng);

  return {
    settings: {
      ...settings,
      questionCount: resolvedCount,
    },
    questions: selectedQuestions,
  };
}

export function getQuestionDuration(settings, questionIndex) {
  const base = SPEEDS[settings.speedMode] || 15;
  let duration = base;

  if (settings.challengeMode === "marathon") {
    duration = Math.max(5, base - Math.floor(questionIndex / 5));
  }

  if (settings.chaos?.timeMultiplier) {
    duration = Math.max(5, Math.round(duration * settings.chaos.timeMultiplier));
  }

  return duration;
}

export function calculateScore({
  difficulty,
  speedMode,
  timeLeft,
  timeTotal,
  streak,
  chaos,
}) {
  const basePoints = BASE_POINTS[difficulty] || 100;
  const speedMultiplier = SPEED_MULTIPLIER[speedMode] || 1;
  const ratio = timeTotal > 0 ? clampNumber(timeLeft / timeTotal, 0, 1) : 0;
  const timeBonus = chaos?.disableTimeBonus ? 0 : Math.floor(ratio * 50);
  const streakStep = chaos?.streakStep || 10;
  const streakCap = chaos?.streakCap || 100;
  const streakBonus = Math.min(streak * streakStep, streakCap);
  const raw = Math.floor((basePoints + timeBonus + streakBonus) * speedMultiplier);
  const scoreMultiplier = chaos?.scoreMultiplier || 1;
  const total = Math.floor(raw * scoreMultiplier);

  return {
    total,
    basePoints,
    timeBonus,
    streakBonus,
    speedMultiplier,
    scoreMultiplier,
  };
}

export function formatModeLabel(settings) {
  const speed = SPEED_LABELS[settings.speedMode] || "medio";
  const difficulty = DIFFICULTY_LABELS[settings.difficultyMode] || "medio";
  const count = settings.questionCount ? `${settings.questionCount}Q` : "padrao";
  const challenge = CHALLENGE_LABELS[settings.challengeMode] || "sem desafio";
  const chaos = settings.chaos?.label ? ` • ${settings.chaos.label}` : "";
  const timeLimitLabel =
    settings.challengeMode === "time_attack" && settings.timeLimit
      ? ` • ${settings.timeLimit}s total`
      : "";
  const dailyLabel =
    settings.challengeMode === "daily_challenge" && settings.dailySeed
      ? ` • ${settings.dailySeed}`
      : "";
  return `${speed} • ${difficulty} • ${count} • ${challenge}${timeLimitLabel}${dailyLabel}${chaos}`;
}
