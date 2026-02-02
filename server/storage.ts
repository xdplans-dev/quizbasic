import { ObjectId } from "mongodb";
import { getDb } from "./db";
import { type InsertScore, type Score, type Question } from "@shared/schema";

export interface IStorage {
  createScore(score: InsertScore): Promise<Score>;
  getLeaderboard(limit?: number): Promise<Score[]>;
  getQuestions(): Question[];
}

type ScoreDocument = {
  _id: ObjectId;
  nickname: string;
  score: number;
  correct: number;
  total: number;
  durationMs: number;
  createdAt: Date;
};

async function getScoresCollection() {
  const db = await getDb();
  return db.collection<ScoreDocument>("scores");
}

function toScore(doc: ScoreDocument): Score {
  return {
    id: doc._id.toString(),
    nickname: doc.nickname,
    score: doc.score,
    correct: doc.correct,
    total: doc.total,
    durationMs: doc.durationMs,
    createdAt: doc.createdAt.toISOString(),
  };
}

export class DatabaseStorage implements IStorage {
  async createScore(insertScore: InsertScore): Promise<Score> {
    const collection = await getScoresCollection();
    const createdAt = new Date();
    const { insertedId } = await collection.insertOne({
      ...insertScore,
      createdAt,
    });

    return {
      id: insertedId.toString(),
      ...insertScore,
      createdAt: createdAt.toISOString(),
    };
  }

  async getLeaderboard(limit = 50): Promise<Score[]> {
    const collection = await getScoresCollection();
    const results = await collection
      .find()
      .sort({ score: -1, durationMs: 1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return results.map(toScore);
  }

  getQuestions(): Question[] {
    return QUESTIONS;
  }
}

export const storage = new DatabaseStorage();

// Perguntas em Português
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "O que significa HTML?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correctIndex: 0
  },
  {
    id: 2,
    text: "Qual destes NÃO é um tipo de dado em JavaScript?",
    options: [
      "Number",
      "String",
      "Boolean",
      "Float"
    ],
    correctIndex: 3
  },
  {
    id: 3,
    text: "Qual é a forma correta de escrever um comentário em CSS?",
    options: [
      "// este é um comentário",
      "/* este é um comentário */",
      "<!-- este é um comentário -->",
      "' este é um comentário"
    ],
    correctIndex: 1
  },
  {
    id: 4,
    text: "Qual método de array adiciona um novo elemento ao final do array?",
    options: [
      "push()",
      "pop()",
      "shift()",
      "unshift()"
    ],
    correctIndex: 0
  },
  {
    id: 5,
    text: "O que significa SQL?",
    options: [
      "Structured Query Language",
      "Strong Question Language",
      "Structured Quick Language",
      "Simple Query Language"
    ],
    correctIndex: 0
  },
  {
    id: 6,
    text: "No React, qual hook é usado para gerenciar estado?",
    options: [
      "useEffect",
      "useContext",
      "useState",
      "useReducer"
    ],
    correctIndex: 2
  },
  {
    id: 7,
    text: "Qual operador é usado para igualdade estrita em JavaScript?",
    options: [
      "=",
      "==",
      "===",
      "!="
    ],
    correctIndex: 2
  },
  {
    id: 8,
    text: "Qual é o propósito do 'git commit'?",
    options: [
      "Fazer upload de arquivos para o servidor remoto",
      "Salvar alterações no repositório local",
      "Criar um novo branch",
      "Baixar alterações do remoto"
    ],
    correctIndex: 1
  },
  {
    id: 9,
    text: "Qual método HTTP é normalmente usado para atualizar um recurso?",
    options: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],
    correctIndex: 2
  },
  {
    id: 10,
    text: "Qual é o resultado de 'typeof null' em JavaScript?",
    options: [
      "'null'",
      "'undefined'",
      "'object'",
      "'number'"
    ],
    correctIndex: 2
  }
];
