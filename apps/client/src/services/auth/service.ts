import { http } from "@/lib/http";

export class AuthService {
  public static async login(email: string, password: string) {
    const { data } = await http.post("/auth/login", { email, password });
    return data;
  }

  public static async signup(name: string, email: string, password: string) {
    const { data } = await http.post("/auth/signup", { name, email, password });
    return data;
  }

  public static async forgotPassword(email: string) {
    const { data } = await http.post("/auth/forgot-password", { email });
    return data;
  }

  public static async resetPassword(token: string, password: string) {
    const { data } = await http.post("/auth/reset-password", {
      token,
      password,
    });
    return data;
  }
}
