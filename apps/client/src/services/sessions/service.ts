import { http } from "@/lib/http";

export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

export const sessionsKeys = {
  all: () => ["sessions"] as const,
  lists: () => [...sessionsKeys.all(), "list"] as const,
  list: () => [...sessionsKeys.lists()] as const,
};

export const sessionsService = {
  getSessions: async () => {
    const { data } = await http.get<{ sessions: Session[] }>("/sessions");
    return data.sessions;
  },

  revokeSession: async (sessionId: string) => {
    const { data } = await http.delete<{ message: string }>(
      `/sessions/${sessionId}`
    );
    return data;
  },

  revokeAllSessions: async () => {
    const { data } = await http.delete<{ message: string }>("/sessions");
    return data;
  },
};
