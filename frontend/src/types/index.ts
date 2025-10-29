/**
 * 📝 TIPOS GLOBALES DEL SISTEMA
 * ==============================
 * Tipos compartidos que reflejan el backend Laravel
 */

// ==================
// AUTH & USUARIOS
// ==================

export interface Usuario {
  id: string;
  username: string;
  email: string;
  estado: "activo" | "suspendido";
  creado_en: string;
  actualizado_en: string;
  roles?: Rol[];
  docente?: Docente;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos?: Permiso[];
}

export interface Permiso {
  id: string;
  codigo: string; // Formato: "modulo.recurso.accion" ej: "academico.materias.crear"
  descripcion: string;
  roles?: Rol[];
}

export interface AuthSession {
  user: Usuario;
  token: string;
  expires_at: string;
}

// ==================
// ACADÉMICO
// ==================

export interface Gestion {
  id: string;
  anio: number;
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  codigo: string;
}

export interface Carrera {
  id: string;
  nombre: string;
  codigo: string;
}

export interface Materia {
  id: string;
  carrera_id: string;
  codigo: string;
  nombre: string;
  horas_semanales: number;
  creditos: number;
  carrera?: Carrera;
  requisitos?: Materia[];
}

export interface Grupo {
  id: string;
  materia_id: string;
  gestion_id: string;
  codigo: string;
  capacidad: number;
  materia?: Materia;
  gestion?: Gestion;
  docentes?: Docente[];
}

export interface Docente {
  id: string;
  usuario_id: string;
  ci: string;
  nombre: string;
  telefono: string;
  usuario?: Usuario;
}

export interface PerfilGestion {
  id: string;
  gestion_id: string;
  usuario_id: string;
  rol_id: string;
  estado: "activo" | "inactivo";
  creado_en: string;
}

// ==================
// INFRAESTRUCTURA
// ==================

export interface Edificio {
  id: string;
  nombre: string;
  aulas?: Aula[];
}

export interface Aula {
  id: string;
  edificio_id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  edificio?: Edificio;
}

// ==================
// TIEMPO & HORARIOS
// ==================

export interface BloqueHorario {
  id: string;
  dia_semana: number; // 1=Lun, 7=Dom
  hora_inicio: string;
  hora_fin: string;
}

export interface CargaDocente {
  id: string;
  docente_id: string;
  grupo_id: string;
  horas_asignadas: number;
  docente?: Docente;
  grupo?: Grupo;
}

export interface HorarioGrupo {
  id: string;
  grupo_id: string;
  bloque_id: string;
  aula_id: string;
  tipo: string;
  grupo?: Grupo;
  bloque?: BloqueHorario;
  aula?: Aula;
}

// ==================
// ASISTENCIA
// ==================

export interface Asistencia {
  id: string;
  docente_id: string;
  grupo_id: string;
  fecha: string;
  bloque_id: string;
  estado: "presente" | "ausente" | "tarde" | "justificado";
  hora_marcado: string | null;
  modo: "QR" | "manual";
  observacion: string | null;
  docente?: Docente;
  grupo?: Grupo;
  bloque?: BloqueHorario;
}

export interface QrSesion {
  id: string;
  grupo_id: string;
  fecha: string;
  bloque_id: string;
  token: string;
  expira_en: string | null;
  activo: boolean;
  creado_en: string;
  grupo?: Grupo;
  bloque?: BloqueHorario;
}

// ==================
// IMPORTACIÓN
// ==================

export interface ImportJob {
  id: string;
  tipo: string;
  estado: "pending" | "processing" | "completed" | "failed" | "partial";
  file_path: string;
  total: number;
  procesados: number;
  errores: number;
  detalle_error: any;
  creado_en: string;
}

// ==================
// API RESPONSES
// ==================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// ==================
// BITÁCORA (AUDIT LOG)
// ==================

export interface Bitacora {
  id: string;
  usuario_id: string | null;
  accion: string;
  descripcion: string | null;
  ip: string | null;
  user_agent: string | null;
  metodo_http: string | null;
  ruta: string | null;
  datos_request: Record<string, any> | null;
  datos_response: Record<string, any> | null;
  codigo_http: number | null;
  created_at: string;
  usuario?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface BitacoraEstadisticas {
  total_eventos: number;
  logins_exitosos: number;
  logins_fallidos: number;
  usuarios_activos: number;
  acciones_por_tipo: Array<{
    accion: string;
    total: number;
  }>;
  actividad_por_dia: Array<{
    fecha: string;
    total: number;
  }>;
}

export interface BitacoraFiltros {
  usuario_id?: string;
  accion?: string;
  desde?: string;
  hasta?: string;
  per_page?: number;
  page?: number;
}
