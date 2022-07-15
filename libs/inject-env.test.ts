import { injectEnv } from "./inject-env";

describe("test to ensure environment variables are injected correctly", () => {
    test.only("test injectEnv when path is not provided", () => {
      const env = injectEnv();
      expect(typeof env).toBe("object");
      expect(env).toBeDefined();
    });

    test.only("test injectEnv when path is provided", () => {
      const env = injectEnv("./.env.example");
      expect(typeof env).toBe("object");
      expect(env).toHaveProperty("parsed");
    });
});
