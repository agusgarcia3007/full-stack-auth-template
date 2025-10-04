export const AUTH_TOKENS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(AUTH_TOKENS.ACCESS, accessToken);
  localStorage.setItem(AUTH_TOKENS.REFRESH, refreshToken);
}

export function getAccessToken() {
  return localStorage.getItem(AUTH_TOKENS.ACCESS);
}

export function getRefreshToken() {
  return localStorage.getItem(AUTH_TOKENS.REFRESH);
}

export function clearTokens() {
  localStorage.removeItem(AUTH_TOKENS.ACCESS);
  localStorage.removeItem(AUTH_TOKENS.REFRESH);
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  return payload.role;
}

export function isAdmin(): boolean {
  return getUserRole() === "admin";
}
