import { http } from "@/lib/http";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}

export const profileKeys = {
  all: () => ["profile"] as const,
  get: () => [...profileKeys.all(), "get"] as const,
};

export const profileService = {
  getProfile: async () => {
    const { data } = await http.get<Profile>("/account/profile");
    return data;
  },
};
