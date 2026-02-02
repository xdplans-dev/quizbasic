import { z } from "zod";
import { insertScoreSchema, scoreSchema } from "./schema";
export type { Score, InsertScore } from "./schema";

export const api = {
  questions: {
    list: {
      method: 'GET' as const,
      path: '/api/questions',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          text: z.string(),
          options: z.array(z.string()),
          correctIndex: z.number()
        })),
      },
    },
  },
  scores: {
    submit: {
      method: 'POST' as const,
      path: '/api/submit',
      input: insertScoreSchema,
      responses: {
        201: scoreSchema,
        400: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      input: z.object({
        limit: z.coerce.number().optional().default(50)
      }).optional(),
      responses: {
        200: z.array(scoreSchema),
      },
    },
  },
};
