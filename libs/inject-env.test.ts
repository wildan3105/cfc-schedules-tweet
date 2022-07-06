import { injectEnv } from "./inject-env";

describe("test to ensure environment variables are injected correctly", () => {
  test("test injectEnv", () => {
    const env = injectEnv();
    expect(env).toHaveProperty("parsed");
  });
});
