import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // `eslint .` (npm run lint) would otherwise walk build output and vendor code.
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Raw apostrophes / quotes in JSX text render fine and are readable;
      // escaping every one to &apos;/&quot; hurts source legibility.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
