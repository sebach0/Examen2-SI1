/**
 * 📝 MIDDLEWARE DE AUTENTICACIÓN
 * ===============================
 * Protege rutas privadas y redirige según el estado de autenticación
 *
 * NOTA: Como usamos localStorage para tokens (client-side), este middleware
 * solo verifica rutas. La autenticación real se verifica en los layouts.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rutas públicas (no requieren autenticación)
 */
const PUBLIC_ROUTES = [
  "/login",
  "/admin-login",
  "/forgot-password",
  "/reset-password",
];

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si está en ruta pública, permitir acceso
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Para todas las demás rutas, permitir que el componente maneje la auth
  // (ya que usamos localStorage, no podemos verificar en middleware)
  return NextResponse.next();
}

/**
 * Configuración del matcher
 * Define qué rutas ejecutan el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
