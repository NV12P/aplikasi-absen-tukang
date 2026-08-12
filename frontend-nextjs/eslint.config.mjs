import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ["src/generated/**", ".next/**", "node_modules/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Izinkan any hanya di file lib/ dan type helpers — terlalu strict untuk migration
      "@typescript-eslint/no-explicit-any": "warn",
      // Izinkan unused vars dengan prefix underscore (konvensi Next.js API routes)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Matikan no-console karena kita pakai console.error di api-handler
      "no-console": "off",
    },
  },
];

export default eslintConfig;
