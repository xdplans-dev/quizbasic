import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET /api/questions
  app.get(api.questions.list.path, (_req, res) => {
    const questions = storage.getQuestions();
    res.json(questions);
  });

  // POST /api/submit
  app.post(api.scores.submit.path, async (req, res) => {
    try {
      const input = api.scores.submit.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos: " + err.errors[0].message });
      }
      throw err;
    }
  });

  // GET /api/leaderboard
  app.get(api.scores.list.path, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const leaderboard = await storage.getLeaderboard(limit);
    res.json(leaderboard);
  });

  return httpServer;
}
