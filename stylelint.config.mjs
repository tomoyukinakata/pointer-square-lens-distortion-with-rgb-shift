export default {
  extends: ["stylelint-config-standard-scss"],
  ignoreFiles: ["dist/**", "node_modules/**"],
  overrides: [
    {
      files: ["**/*.astro"],
      customSyntax: "postcss-html",
    },
  ],
};
