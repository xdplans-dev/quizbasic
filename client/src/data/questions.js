const QUESTIONS = [
  {
    id: 1,
    text: "O que significa HTML?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "HTML e a linguagem de marcacao usada para estruturar paginas web.",
  },
  {
    id: 2,
    text: "Qual destes NAO e um tipo de dado em JavaScript?",
    options: ["Number", "String", "Boolean", "Float"],
    correctIndex: 3,
    difficulty: "medium",
    explanation:
      "JavaScript nao possui o tipo Float separado. Numeros sao todos do tipo Number.",
  },
  {
    id: 3,
    text: "Qual e a forma correta de escrever um comentario em CSS?",
    options: [
      "// este e um comentario",
      "/* este e um comentario */",
      "<!-- este e um comentario -->",
      "' este e um comentario",
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Em CSS, comentarios sao feitos com /* ... */.",
  },
  {
    id: 4,
    text: "Qual metodo de array adiciona um novo elemento ao final do array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctIndex: 0,
    difficulty: "easy",
    explanation:
      "push() adiciona no fim do array. pop() remove do fim.",
  },
  {
    id: 5,
    text: "O que significa SQL?",
    options: [
      "Structured Query Language",
      "Strong Question Language",
      "Structured Quick Language",
      "Simple Query Language",
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "SQL significa Structured Query Language.",
  },
  {
    id: 6,
    text: "No React, qual hook e usado para gerenciar estado?",
    options: ["useEffect", "useContext", "useState", "useReducer"],
    correctIndex: 2,
    difficulty: "easy",
    explanation: "useState e o hook basico para estado local.",
  },
  {
    id: 7,
    text: "Qual operador e usado para igualdade estrita em JavaScript?",
    options: ["=", "==", "===", "!="],
    correctIndex: 2,
    difficulty: "easy",
    explanation: "=== compara valor e tipo ao mesmo tempo.",
  },
  {
    id: 8,
    text: "Qual e o proposito do 'git commit'?",
    options: [
      "Fazer upload de arquivos para o servidor remoto",
      "Salvar alteracoes no repositorio local",
      "Criar um novo branch",
      "Baixar alteracoes do remoto",
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "git commit cria um snapshot local das alteracoes.",
  },
  {
    id: 9,
    text: "Qual metodo HTTP e normalmente usado para atualizar um recurso?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctIndex: 2,
    difficulty: "medium",
    explanation: "PUT (ou PATCH) e usado para atualizar recursos.",
  },
  {
    id: 10,
    text: "Qual e o resultado de 'typeof null' em JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'number'"],
    correctIndex: 2,
    difficulty: "medium",
    explanation:
      "Por uma inconsistência historica, typeof null retorna 'object'.",
  },
  {
    id: 11,
    text: "Em React, por que devemos usar a prop 'key' em listas?",
    options: [
      "Para estilizar cada item",
      "Para melhorar a acessibilidade",
      "Para ajudar o React a identificar itens",
      "Para habilitar eventos de clique",
    ],
    correctIndex: 2,
    difficulty: "medium",
    explanation:
      "A key ajuda o React a reconciliar listas com menos re-renderizacoes.",
  },
  {
    id: 12,
    text: "O que e CORS?",
    options: [
      "Um protocolo de cache",
      "Uma politica de seguranca do navegador",
      "Um formato de imagem",
      "Uma biblioteca de animacao",
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation:
      "CORS controla acesso a recursos entre origens diferentes.",
  },
  {
    id: 13,
    text: "O que acontece se uma Promise for rejeitada e nao tratada?",
    options: [
      "Nada acontece",
      "O navegador encerra a pagina",
      "E gerado um erro nao tratado",
      "A Promise vira undefined",
    ],
    correctIndex: 2,
    difficulty: "hard",
    explanation:
      "Promises rejeitadas sem catch geram unhandledrejection.",
  },
  {
    id: 14,
    text: "Qual e a complexidade de tempo do acesso a um item por indice em array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "Acesso por indice em array e O(1).",
  },
  {
    id: 15,
    text: "Qual e o papel do hook useEffect?",
    options: [
      "Manipular o DOM diretamente",
      "Executar efeitos colaterais",
      "Criar rotas",
      "Substituir o useState",
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation:
      "useEffect executa efeitos colaterais e sincroniza com o DOM ou APIs.",
  },
  {
    id: 16,
    text: "Qual e a diferenca entre var e let?",
    options: [
      "var tem escopo de funcao e let tem escopo de bloco",
      "let e hoisted e var nao",
      "var permite const e let nao",
      "Nao ha diferenca",
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation:
      "var tem escopo de funcao, let tem escopo de bloco e e mais seguro.",
  },
  {
    id: 17,
    text: "Qual e o objetivo do event loop no JavaScript?",
    options: [
      "Executar codigo em paralelo",
      "Gerenciar a fila de eventos e tarefas assincronas",
      "Compilar TypeScript",
      "Bloquear a thread principal",
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation:
      "O event loop coordena a execucao de tarefas e a fila de callbacks.",
  },
  {
    id: 18,
    text: "Qual metodo evita mutar um array no JavaScript?",
    options: ["push()", "splice()", "concat()", "sort()"],
    correctIndex: 2,
    difficulty: "hard",
    explanation:
      "concat() retorna um novo array sem alterar o original.",
  },
];

export default QUESTIONS;
