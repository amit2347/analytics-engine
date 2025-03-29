import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import jest from "eslint-plugin-jest";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node, ...jest.environments.globals.globals },
    },
  },
  {
    files: ["**/*.test.js"],
    plugins: { jest },
    extends: ["plugin:jest/recommended"],
  },
]);
