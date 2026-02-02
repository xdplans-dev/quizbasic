const gameModes = [
  {
    id: "classic",
    title: "Classico",
    description: "Modo padrao para aquecer e testar conhecimento geral.",
    rules: ["10 perguntas", "15s por pergunta", "Dificuldade media"],
    defaults: {
      speedMode: "medium",
      difficultyMode: "medium",
      questionCount: 10,
      challengeMode: "none",
    },
    routeAction: { type: "play" },
    icon: "🎮",
  },
  {
    id: "suddenDeath",
    title: "Morte Subita",
    description: "Errou uma, acabou. Jogue em streaks perfeitos.",
    rules: ["Errou = fim imediato", "Multiplicador por streak", "Dificuldade media"],
    defaults: {
      speedMode: "medium",
      difficultyMode: "medium",
      questionCount: 10,
      challengeMode: "sudden_death",
    },
    routeAction: { type: "play" },
    icon: "💀",
  },
  {
    id: "timeAttack",
    title: "Contra o Tempo",
    description: "O cronometro e global. Responda o maximo possivel.",
    rules: ["Tempo total 60/90/120s", "Segue ate o tempo acabar", "Dificuldade media"],
    defaults: {
      speedMode: "medium",
      difficultyMode: "medium",
      questionCount: 15,
      challengeMode: "time_attack",
      timeLimit: 60,
    },
    routeAction: { type: "play" },
    icon: "⏱️",
  },
  {
    id: "dailyChallenge",
    title: "Desafio Diario",
    description: "Seed diaria com ranking dedicado.",
    rules: ["Seed diaria", "Ranking diario", "10 perguntas"],
    defaults: {
      speedMode: "medium",
      difficultyMode: "medium",
      questionCount: 10,
      challengeMode: "daily_challenge",
    },
    routeAction: { type: "play" },
    icon: "📅",
  },
  {
    id: "custom",
    title: "Personalizado",
    description: "Monte seu modo com velocidade, dificuldade e desafios.",
    rules: ["Ajuste livre", "Mix de dificuldades", "Salva seu preset"],
    routeAction: { type: "custom" },
    icon: "🧩",
  },
];

export default gameModes;
