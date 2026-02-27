import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        process: "readonly",
        fetch: "readonly",
        React: "readonly",
        JSX: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        Buffer: "readonly",
      },
    },
  },
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/*.cjs"],
  },
);
