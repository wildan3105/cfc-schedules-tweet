import dotenv = require("dotenv");

export function injectEnv(path = "./.env"): Record<never, unknown> {
  return dotenv.config({ path });
}