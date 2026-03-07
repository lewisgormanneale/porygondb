/**
 * Jest config tuned for Angular 21 + jest-preset-angular 16 (CJS preset).
 */
import type { Config } from "jest";

const config: Config = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        diagnostics: false,
      },
    ],
  },
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$))",
  ],
};

export default config;
