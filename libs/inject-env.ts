import dotenv = require("dotenv");

export function injectEnv(path = "./.env") {
  return dotenv.config({ path });
}