/**
 * Jest config tuned for Angular 21 + jest-preset-angular 16 (CJS preset).
 */
import type { Config } from "jest";

const config: Config = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$))",
  ],
};

export default config;
