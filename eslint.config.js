// ESLint flat config for the builder's own hand-written code: the build
// scripts (mirror/assemble/publish), the builder tests, and the CAP app
// source in src/srv + src/test. Generated/assembled trees (run/), the mirror
// (run/input), node_modules and the upstream UI5 webapp (src/app, browser
// globals) are excluded.
"use strict";

const js = require("@eslint/js");

module.exports = [
  {
    ignores: [
      "run/**",
      "node_modules/**",
      "src/app/**",
      "src/gen/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["scripts/**/*.js", "test/**/*.js", "src/scripts/**/*.js", "src/srv/**/*.js", "src/test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        exports: "writable",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        Buffer: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        globalThis: "readonly",
        // CAP globals used in the service/server code and tests.
        SELECT: "readonly",
        INSERT: "readonly",
        UPDATE: "readonly",
        DELETE: "readonly",
        cds: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["test/**/*.js", "src/test/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: { globals: { require: "readonly", module: "writable" } },
  },
];
