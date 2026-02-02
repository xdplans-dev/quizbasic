import { z } from "zod";

export const insertScoreSchema = z.object({
  nickname: z.string().min(1),
  score: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  durationMs: z.number().int().nonnegative(),
});

export const scoreSchema = insertScoreSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});

export type Score = z.infer<typeof scoreSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}
