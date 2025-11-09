"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { hasAuthToken } from "@/lib/auth";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { getCurrentUser } from "@/services/auth.service";
import type { Usuario } from "@/types";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  UserCircle,
  Building2,
  Building,
  DoorOpen,
  Clock,
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  BarChart3,
  Settings,
  Shield,
  KeyRound,
  Wrench,
  FileText,
  type LucideIcon,
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-900">
      {/* Navbar Mejorado - Tema Oscuro */}
      <nav className="glass border-b border-slate-700 fixed w-full z-30 top-0 shadow-lg">
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Toggle Sidebar Button con animación */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-700/50 hover:text-blue-400 transition-all duration-200 group"
                aria-label="Toggle sidebar"
              >
                <svg
                  className={`w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-transform duration-300 ${
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
                <div className="h-8 w-8 sm:h-10 sm:w-10 gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    SA
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Sistema de Asistencias
                  </h1>
                  <p className="text-xs text-slate-400 -mt-1">Universidad</p>
                </div>
              </div>
            </div>

            {/* Right Section - User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Username - Oculto en móvil */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-100">
                  {user.username || "Usuario"}
                </span>
                <span className="text-xs text-slate-400">
                  {user.roles && user.roles.length > 0
                    ? user.roles[0].nombre
                    : "Usuario"}
                </span>
              </div>

              {/* Avatar */}
              <div className="relative group">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold shadow-glow ring-2 ring-slate-700 cursor-pointer transition-transform duration-200 hover:scale-105">
                  {(user.username || "U").charAt(0).toUpperCase()}
                </div>
                {/* Tooltip con info del usuario */}
                <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl border border-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-3 md:hidden">
                  <p className="text-sm font-medium text-slate-100">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
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
            className="fixed inset-0 bg-black bg-opacity-70 z-10 lg:hidden transition-opacity duration-300 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar con animación mejorado - Tema Oscuro */}
        <aside
          className={`
            glass border-r border-slate-700 fixed left-0 top-16 bottom-0
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
              icon={LayoutDashboard}
              active={pathname === "/dashboard"}
              isOpen={isSidebarOpen}
            >
              Dashboard
            </NavLink>

            {/* Sección Académico */}
            <MenuSection
              title="Académico"
              icon={GraduationCap}
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.academico}
              onToggle={() => toggleSection("academico")}
            >
              <NavLink
                href="/academico/materias"
                icon={BookOpen}
                active={pathname.startsWith("/academico/materias")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Materias
              </NavLink>
              <NavLink
                href="/academico/grupos"
                icon={Users}
                active={pathname.startsWith("/academico/grupos")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Grupos
              </NavLink>
              <NavLink
                href="/academico/gestiones"
                icon={Calendar}
                active={pathname.startsWith("/academico/gestiones")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Gestiones
              </NavLink>
              <NavLink
                href="/docentes"
                icon={UserCircle}
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
              icon={Building2}
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.infraestructura}
              onToggle={() => toggleSection("infraestructura")}
            >
              <NavLink
                href="/infra/edificios"
                icon={Building}
                active={pathname.startsWith("/infra/edificios")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Edificios
              </NavLink>
              <NavLink
                href="/infra/aulas"
                icon={DoorOpen}
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
              icon={Clock}
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.horarios}
              onToggle={() => toggleSection("horarios")}
            >
              <NavLink
                href="/horarios/bloques"
                icon={Clock}
                active={pathname.startsWith("/horarios/bloques")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Bloques
              </NavLink>
              <NavLink
                href="/horarios/cargas"
                icon={ClipboardList}
                active={pathname.startsWith("/horarios/cargas")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Cargas
              </NavLink>
              <NavLink
                href="/horarios/programacion"
                icon={CalendarDays}
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
              icon={CheckCircle2}
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.asistencia}
              onToggle={() => toggleSection("asistencia")}
            >
              <NavLink
                href="/asistencia/marcar"
                icon={CheckSquare}
                active={pathname.startsWith("/asistencia/marcar")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Marcar
              </NavLink>
              <NavLink
                href="/asistencia/reportes"
                icon={BarChart3}
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
              icon={Settings}
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.administracion}
              onToggle={() => toggleSection("administracion")}
            >
              <NavLink
                href="/usuarios"
                icon={Users}
                active={pathname.startsWith("/usuarios")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Usuarios
              </NavLink>
              <NavLink
                href="/roles"
                icon={Shield}
                active={pathname.startsWith("/roles")}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Roles
              </NavLink>
              <NavLink
                href="/permisos"
                icon={KeyRound}
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
              icon={Wrench}
              isOpen={isSidebarOpen}
              isExpanded={expandedSections.sistema}
              onToggle={() => toggleSection("sistema")}
            >
              <NavLink
                href="/bitacora"
                icon={FileText}
                active={pathname === "/bitacora"}
                isOpen={isSidebarOpen}
                isSubmenu
              >
                Bitácora
              </NavLink>
            </MenuSection>
          </nav>
        </aside>

        {/* Main content con transición suave - Tema Oscuro */}
        <main
          className={`
            flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out min-h-screen bg-slate-900
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
  icon: Icon,
  children,
  isOpen,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: LucideIcon;
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
          <div title={title}>
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="border-t border-slate-700 my-2"></div>
      </div>
    );
  }

  return (
    <div className="py-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4" />
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
        <div className="space-y-1 ml-2 pl-3 border-l-2 border-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente de Link de Navegación
function NavLink({
  href,
  icon: Icon,
  children,
  active,
  isOpen = true,
  isSubmenu = false,
}: {
  href: string;
  icon: LucideIcon;
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
            ? "bg-linear-to-r from-blue-500/20 to-violet-500/20 text-blue-400 font-medium shadow-glow border border-blue-500/30"
            : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 border border-transparent"
        }
        ${isSubmenu && active ? "border-l-2 border-blue-400 pl-2" : ""}
      `}
      title={!isOpen ? String(children) : undefined}
    >
      <Icon className={`shrink-0 ${isSubmenu ? "w-4 h-4" : "w-5 h-5"}`} />
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
            className="w-4 h-4 text-blue-400"
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
