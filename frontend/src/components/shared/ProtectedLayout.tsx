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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Estados para manejar secciones colapsables
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    academico: true,
    infraestructura: true,
    horarios: true,
    asistencia: true,
    administracion: true,
    sistema: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
      {/* Navbar Mejorado - Responsive */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Toggle Sidebar Button con animación */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                aria-label="Toggle sidebar"
              >
                <svg
                  className={`w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-transform duration-300 ${
                    isSidebarOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo y Título - Responsive */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    SA
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Sistema de Asistencias
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Universidad</p>
                </div>
              </div>
            </div>

            {/* Right Section - User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Username - Oculto en móvil */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-700">
                  {user.username || "Usuario"}
                </span>
                <span className="text-xs text-gray-500">
                  {user.roles && user.roles.length > 0
                    ? user.roles[0].nombre
                    : "Usuario"}
                </span>
              </div>

              {/* Avatar */}
              <div className="relative group">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white cursor-pointer transition-transform duration-200 hover:scale-105">
                  {(user.username || "U").charAt(0).toUpperCase()}
                </div>
                {/* Tooltip con info del usuario */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3 md:hidden">
                  <p className="text-sm font-medium text-gray-900">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex pt-16">
        {/* Overlay para móviles - con animación mejorada */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-opacity duration-300 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar con animación mejorado */}
        <aside
          className={`
            bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0
            transition-all duration-300 ease-in-out z-20 overflow-y-auto
            ${
              isSidebarOpen
                ? "w-64 translate-x-0"
                : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
            }
          `}
        >
          <nav className="p-4 space-y-1">
            {/* Dashboard */}
            <NavLink
              href="/dashboard"
              icon="📊"
              active={pathname === "/dashboard"}
              isOpen={isSidebarOpen}
            >
              Dashboard
            </NavLink>

            {/* Sección Académico */}
            <MenuSection
              title="Académico"
              icon="🎓"
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.academico}
              onToggle={() => toggleSection("academico")}
            >
              <NavLink
                href="/academico/materias"
                icon="📚"
                active={pathname.startsWith("/academico/materias")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Materias
              </NavLink>
              <NavLink
                href="/academico/grupos"
                icon="👥"
                active={pathname.startsWith("/academico/grupos")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Grupos
              </NavLink>
              <NavLink
                href="/academico/gestiones"
                icon="📅"
                active={pathname.startsWith("/academico/gestiones")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Gestiones
              </NavLink>
              <NavLink
                href="/docentes"
                icon="👨‍🏫"
                active={pathname.startsWith("/docentes")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Docentes
              </NavLink>
            </MenuSection>

            {/* Sección Infraestructura */}
            <MenuSection
              title="Infraestructura"
              icon="🏗️"
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.infraestructura}
              onToggle={() => toggleSection("infraestructura")}
            >
              <NavLink
                href="/infra/edificios"
                icon="🏢"
                active={pathname.startsWith("/infra/edificios")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Edificios
              </NavLink>
              <NavLink
                href="/infra/aulas"
                icon="🚪"
                active={pathname.startsWith("/infra/aulas")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Aulas
              </NavLink>
            </MenuSection>

            {/* Sección Horarios */}
            <MenuSection
              title="Horarios"
              icon="🕒"
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.horarios}
              onToggle={() => toggleSection("horarios")}
            >
              <NavLink
                href="/horarios/bloques"
                icon="⏰"
                active={pathname.startsWith("/horarios/bloques")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Bloques
              </NavLink>
              <NavLink
                href="/horarios/cargas"
                icon="📋"
                active={pathname.startsWith("/horarios/cargas")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Cargas
              </NavLink>
              <NavLink
                href="/horarios/programacion"
                icon="📆"
                active={pathname.startsWith("/horarios/programacion")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Programación
              </NavLink>
            </MenuSection>

            {/* Sección Asistencia */}
            <MenuSection
              title="Asistencia"
              icon="✅"
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.asistencia}
              onToggle={() => toggleSection("asistencia")}
            >
              <NavLink
                href="/asistencia/marcar"
                icon="✓"
                active={pathname.startsWith("/asistencia/marcar")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Marcar
              </NavLink>
              <NavLink
                href="/asistencia/reportes"
                icon="📈"
                active={pathname.startsWith("/asistencia/reportes")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Reportes
              </NavLink>
            </MenuSection>

            {/* Sección Administración */}
            <MenuSection
              title="Administración"
              icon="⚙️"
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.administracion}
              onToggle={() => toggleSection("administracion")}
            >
              <NavLink
                href="/usuarios"
                icon="�"
                active={pathname.startsWith("/usuarios")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Usuarios
              </NavLink>
              <NavLink
                href="/roles"
                icon="🎭"
                active={pathname.startsWith("/roles")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Roles
              </NavLink>
              <NavLink
                href="/permisos"
                icon="🔐"
                active={pathname.startsWith("/permisos")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Permisos
              </NavLink>
            </MenuSection>

            {/* Sección Sistema */}
            <MenuSection
              title="Sistema"
              icon="🔧"
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.sistema}
              onToggle={() => toggleSection("sistema")}
            >
              <NavLink
                href="/bitacora"
                icon="📋"
                active={pathname === "/bitacora"}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Bitácora
              </NavLink>
            </MenuSection>
          </nav>
        </aside>

        {/* Main content con transición suave - Responsive */}
        <main
          className={`
            flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out min-h-screen
            ${isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-16"}
          `}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Componente de Sección de Menú Colapsable
function MenuSection({
  title,
  icon,
  children,
  isOpen,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  isOpen: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (!isOpen) {
    // Cuando el sidebar está colapsado, mostrar solo el icono
    return (
      <div className="py-1">
        <div className="flex justify-center py-2">
          <span className="text-xl" title={title}>
            {icon}
          </span>
        </div>
        <div className="border-t border-gray-200 my-2"></div>
      </div>
    );
  }

  return (
    <div className="py-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <span className="text-base">{icon}</span>
          <span>{title}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}
        `}
      >
        <div className="space-y-1 ml-2 pl-3 border-l-2 border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente de Link de Navegación
function NavLink({
  href,
  icon,
  children,
  active,
  isOpen = true,
  isSubmenu = false,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
  isOpen?: boolean;
  isSubmenu?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center rounded-lg transition-all duration-200
        ${isSubmenu ? "px-3 py-1.5 text-sm" : "px-4 py-2.5"}
        ${isOpen ? "space-x-3" : "justify-center space-x-0"}
        ${
          active
            ? "bg-linear-to-r from-blue-50 to-blue-100 text-blue-700 font-medium shadow-sm"
            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        }
        ${isSubmenu && active ? "border-l-2 border-blue-500 pl-2" : ""}
      `}
      title={!isOpen ? String(children) : undefined}
    >
      <span className={`shrink-0 ${isSubmenu ? "text-sm" : "text-lg"}`}>
        {icon}
      </span>
      <span
        className={`
          transition-all duration-300 whitespace-nowrap overflow-hidden
          ${isOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"}
        `}
      >
        {children}
      </span>
      {active && isOpen && (
        <span className="ml-auto">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </Link>
  );
}
