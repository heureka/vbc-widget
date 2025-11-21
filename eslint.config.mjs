import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import compat from "eslint-plugin-compat";
import html from "eslint-plugin-html";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, compat },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      ...compat.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.html"],
    plugins: { html, compat },
    languageOptions: { globals: globals.browser, sourceType: "script" },
    rules: {
      ...compat.configs.recommended.rules,
    },
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
]);
