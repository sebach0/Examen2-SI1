"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { hasAuthToken } from "@/lib/auth";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { getCurrentUser } from "@/services/auth.service";
import type { Usuario } from "@/types";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!hasAuthToken()) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        localStorage.removeItem("auth_token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">
                  Sistema de Asistencias
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.username || "Usuario"}
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex pt-16">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16">
          <nav className="p-4 space-y-2">
            <NavLink
              href="/dashboard"
              icon="📊"
              active={pathname === "/dashboard"}
            >
              Dashboard
            </NavLink>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Académico
              </p>
            </div>
            <NavLink
              href="/academico/materias"
              icon="📚"
              active={pathname.startsWith("/academico/materias")}
            >
              Materias
            </NavLink>
            <NavLink
              href="/academico/grupos"
              icon="👥"
              active={pathname.startsWith("/academico/grupos")}
            >
              Grupos
            </NavLink>
            <NavLink
              href="/academico/gestiones"
              icon="📅"
              active={pathname.startsWith("/academico/gestiones")}
            >
              Gestiones
            </NavLink>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Infraestructura
              </p>
            </div>
            <NavLink
              href="/infra/edificios"
              icon="🏢"
              active={pathname.startsWith("/infra/edificios")}
            >
              Edificios
            </NavLink>
            <NavLink
              href="/infra/aulas"
              icon="🚪"
              active={pathname.startsWith("/infra/aulas")}
            >
              Aulas
            </NavLink>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Horarios
              </p>
            </div>
            <NavLink
              href="/horarios/bloques"
              icon="⏰"
              active={pathname.startsWith("/horarios/bloques")}
            >
              Bloques
            </NavLink>
            <NavLink
              href="/horarios/cargas"
              icon="📋"
              active={pathname.startsWith("/horarios/cargas")}
            >
              Cargas
            </NavLink>
            <NavLink
              href="/horarios/programacion"
              icon="📆"
              active={pathname.startsWith("/horarios/programacion")}
            >
              Programación
            </NavLink>

            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Asistencia
              </p>
            </div>
            <NavLink
              href="/asistencia/marcar"
              icon="✅"
              active={pathname.startsWith("/asistencia/marcar")}
            >
              Marcar Asistencia
            </NavLink>
            <NavLink
              href="/asistencia/reportes"
              icon="📈"
              active={pathname.startsWith("/asistencia/reportes")}
            >
              Reportes
            </NavLink>
          </nav>
        </aside>

        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  active,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
