module.exports = {
  root: true,

  env: {
    node: true,
  },

  parserOptions: {
    parser: "@typescript-eslint/parser",
  },

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    quotes: ["error", "double"],
    "comma-dangle": ["error", "only-multiline"],
    "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
    "@typescript-eslint/no-unused-vars": [2, { args: "none" }],
  },

  extends: [
    "plugin:vue/essential",
    "@vue/airbnb",
    "@vue/typescript",
    "plugin:prettier/recommended",
  ],
};
