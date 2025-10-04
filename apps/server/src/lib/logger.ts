import { createLogger } from "bun-logs";

export const logger = createLogger({
  level: "debug",
  format: "pretty",
  onError: console.error,
});
