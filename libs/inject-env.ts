import dotenv = require("dotenv");

export function injectEnv() {
  return dotenv.config();
}