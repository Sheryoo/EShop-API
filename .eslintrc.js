module.exports = {
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "prettier", "import"],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      alias: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".png"],
      },
    },
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  ignorePatterns: [
    "dist",
    "build",
    ".cache",
    "node_modules",
    "types/generated",
  ],
  rules: {
    "import/no-default-export": "off",
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-underscore-dangle": "off",
    "no-nested-ternary": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": "allow-with-description",
        "ts-nocheck": "allow-with-description",
        "ts-check": "allow-with-description",
        minimumDescriptionLength: 10,
      },
    ],
    "import/no-unresolved": "off",
    "no-else-return": "off",
    "import/no-anonymous-default-export": "off",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "import/newline-after-import": "error",
    "import/no-duplicates": "off",
    "sort-imports": "off",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: "*", next: "if" },
      { blankLine: "always", prev: "*", next: "export" },
    ],
    "@typescript-eslint/no-namespace": "off",
  },
};
