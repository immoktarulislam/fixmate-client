import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lint-report.txt",
  ]),
  {
    rules: {
      /**
       * The "fetch data on mount" pattern (set a loading flag, then replace
       * state when the promise settles) is intentional throughout the
       * dashboards, so this React Compiler style rule is kept as a warning.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
