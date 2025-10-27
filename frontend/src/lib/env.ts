/**
 * 📝 VALIDACIÓN DE VARIABLES DE ENTORNO
 * ======================================
 * Valida las variables de entorno en tiempo de compilación
 * usando Zod para type-safety
 */

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000/api"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Validar y exportar
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.error(
    "❌ Variables de entorno inválidas:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Variables de entorno inválidas");
}

export const env = parsed.data;
