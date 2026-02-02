import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Score, type InsertScore } from "@shared/routes"; // Verify this import path in your environment

// We need to recreate the types here if not directly exportable or use "typeof api..."
// Assuming @shared/routes exports api object structure:

export function useQuestions() {
  return useQuery({
    queryKey: [api.questions.list.path],
    queryFn: async () => {
      const res = await fetch(api.questions.list.path);
      if (!res.ok) throw new Error("Failed to fetch questions");
      // The validation is done inside the route definition in a real generated client, 
      // but here we manually parse or cast.
      // In a strict setup we'd use api.questions.list.responses[200].parse(json)
      return await res.json();
    },
    staleTime: 0, // Always fetch fresh questions for new games
    refetchOnWindowFocus: false,
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScore) => {
      const res = await fetch(api.scores.submit.path, {
        method: api.scores.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to submit score");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scores.list.path] });
    },
  });
}

export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: [api.scores.list.path, limit],
    queryFn: async () => {
      const url = `${api.scores.list.path}?limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return await res.json();
    },
  });
}
