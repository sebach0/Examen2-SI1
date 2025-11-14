# 🚀 SUPERMEGAPROMPT - CONTEXTO TOTAL DEL SISTEMA
## Guía Completa para Nuevos Colaboradores

**Proyecto:** Sistema de Gestión Académica y Control de Asistencias  
**Stack:** Laravel 11 + Next.js 16 + PostgreSQL 15 + Docker  
**Arquitectura:** Domain-Driven Design (DDD)  
**Estado:** ✅ 100% Funcional - Listo para Producción  
**Última Actualización:** Noviembre 2025

---

## 📑 TABLA DE CONTENIDOS

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Stack Tecnológico Completo](#2-stack-tecnológico-completo)
3. [Arquitectura del Proyecto](#3-arquitectura-del-proyecto)
4. [Estructura de Carpetas Detallada](#4-estructura-de-carpetas-detallada)
5. [Base de Datos y Modelos](#5-base-de-datos-y-modelos)
6. [API Endpoints Completos](#6-api-endpoints-completos)
7. [Frontend - Estructura y Componentes](#7-frontend---estructura-y-componentes)
8. [Flujos Principales del Sistema](#8-flujos-principales-del-sistema)
9. [Sistema de Autenticación y Autorización](#9-sistema-de-autenticación-y-autorización)
10. [Convenciones de Código](#10-convenciones-de-código)
11. [Guía de Desarrollo](#11-guía-de-desarrollo)
12. [Testing y Debugging](#12-testing-y-debugging)
13. [Deployment y Producción](#13-deployment-y-producción)
14. [Troubleshooting Común](#14-troubleshooting-común)
15. [Ejemplos Prácticos](#15-ejemplos-prácticos)

---

## 1. VISIÓN GENERAL DEL SISTEMA

### ¿Qué es este sistema?

Sistema completo de **gestión académica universitaria** que permite:

- ✅ **Gestión Académica**: Docentes, Materias, Grupos, Carreras, Gestiones
- ✅ **Infraestructura**: Aulas, Edificios, Bloques Horarios
- ✅ **Programación de Horarios**: Asignación automática con validación de conflictos
- ✅ **Control de Asistencia**: Registro manual y por código QR
- ✅ **Reportes Estadísticos**: Dashboard dinámico con gráficos
- ✅ **Auditoría Completa**: Bitácora de todas las acciones
- ✅ **Importación Masiva**: Usuarios desde Excel/CSV
- ✅ **Exportación**: Reportes en Excel y PDF

### Objetivos del Sistema

1. **Automatizar** la generación y validación de horarios sin cruces
2. **Facilitar** el registro digital de asistencia docente
3. **Integrar** reportes estadísticos dinámicos
4. **Implementar** interfaz intuitiva y responsive
5. **Controlar** acceso según roles de usuario

### Casos de Uso Principales

```
┌─────────────────────────────────────────────────────────┐
│                    ACTORES DEL SISTEMA                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  👤 SUPERADMIN                                           │
│     ├─ Gestión completa de usuarios, roles, permisos    │
│     ├─ Acceso a todos los módulos                       │
│     └─ Configuración del sistema                        │
│                                                          │
│  👨‍💼 ADMINISTRADOR / COORDINADOR                         │
│     ├─ Gestión de docentes, materias, grupos            │
│     ├─ Programación de horarios                         │
│     ├─ Generación de códigos QR para asistencia         │
│     ├─ Visualización de reportes                        │
│     └─ Exportación de datos                             │
│                                                          │
│  👨‍🏫 DOCENTE                                             │
│     ├─ Ver su carga horaria                             │
│     ├─ Marcar asistencia (manual o QR)                  │
│     └─ Ver sus reportes de asistencia                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICO COMPLETO

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **PHP** | 8.2+ | Lenguaje de programación |
| **Laravel** | 11.x | Framework PHP |
| **PostgreSQL** | 15 | Base de datos relacional |
| **Laravel Sanctum** | 3.x | Autenticación API (Bearer tokens) |
| **Maatwebsite/Excel** | 3.1 | Importación/Exportación Excel |
| **Barryvdh/Laravel-DomPDF** | 2.x | Generación de PDFs |
| **Carbon** | 2.x | Manejo de fechas/horas |
| **UUID** | - | Identificadores únicos |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Next.js** | 16.x | Framework React (App Router) |
| **TypeScript** | 5.x | Tipado estático |
| **React** | 18.x | Biblioteca UI |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **React Hook Form** | 7.x | Manejo de formularios |
| **Zod** | 3.x | Validación de esquemas |
| **Recharts** | 2.x | Gráficos y visualizaciones |
| **QRCode.js** | - | Generación de códigos QR |

### DevOps

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Docker** | 24+ | Containerización |
| **Docker Compose** | 2.x | Orquestación de contenedores |
| **Nginx** | Alpine | Reverse proxy |
| **Git** | - | Control de versiones |

### Configuración

- **Timezone**: `America/La_Paz` (UTC-4) - Bolivia
- **Encoding**: UTF-8
- **API**: RESTful JSON
- **Autenticación**: Bearer Token (Sanctum)

---

## 3. ARQUITECTURA DEL PROYECTO

### Domain-Driven Design (DDD)

El proyecto sigue **DDD** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                    CAPAS DE LA APLICACIÓN                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🌐 PRESENTATION LAYER (Frontend)                       │
│     ├─ Next.js Pages (App Router)                       │
│     ├─ React Components                                 │
│     ├─ Services (API Clients)                           │
│     └─ State Management                                 │
│                                                          │
│  🔌 APPLICATION LAYER (API)                             │
│     ├─ HTTP Controllers                                 │
│     ├─ Middleware (Auth, CORS, Logging)                 │
│     ├─ Request Validation                               │
│     └─ Response Formatting                              │
│                                                          │
│  🏛️ DOMAIN LAYER (Business Logic)                       │
│     ├─ Models (Eloquent)                                │
│     ├─ Relationships                                    │
│     ├─ Business Rules                                   │
│     ├─ Value Objects                                    │
│     └─ Domain Events                                    │
│                                                          │
│  💾 INFRASTRUCTURE LAYER                                │
│     ├─ Database (PostgreSQL)                            │
│     ├─ File Storage                                     │
│     ├─ External Services                                │
│     └─ Third-party Libraries                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Dominios del Sistema

```
backend/app/Domain/
├── Auth/              # Autenticación y Autorización
│   ├── Models/        # Usuario, Rol, Permiso, Bitácora
│   ├── Actions/       # Lógica de negocio
│   └── Policies/      # Políticas de autorización
│
├── Academico/         # Gestión Académica
│   ├── Models/        # Docente, Materia, Grupo, Carrera, Gestion
│   ├── Actions/       # Lógica de negocio académica
│   └── DTO/           # Data Transfer Objects
│
├── Infraestructura/   # Infraestructura Física
│   ├── Models/        # Aula, Edificio
│   └── Actions/       # Lógica de infraestructura
│
├── TiempoHorarios/    # Gestión de Tiempo
│   ├── Models/        # BloqueHorario, HorarioGrupo, CargaDocente
│   └── Actions/       # Lógica de horarios
│
├── Asistencia/        # Control de Asistencia
│   ├── Models/        # Asistencia, QrSesion
│   └── Actions/       # Lógica de asistencia
│
└── Shared/            # Recursos Compartidos
    ├── Traits/        # HasUuid, LogsActivity
    ├── Models/        # Bitácora
    └── ValueObjects/  # Objetos de valor
```

---

## 4. ESTRUCTURA DE CARPETAS DETALLADA

### Backend (Laravel)

```
backend/
├── app/
│   ├── Domain/                    # Lógica de dominio (DDD)
│   │   ├── Auth/
│   │   │   ├── Models/
│   │   │   │   ├── Usuario.php
│   │   │   │   ├── Rol.php
│   │   │   │   ├── Permiso.php
│   │   │   │   └── Bitacora.php
│   │   │   ├── Actions/
│   │   │   └── Policies/
│   │   ├── Academico/
│   │   │   ├── Models/
│   │   │   │   ├── Docente.php
│   │   │   │   ├── Materia.php
│   │   │   │   ├── Grupo.php
│   │   │   │   ├── Carrera.php
│   │   │   │   ├── Gestion.php
│   │   │   │   └── MateriaRequisito.php
│   │   │   ├── Actions/
│   │   │   └── DTO/
│   │   ├── Infraestructura/
│   │   │   ├── Models/
│   │   │   │   ├── Aula.php
│   │   │   │   └── Edificio.php
│   │   │   └── Actions/
│   │   ├── TiempoHorarios/
│   │   │   ├── Models/
│   │   │   │   ├── BloqueHorario.php
│   │   │   │   ├── HorarioGrupo.php
│   │   │   │   └── CargaDocente.php
│   │   │   └── Actions/
│   │   ├── Asistencia/
│   │   │   ├── Models/
│   │   │   │   ├── Asistencia.php
│   │   │   │   └── QrSesion.php
│   │   │   └── Actions/
│   │   └── Shared/
│   │       ├── Traits/
│   │       │   ├── HasUuid.php
│   │       │   └── LogsActivity.php
│   │       └── Models/
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── Auth/
│   │   │       │   ├── AuthController.php
│   │   │       │   ├── UsuarioController.php
│   │   │       │   ├── RolController.php
│   │   │       │   └── PermisoController.php
│   │   │       ├── Academico/
│   │   │       │   ├── DocenteController.php
│   │   │       │   ├── MateriaController.php
│   │   │       │   ├── GrupoController.php
│   │   │       │   └── GestionController.php
│   │   │       ├── Infraestructura/
│   │   │       │   ├── AulaController.php
│   │   │       │   └── EdificioController.php
│   │   │       ├── TiempoHorarios/
│   │   │       │   ├── BloqueHorarioController.php
│   │   │       │   ├── HorarioGrupoController.php
│   │   │       │   └── CargaDocenteController.php
│   │   │       ├── Asistencia/
│   │   │       │   ├── AsistenciaController.php
│   │   │       │   └── QrSesionController.php
│   │   │       ├── Importacion/
│   │   │       │   └── ImportacionController.php
│   │   │       ├── DashboardController.php
│   │   │       └── BitacoraController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── LogActivityMiddleware.php
│   │   │   └── TrustProxies.php
│   │   └── Resources/
│   │
│   ├── Exports/                   # Clases de exportación
│   │   ├── BaseExcelExport.php
│   │   ├── BasePdfExport.php
│   │   ├── DocentesExport.php
│   │   ├── AsistenciasExport.php
│   │   └── ...
│   │
│   ├── Imports/                   # Clases de importación
│   │   └── UsuariosImport.php
│   │
│   └── Providers/
│       └── AppServiceProvider.php
│
├── database/
│   ├── migrations/                # Migraciones de BD
│   │   ├── 2025_10_27_170000_create_auth_tables.php
│   │   ├── 2025_10_27_170100_create_academico_tables.php
│   │   ├── 2025_10_27_170200_create_asistencia_tables.php
│   │   └── ...
│   └── seeders/                   # Seeders de datos
│       ├── DatabaseSeeder.php
│       ├── AuthSeeder.php
│       └── ...
│
├── routes/
│   └── api.php                    # Rutas de la API
│
├── config/                        # Configuraciones
│   ├── app.php
│   ├── database.php
│   ├── sanctum.php
│   └── ...
│
├── resources/
│   └── views/
│       └── exports/               # Vistas para PDFs
│           ├── asistencias.blade.php
│           └── docentes.blade.php
│
├── storage/
│   ├── app/                       # Archivos subidos
│   └── logs/                      # Logs de Laravel
│
├── Dockerfile
├── composer.json
└── .env.example
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                       # App Router (Next.js 16)
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Página de inicio
│   │   ├── globals.css           # Estilos globales
│   │   │
│   │   ├── login/                # Autenticación
│   │   │   └── page.tsx
│   │   ├── admin-login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/            # Dashboard principal
│   │   │   └── page.tsx
│   │   │
│   │   ├── usuarios/             # Gestión de usuarios
│   │   │   ├── page.tsx          # Listado
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Edición/Creación
│   │   │
│   │   ├── roles/                # Gestión de roles
│   │   ├── permisos/             # Gestión de permisos
│   │   ├── docentes/             # Gestión de docentes
│   │   ├── academico/            # Gestión académica
│   │   │   ├── materias/
│   │   │   ├── grupos/
│   │   │   └── gestiones/
│   │   ├── infra/                # Infraestructura
│   │   │   ├── aulas/
│   │   │   └── edificios/
│   │   ├── horarios/             # Gestión de horarios
│   │   │   ├── bloques/
│   │   │   ├── programacion/
│   │   │   ├── cargas/
│   │   │   └── reportes/         # Reportes semanal/diario
│   │   ├── asistencia/           # Control de asistencia
│   │   │   ├── marcar/           # Marcar asistencia
│   │   │   ├── escaneo/          # Escanear QR
│   │   │   └── reportes/         # Reportes de asistencia
│   │   ├── importacion/          # Importación de usuarios
│   │   └── bitacora/             # Auditoría
│   │
│   ├── components/               # Componentes React
│   │   ├── shared/
│   │   │   ├── ProtectedLayout.tsx    # Layout con sidebar
│   │   │   ├── LogoutButton.tsx
│   │   │   └── Icons.tsx
│   │   ├── forms/                # Componentes de formulario
│   │   ├── tables/               # Componentes de tabla
│   │   ├── charts/               # Componentes de gráficos
│   │   └── ui/                   # Componentes UI básicos
│   │
│   ├── services/                 # Servicios API
│   │   ├── api.ts                # Cliente API base
│   │   ├── auth.service.ts
│   │   ├── usuario.service.ts
│   │   ├── docente.service.ts
│   │   ├── materia.service.ts
│   │   ├── horario.service.ts
│   │   ├── asistencia.service.ts
│   │   └── ...
│   │
│   ├── lib/                      # Utilidades
│   │   ├── api.ts                # Cliente HTTP centralizado
│   │   ├── auth.ts               # Funciones de autenticación
│   │   ├── env.ts                # Variables de entorno
│   │   └── validators/           # Validadores Zod
│   │
│   ├── types/                    # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── hooks/                    # Custom hooks
│   │
│   ├── store/                    # State management (si se usa)
│   │
│   └── middleware.ts             # Middleware de Next.js
│
├── public/                       # Archivos estáticos
│   └── ...
│
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Root

```
Examen2-Si1/
├── backend/                      # Backend Laravel
├── frontend/                     # Frontend Next.js
├── nginx/                        # Configuración Nginx
│   └── nginx.conf
├── docker-compose.yml            # Orquestación Docker
├── .env.example                  # Variables de entorno ejemplo
├── .gitignore
├── README.md                     # Documentación principal
├── ONBOARDING_COLABORADOR.md    # Guía de onboarding
└── SUPERMEGAPROMPT_COLABORADORES.md  # Este archivo
```

---

## 5. BASE DE DATOS Y MODELOS

### Diagrama de Relaciones Principales

```
┌──────────────┐
│   USUARIO    │ (Tabla base de autenticación)
│──────────────│
│ id (UUID)    │
│ email        │
│ password     │
│ activo       │
└──────┬───────┘
       │
       │ 1:1
       ▼
┌──────────────┐
│   DOCENTE    │ (Extensión de Usuario)
│──────────────│
│ id (UUID)    │
│ usuario_id   │───┐
│ nombre       │   │
│ apellido     │   │
│ ci           │   │
└──────┬───────┘   │
       │           │
       │ 1:N       │
       ▼           │
┌──────────────────┐│
│ CARGA_DOCENTE    ││
│──────────────────││
│ id (UUID)        ││
│ docente_id ──────┘│
│ grupo_id ────────┐│
│ horas_asignadas  ││
└────────┬─────────┘│
         │          │
         │ N:1      │
         ▼          │
┌──────────────┐    │
│    GRUPO     │    │
│──────────────│    │
│ id (UUID)    │    │
│ materia_id ──┼────┼──┐
│ gestion_id ──┼────┼──┼──┐
│ codigo       │    │  │  │
│ capacidad    │    │  │  │
└──────┬───────┘    │  │  │
       │            │  │  │
       │ N:1        │  │  │
       ▼            │  │  │
┌──────────────┐    │  │  │
│   MATERIA    │    │  │  │
│──────────────│    │  │  │
│ id (UUID)    │◄───┘  │  │
│ carrera_id ──┼───────┼──┼──┐
│ codigo       │      │  │  │
│ nombre       │      │  │  │
│ horas_sem    │      │  │  │
│ creditos     │      │  │  │
└──────┬───────┘      │  │  │
       │              │  │  │
       │ N:1          │  │  │
       ▼              │  │  │
┌──────────────┐      │  │  │
│   CARRERA    │      │  │  │
│──────────────│      │  │  │
│ id (UUID)    │◄─────┘  │  │
│ codigo       │         │  │
│ nombre       │         │  │
└──────────────┘         │  │
                         │  │
┌──────────────┐         │  │
│   GESTION    │         │  │
│──────────────│         │  │
│ id (UUID)    │◄────────┘  │
│ codigo       │            │
│ periodo      │            │
│ anio         │            │
│ fecha_inicio │            │
│ fecha_fin    │            │
└──────────────┘            │
                            │
┌──────────────┐            │
│    GRUPO     │            │
│──────────────│            │
│ id (UUID)    │            │
│ materia_id ──┼────────────┘
│ gestion_id ──┼────────────┐
│ codigo       │            │
│ capacidad    │            │
└──────┬───────┘            │
       │                    │
       │ 1:N                │
       ▼                    │
┌──────────────────┐        │
│ HORARIO_GRUPO    │        │
│──────────────────│        │
│ id (UUID)        │        │
│ grupo_id ────────┘        │
│ bloque_id ────────┐       │
│ aula_id ──────────┼───┐   │
│ tipo              │   │   │
│ dia_semana        │   │   │
└──────┬────────────┘   │   │
       │                │   │
       │ N:1            │   │
       ▼                │   │
┌──────────────┐        │   │
│ BLOQUE_HOR.  │        │   │
│──────────────│        │   │
│ id (UUID)    │◄───────┘   │
│ codigo       │            │
│ hora_inicio  │            │
│ hora_fin     │            │
└──────────────┘            │
                            │
┌──────────────┐            │
│    AULA      │            │
│──────────────│            │
│ id (UUID)    │◄───────────┘
│ edificio_id ─┼───┐
│ codigo       │   │
│ nombre       │   │
│ tipo         │   │
│ capacidad    │   │
└──────┬───────┘   │
       │           │
       │ N:1       │
       ▼           │
┌──────────────┐   │
│  EDIFICIO    │   │
│──────────────│   │
│ id (UUID)    │◄──┘
│ codigo       │
│ nombre       │
└──────────────┘

┌──────────────────┐
│   ASISTENCIA     │
│──────────────────│
│ id (UUID)        │
│ docente_id ──────┐
│ grupo_id ────────┼───┐
│ bloque_id ───────┼───┼───┐
│ fecha            │   │   │
│ estado           │   │   │
│ modo             │   │   │
│ hora_marcado     │   │   │
└──────────────────┘   │   │
                       │   │
┌──────────────────┐   │   │
│   QR_SESION      │   │   │
│──────────────────│   │   │
│ id (UUID)        │   │   │
│ grupo_id ────────┼───┘   │
│ bloque_id ───────┼───────┘
│ token            │
│ fecha            │
│ expira_en        │
│ activo           │
└──────────────────┘
```

### Modelos Principales

#### Usuario
```php
// backend/app/Domain/Auth/Models/Usuario.php
- id (UUID)
- email (unique)
- password (hashed)
- activo (boolean)
- Relationships:
  - hasOne(Docente)
  - belongsToMany(Rol)
  - hasMany(Bitacora)
```

#### Docente
```php
// backend/app/Domain/Academico/Models/Docente.php
- id (UUID)
- usuario_id (FK → Usuario)
- nombre
- apellido
- ci (unique)
- Relationships:
  - belongsTo(Usuario)
  - hasMany(CargaDocente)
  - hasMany(Asistencia)
```

#### Materia
```php
// backend/app/Domain/Academico/Models/Materia.php
- id (UUID)
- carrera_id (FK → Carrera)
- codigo (unique)
- nombre
- horas_sem (integer)
- creditos (integer)
- Relationships:
  - belongsTo(Carrera)
  - hasMany(Grupo)
  - belongsToMany(Materia) [requisitos]
```

#### Grupo
```php
// backend/app/Domain/Academico/Models/Grupo.php
- id (UUID)
- materia_id (FK → Materia)
- gestion_id (FK → Gestion)
- codigo (unique)
- capacidad (integer)
- Relationships:
  - belongsTo(Materia)
  - belongsTo(Gestion)
  - hasMany(HorarioGrupo)
  - hasMany(CargaDocente)
  - hasMany(Asistencia)
```

#### HorarioGrupo
```php
// backend/app/Domain/TiempoHorarios/Models/HorarioGrupo.php
- id (UUID)
- grupo_id (FK → Grupo)
- bloque_id (FK → BloqueHorario)
- aula_id (FK → Aula)
- tipo (enum: teorica, practica, laboratorio)
- dia_semana (integer: 1-5, Lunes-Viernes)
- Relationships:
  - belongsTo(Grupo)
  - belongsTo(BloqueHorario)
  - belongsTo(Aula)
```

#### Asistencia
```php
// backend/app/Domain/Asistencia/Models/Asistencia.php
- id (UUID)
- docente_id (FK → Docente)
- grupo_id (FK → Grupo)
- bloque_id (FK → BloqueHorario)
- fecha (date)
- estado (enum: presente, ausente, tarde, justificado)
- modo (enum: QR, manual)
- hora_marcado (timestampTz)
- observacion (string, nullable)
- Relationships:
  - belongsTo(Docente)
  - belongsTo(Grupo)
  - belongsTo(BloqueHorario)
```

### Convenciones de Base de Datos

- **Primary Keys**: Todos usan UUID (v4)
- **Foreign Keys**: UUID referenciando otras tablas
- **Timestamps**: `created_at`, `updated_at` (algunas tablas no tienen)
- **Soft Deletes**: No se usan (eliminación física)
- **Naming**: snake_case para columnas, singular para tablas
- **Enums**: PostgreSQL ENUM types
- **Timezone**: `timestampTz` para fechas con hora

---

## 6. API ENDPOINTS COMPLETOS

### Autenticación

```
POST   /api/auth/login              # Login de usuario normal
POST   /api/auth/admin-login        # Login de superadmin
POST   /api/auth/logout             # Cerrar sesión
GET    /api/auth/me                 # Obtener usuario actual
```

### Usuarios

```
GET    /api/usuarios                # Listar usuarios (paginado)
POST   /api/usuarios                # Crear usuario
GET    /api/usuarios/{id}           # Obtener usuario
PUT    /api/usuarios/{id}           # Actualizar usuario
DELETE /api/usuarios/{id}           # Eliminar usuario
POST   /api/usuarios/{id}/suspender # Suspender usuario
POST   /api/usuarios/{id}/activar   # Activar usuario
```

### Roles y Permisos

```
GET    /api/roles                   # Listar roles
POST   /api/roles                   # Crear rol
GET    /api/roles/{id}              # Obtener rol
PUT    /api/roles/{id}              # Actualizar rol
DELETE /api/roles/{id}              # Eliminar rol

GET    /api/permisos                # Listar permisos
POST   /api/permisos                # Crear permiso
GET    /api/permisos/{id}           # Obtener permiso
PUT    /api/permisos/{id}           # Actualizar permiso
DELETE /api/permisos/{id}           # Eliminar permiso
```

### Docentes

```
GET    /api/docentes                # Listar docentes (paginado)
POST   /api/docentes                # Crear docente
GET    /api/docentes/{id}           # Obtener docente
PUT    /api/docentes/{id}           # Actualizar docente
DELETE /api/docentes/{id}           # Eliminar docente
GET    /api/docentes/exportar       # Exportar a Excel/PDF
GET    /api/docentes/all            # Obtener todos (sin paginación)
```

### Materias

```
GET    /api/materias                # Listar materias (paginado)
POST   /api/materias                # Crear materia
GET    /api/materias/{id}           # Obtener materia
PUT    /api/materias/{id}           # Actualizar materia
DELETE /api/materias/{id}           # Eliminar materia
GET    /api/materias/exportar       # Exportar a Excel
```

### Grupos

```
GET    /api/grupos                  # Listar grupos (paginado)
POST   /api/grupos                  # Crear grupo
GET    /api/grupos/{id}             # Obtener grupo
PUT    /api/grupos/{id}             # Actualizar grupo
DELETE /api/grupos/{id}             # Eliminar grupo
GET    /api/grupos/exportar         # Exportar a Excel
GET    /api/grupos/all              # Obtener todos (sin paginación)
```

### Gestiones

```
GET    /api/gestiones               # Listar gestiones
POST   /api/gestiones               # Crear gestión
GET    /api/gestiones/{id}          # Obtener gestión
PUT    /api/gestiones/{id}          # Actualizar gestión
DELETE /api/gestiones/{id}          # Eliminar gestión
GET    /api/gestiones/actual        # Obtener gestión activa
```

### Aulas y Edificios

```
GET    /api/aulas                   # Listar aulas
POST   /api/aulas                   # Crear aula
GET    /api/aulas/{id}              # Obtener aula
PUT    /api/aulas/{id}              # Actualizar aula
DELETE /api/aulas/{id}              # Eliminar aula
GET    /api/aulas/all               # Obtener todas (sin paginación)

GET    /api/edificios               # Listar edificios
POST   /api/edificios               # Crear edificio
GET    /api/edificios/{id}          # Obtener edificio
PUT    /api/edificios/{id}          # Actualizar edificio
DELETE /api/edificios/{id}          # Eliminar edificio
```

### Bloques Horarios

```
GET    /api/bloques-horario         # Listar bloques
POST   /api/bloques-horario         # Crear bloque
GET    /api/bloques-horario/{id}    # Obtener bloque
PUT    /api/bloques-horario/{id}    # Actualizar bloque
DELETE /api/bloques-horario/{id}    # Eliminar bloque
```

### Horarios de Grupo

```
GET    /api/horarios-grupo          # Listar horarios
POST   /api/horarios-grupo          # Crear horario
GET    /api/horarios-grupo/{id}     # Obtener horario
PUT    /api/horarios-grupo/{id}     # Actualizar horario
DELETE /api/horarios-grupo/{id}     # Eliminar horario
POST   /api/horarios-grupo/verificar-conflictos  # Verificar conflictos
GET    /api/horarios-grupo/exportar # Exportar a Excel
GET    /api/horarios-grupo/reportes/semanal      # Reporte semanal
GET    /api/horarios-grupo/reportes/diario       # Reporte diario
```

### Cargas Docentes

```
GET    /api/cargas-docentes         # Listar cargas
POST   /api/cargas-docentes         # Crear carga
GET    /api/cargas-docentes/{id}    # Obtener carga
PUT    /api/cargas-docentes/{id}    # Actualizar carga
DELETE /api/cargas-docentes/{id}    # Eliminar carga
GET    /api/cargas-docentes/exportar # Exportar a Excel
```

### Asistencia

```
GET    /api/asistencias             # Listar asistencias (con filtros)
POST   /api/asistencias             # Crear asistencia manual
POST   /api/asistencias/qr          # Marcar asistencia por QR
GET    /api/asistencias/{id}        # Obtener asistencia
PUT    /api/asistencias/{id}        # Actualizar asistencia
DELETE /api/asistencias/{id}        # Eliminar asistencia
GET    /api/asistencias/exportar    # Exportar a Excel/PDF
GET    /api/asistencias/reportes    # Reportes de asistencia
```

### QR Sesiones

```
POST   /api/qr-sesiones/generar     # Generar código QR
GET    /api/qr-sesiones/verificar/{token}  # Verificar QR
POST   /api/qr-sesiones/{id}/desactivar    # Desactivar QR
```

### Importación

```
POST   /api/importacion/usuarios    # Importar usuarios desde CSV/Excel
GET    /api/importacion/usuarios/plantilla # Descargar plantilla
```

### Dashboard

```
GET    /api/dashboard/estadisticas  # Estadísticas generales
```

### Bitácora

```
GET    /api/bitacora                # Listar registros de bitácora
GET    /api/bitacora/{id}           # Obtener registro
```

### Formato de Respuestas

#### Éxito
```json
{
  "message": "Operación exitosa",
  "data": { ... }
}
```

#### Error de Validación (422)
```json
{
  "message": "Error de validación",
  "errors": {
    "campo": ["Mensaje de error"]
  }
}
```

#### Error del Servidor (500)
```json
{
  "message": "Error interno del servidor",
  "error": "Detalles del error (solo en desarrollo)"
}
```

### Autenticación

Todas las rutas (excepto login) requieren header:
```
Authorization: Bearer {token}
```

El token se obtiene del login y se almacena en `localStorage` como `auth_token`.

---

## 7. FRONTEND - ESTRUCTURA Y COMPONENTES

### App Router (Next.js 16)

Next.js 16 usa **App Router** (no Pages Router). La estructura es:

```
app/
├── layout.tsx          # Layout raíz
├── page.tsx            # Página principal (/)
├── [ruta]/
│   └── page.tsx        # Página de la ruta
└── [ruta]/[id]/
    └── page.tsx        # Página dinámica
```

### Componentes Principales

#### ProtectedLayout
```typescript
// frontend/src/components/shared/ProtectedLayout.tsx
- Layout principal con sidebar
- Navegación por módulos
- Protección de rutas
- Manejo de autenticación
```

#### FormInput, FormSelect
```typescript
// frontend/src/components/forms/
- Componentes reutilizables de formulario
- Integración con React Hook Form
- Validación con Zod
```

#### DataTable
```typescript
// frontend/src/components/tables/
- Tabla con paginación
- Búsqueda y filtros
- Acciones (editar, eliminar)
```

### Servicios API

Cada módulo tiene su servicio:

```typescript
// frontend/src/services/docente.service.ts
export const getDocentes = async (params?: PaginationParams): Promise<PaginatedResponse<Docente>>
export const getDocenteById = async (id: string): Promise<Docente>
export const createDocente = async (data: CreateDocenteDto): Promise<Docente>
export const updateDocente = async (id: string, data: UpdateDocenteDto): Promise<Docente>
export const deleteDocente = async (id: string): Promise<void>
export const exportarDocentes = async (formato: 'excel' | 'pdf', filtros?: FiltrosDocente): Promise<void>
```

### Cliente API Centralizado

```typescript
// frontend/src/lib/api.ts
- Cliente HTTP centralizado (fetch)
- Manejo automático de tokens
- Interceptores de request/response
- Manejo de errores
- Download de archivos
```

### Tipos TypeScript

```typescript
// frontend/src/types/index.ts
- Interfaces para todos los modelos
- Tipos para requests/responses
- Tipos para filtros y paginación
```

### Autenticación Frontend

```typescript
// frontend/src/lib/auth.ts
- getStoredUser(): Obtener usuario del localStorage
- getAuthToken(): Obtener token
- isSuperAdmin(): Verificar si es superadmin
- hasPermission(): Verificar permisos
- logout(): Cerrar sesión
```

### Middleware de Next.js

```typescript
// frontend/src/middleware.ts
- Protección de rutas
- Redirección si no autenticado
- Verificación de permisos
```

---

## 8. FLUJOS PRINCIPALES DEL SISTEMA

### Flujo 1: Login y Autenticación

```
1. Usuario accede a /login o /admin-login
2. Ingresa email y password
3. Frontend → POST /api/auth/login
4. Backend valida credenciales
5. Backend genera token (Sanctum)
6. Backend retorna: { token, user }
7. Frontend guarda token en localStorage
8. Frontend redirige a /dashboard
9. Todas las requests incluyen: Authorization: Bearer {token}
```

### Flujo 2: Crear Horario con Validación de Conflictos

```
1. Admin accede a /horarios/programacion
2. Selecciona: Grupo, Bloque, Aula, Tipo, Día
3. Click en "Verificar Conflictos"
4. Frontend → POST /api/horarios-grupo/verificar-conflictos
5. Backend verifica:
   - ¿Aula ocupada en ese bloque?
   - ¿Grupo ya tiene horario en ese bloque?
6. Backend retorna: { tiene_conflictos: true/false, conflictos: [...] }
7. Si hay conflictos → Frontend muestra alerta
8. Si no hay conflictos → Usuario puede guardar
9. Frontend → POST /api/horarios-grupo
10. Backend crea horario
11. Backend registra en bitácora
12. Frontend muestra éxito y redirige
```

### Flujo 3: Marcar Asistencia por QR

```
1. Admin/Coordinador genera QR:
   - Accede a /asistencia/marcar
   - Selecciona: Grupo, Bloque, Fecha, Duración
   - Click en "Generar QR"
   - Frontend → POST /api/qr-sesiones/generar
   - Backend crea QrSesion con token único
   - Backend retorna: { token, url_qr, qr_data }
   - Frontend muestra código QR

2. Docente escanea QR:
   - Abre URL del QR en su móvil
   - Frontend extrae token de URL
   - Frontend → GET /api/qr-sesiones/verificar/{token}
   - Backend valida:
     * ¿Token existe?
     * ¿No ha expirado?
     * ¿Está activo?
   - Si válido → Frontend muestra info de sesión
   - Frontend → POST /api/asistencias/qr
   - Backend valida:
     * ¿Docente tiene carga en ese grupo?
     * ¿Fecha coincide?
     * ¿Hora está en rango permitido?
     * ¿No marcó ya asistencia?
   - Backend crea registro de Asistencia
   - Backend registra en bitácora
   - Frontend muestra éxito y redirige
```

### Flujo 4: Importar Usuarios desde CSV

```
1. Admin accede a /importacion
2. Descarga plantilla CSV
3. Llena plantilla con datos de usuarios
4. Sube archivo CSV
5. Frontend → POST /api/importacion/usuarios (multipart/form-data)
6. Backend valida archivo (tipo, tamaño)
7. Backend procesa CSV:
   - Parsea filas
   - Valida datos
   - Genera passwords si no vienen
   - Crea usuarios
   - Asigna roles
8. Backend retorna: { importados: N, fallidos: M, errores: [...] }
9. Frontend muestra resultados
```

### Flujo 5: Exportar Reportes

```
1. Usuario accede a módulo (ej: /docentes)
2. Aplica filtros (opcional)
3. Click en "Exportar" → Selecciona formato (Excel/PDF)
4. Frontend → GET /api/docentes/exportar?formato=excel&filtros=...
5. Backend aplica filtros
6. Backend genera archivo (Excel o PDF)
7. Backend retorna archivo como descarga
8. Frontend descarga archivo automáticamente
```

### Flujo 6: Ver Reportes de Horarios

```
1. Usuario accede a /horarios/reportes
2. Selecciona vista: Semanal o Diario
3. Selecciona fecha y filtros (grupo, aula, docente, tipo)
4. Frontend → GET /api/horarios-grupo/reportes/semanal?fecha=...&filtros=...
5. Backend obtiene horarios según filtros
6. Backend agrupa por día (semanal) o lista (diario)
7. Backend formatea datos con relaciones (grupo, materia, docentes, aula)
8. Backend retorna: { horarios: [...], horarios_por_dia: {...} }
9. Frontend renderiza vista de calendario o lista
```

---

## 9. SISTEMA DE AUTENTICACIÓN Y AUTORIZACIÓN

### Roles del Sistema

```
┌─────────────────────────────────────────┐
│              ROLES                      │
├─────────────────────────────────────────┤
│                                         │
│  🔴 SUPERADMIN                          │
│     - Acceso total al sistema           │
│     - Gestión de usuarios, roles        │
│     - Login especial (/admin-login)     │
│                                         │
│  🟠 ADMIN / COORDINADOR                 │
│     - Gestión de docentes, materias     │
│     - Programación de horarios          │
│     - Generación de QR                  │
│     - Ver reportes                      │
│                                         │
│  🟡 DOCENTE                             │
│     - Ver su carga horaria              │
│     - Marcar asistencia                 │
│     - Ver sus reportes                  │
│                                         │
└─────────────────────────────────────────┘
```

### Permisos por Módulo

```
usuarios.*      # Ver, crear, editar, eliminar usuarios
roles.*         # Gestión de roles
permisos.*      # Gestión de permisos
docentes.*      # Gestión de docentes
materias.*      # Gestión de materias
grupos.*        # Gestión de grupos
aulas.*         # Gestión de aulas
horarios.*      # Gestión de horarios
asistencia.*    # Control de asistencia
reportes.*      # Ver y exportar reportes
dashboard.ver   # Ver dashboard
```

### Middleware de Autenticación

```php
// backend/app/Http/Middleware/Authenticate.php
- Verifica token Bearer
- Valida token con Sanctum
- Carga usuario autenticado
- Adjunta usuario a Request
```

### Verificación de Permisos

```php
// En controladores
if (!$request->user()->can('docentes.crear')) {
    return response()->json(['message' => 'No autorizado'], 403);
}
```

### Frontend - Protección de Rutas

```typescript
// frontend/src/middleware.ts
- Verifica autenticación
- Verifica permisos
- Redirige a /login si no autenticado
```

### Frontend - Verificación de Permisos

```typescript
// frontend/src/lib/auth.ts
import { hasPermission } from '@/lib/auth';

if (hasPermission('docentes.crear')) {
  // Mostrar botón de crear
}
```

---

## 10. CONVENCIONES DE CÓDIGO

### Backend (Laravel/PHP)

#### Naming Conventions

```php
// Clases: PascalCase
class DocenteController extends Controller

// Métodos: camelCase
public function getDocentes()

// Variables: camelCase
$docenteId = $request->docente_id;

// Constantes: UPPER_SNAKE_CASE
const MAX_HORAS_SEMANALES = 40;

// Base de datos: snake_case
$table->string('nombre_completo');
```

#### Estructura de Controladores

```php
class DocenteController extends Controller
{
    // 1. Método index (listar)
    public function index(Request $request) { ... }
    
    // 2. Método store (crear)
    public function store(Request $request) { ... }
    
    // 3. Método show (mostrar uno)
    public function show(string $id) { ... }
    
    // 4. Método update (actualizar)
    public function update(Request $request, string $id) { ... }
    
    // 5. Método destroy (eliminar)
    public function destroy(string $id) { ... }
    
    // 6. Métodos adicionales
    public function exportar(Request $request) { ... }
}
```

#### Validación

```php
$validator = Validator::make($request->all(), [
    'nombre' => 'required|string|max:255',
    'email' => 'required|email|unique:usuario,email',
    'docente_id' => 'required|uuid|exists:docente,id',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'Error de validación',
        'errors' => $validator->errors()
    ], 422);
}
```

#### Manejo de Errores

```php
try {
    // Código que puede fallar
} catch (\Exception $e) {
    Log::error('Error en método', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    return response()->json([
        'message' => 'Error interno del servidor',
        'error' => config('app.debug') ? $e->getMessage() : null
    ], 500);
}
```

#### Relaciones Eloquent

```php
// En Model
public function docente()
{
    return $this->belongsTo(Docente::class);
}

// Uso con Eager Loading
$horarios = HorarioGrupo::with(['grupo.materia', 'aula.edificio', 'bloque'])
    ->get();
```

### Frontend (Next.js/TypeScript)

#### Naming Conventions

```typescript
// Componentes: PascalCase
export default function DocentePage() { ... }

// Funciones: camelCase
const getDocentes = async () => { ... }

// Variables: camelCase
const docenteId = '...';

// Constantes: UPPER_SNAKE_CASE
const MAX_HORAS = 40;

// Tipos/Interfaces: PascalCase
interface Docente { ... }
type DocenteId = string;
```

#### Estructura de Páginas

```typescript
"use client"; // Si usa hooks

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";

export default function DocentePage() {
  // 1. Estados
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Efectos
  useEffect(() => {
    loadDocentes();
  }, []);
  
  // 3. Funciones
  const loadDocentes = async () => { ... };
  const handleCreate = async () => { ... };
  
  // 4. Render
  return (
    <ProtectedLayout>
      {/* UI */}
    </ProtectedLayout>
  );
}
```

#### Manejo de Errores

```typescript
try {
  setLoading(true);
  const data = await getDocentes();
  setDocentes(data);
} catch (err: any) {
  setError(err.message || 'Error al cargar docentes');
} finally {
  setLoading(false);
}
```

#### Validación con Zod

```typescript
import { z } from 'zod';

const docenteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
});

type DocenteFormData = z.infer<typeof docenteSchema>;
```

---

## 11. GUÍA DE DESARROLLO

### Setup Inicial

#### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd Examen2-Si1
```

#### 2. Configurar Variables de Entorno

```bash
# Copiar .env.example
cp .env.example .env

# Editar .env con tus configuraciones
```

#### 3. Levantar con Docker

```bash
# Construir y levantar contenedores
docker compose up -d --build

# Ver logs
docker compose logs -f

# Ejecutar migraciones
docker compose exec backend php artisan migrate

# Ejecutar seeders
docker compose exec backend php artisan db:seed
```

#### 4. Acceder a la Aplicación

```
Frontend: http://localhost:3000
Backend API: http://localhost:8000/api
```

### Comandos Útiles

#### Backend

```bash
# Entrar al contenedor
docker compose exec backend bash

# Artisan commands
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan route:list
docker compose exec backend php artisan tinker

# Limpiar cache
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
```

#### Frontend

```bash
# Entrar al contenedor
docker compose exec frontend sh

# Instalar dependencias (si es necesario)
docker compose exec frontend npm install

# Ver logs
docker compose logs -f frontend
```

### Agregar una Nueva Funcionalidad

#### Paso 1: Backend - Modelo y Migración

```bash
# Crear migración
docker compose exec backend php artisan make:migration create_nueva_tabla

# Crear modelo
docker compose exec backend php artisan make:model Domain/NuevoModulo/Models/NuevoModelo
```

#### Paso 2: Backend - Controlador

```bash
docker compose exec backend php artisan make:controller Api/NuevoModulo/NuevoController
```

#### Paso 3: Backend - Rutas

```php
// routes/api.php
Route::prefix('nuevo-modulo')->group(function () {
    Route::get('/', [NuevoController::class, 'index']);
    Route::post('/', [NuevoController::class, 'store']);
    // ...
});
```

#### Paso 4: Frontend - Servicio

```typescript
// frontend/src/services/nuevo.service.ts
export const getNuevos = async (): Promise<Nuevo[]> => {
  return api.get('/nuevo-modulo');
};
```

#### Paso 5: Frontend - Tipos

```typescript
// frontend/src/types/index.ts
export interface Nuevo {
  id: string;
  nombre: string;
  // ...
}
```

#### Paso 6: Frontend - Página

```typescript
// frontend/src/app/nuevo-modulo/page.tsx
export default function NuevoModuloPage() {
  // Implementación
}
```

### Testing

#### Backend - Tests

```bash
docker compose exec backend php artisan test
```

#### Frontend - Tests (si se configuran)

```bash
docker compose exec frontend npm test
```

---

## 12. TESTING Y DEBUGGING

### Debugging Backend

#### Logs de Laravel

```bash
# Ver logs en tiempo real
docker compose logs -f backend

# Ver logs específicos
docker compose exec backend tail -f storage/logs/laravel.log
```

#### Tinker (REPL de Laravel)

```bash
docker compose exec backend php artisan tinker

# Ejemplos
$docente = App\Domain\Academico\Models\Docente::first();
$docente->cargas;
```

#### Debug con dd() o dump()

```php
// En código
dd($variable);
dump($variable);
```

### Debugging Frontend

#### React DevTools

- Instalar extensión del navegador
- Inspeccionar componentes y estado

#### Console Logs

```typescript
console.log('Debug:', variable);
console.table(array);
```

#### Network Tab

- Ver requests HTTP
- Verificar headers, body, responses

### Errores Comunes

#### Error: "Token expired" o "Unauthenticated"

**Solución:**
- Verificar que el token esté en localStorage
- Verificar que el header Authorization esté presente
- Hacer logout y login nuevamente

#### Error: "CORS"

**Solución:**
- Verificar `CORS_ALLOWED_ORIGINS` en `.env`
- Verificar `SANCTUM_STATEFUL_DOMAINS`
- Limpiar cache: `php artisan config:clear`

#### Error: "Class not found"

**Solución:**
```bash
docker compose exec backend composer dump-autoload
```

#### Error: "Migration failed"

**Solución:**
```bash
# Ver estado de migraciones
docker compose exec backend php artisan migrate:status

# Rollback y re-migrar
docker compose exec backend php artisan migrate:rollback
docker compose exec backend php artisan migrate
```

---

## 13. DEPLOYMENT Y PRODUCCIÓN

### Preparación para Azure

#### 1. Variables de Entorno

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.azurewebsites.net
NEXT_PUBLIC_API_URL=https://tu-dominio.azurewebsites.net/api

DB_HOST=tu-servidor-postgres.postgres.database.azure.com
DB_DATABASE=examen2_db
DB_USERNAME=usuario
DB_PASSWORD=password_seguro

APP_TIMEZONE=America/La_Paz
TZ=America/La_Paz
```

#### 2. Optimizaciones

```bash
# Backend
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache

# Frontend
docker compose exec frontend npm run build
```

#### 3. Seguridad

- ✅ Cambiar passwords por defecto
- ✅ Configurar SSL/HTTPS
- ✅ Configurar firewall de PostgreSQL
- ✅ Revisar permisos de archivos
- ✅ Deshabilitar debug en producción

### Docker Compose para Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      APP_ENV: production
      APP_DEBUG: false
    # ... configuración de producción

  frontend:
    build: 
      context: ./frontend
      target: production
    # ... configuración de producción
```

---

## 14. TROUBLESHOOTING COMÚN

### Problema: Contenedores no inician

**Solución:**
```bash
# Ver logs
docker compose logs

# Reconstruir
docker compose down
docker compose up -d --build
```

### Problema: Base de datos no conecta

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Verificar variables de entorno
docker compose exec backend env | grep DB_

# Probar conexión
docker compose exec backend php artisan tinker
>>> DB::connection()->getPdo();
```

### Problema: Frontend no carga

**Solución:**
```bash
# Verificar que frontend esté corriendo
docker compose ps frontend

# Ver logs
docker compose logs frontend

# Reinstalar dependencias
docker compose exec frontend npm install
```

### Problema: Permisos de archivos

**Solución:**
```bash
# Backend
docker compose exec backend chmod -R 775 storage bootstrap/cache
docker compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

---

## 15. EJEMPLOS PRÁCTICOS

### Ejemplo 1: Crear un Nuevo Endpoint

#### Backend

```php
// routes/api.php
Route::get('/docentes/{id}/cargas', [DocenteController::class, 'getCargas']);

// DocenteController.php
public function getCargas(string $id)
{
    $docente = Docente::with('cargas.grupo.materia')->findOrFail($id);
    
    return response()->json([
        'data' => $docente->cargas
    ]);
}
```

#### Frontend

```typescript
// docente.service.ts
export const getCargasDocente = async (docenteId: string): Promise<CargaDocente[]> => {
  return api.get(`/docentes/${docenteId}/cargas`);
};

// En componente
const cargas = await getCargasDocente(docenteId);
```

### Ejemplo 2: Agregar Validación Personalizada

```php
// En controlador
$validator = Validator::make($request->all(), [
    'horas' => [
        'required',
        'integer',
        'min:1',
        'max:40',
        function ($attribute, $value, $fail) {
            $totalHoras = CargaDocente::where('docente_id', $request->docente_id)
                ->sum('horas_asignadas');
            
            if ($totalHoras + $value > 40) {
                $fail('El docente no puede tener más de 40 horas semanales.');
            }
        },
    ],
]);
```

### Ejemplo 3: Agregar Filtro en Listado

#### Backend

```php
public function index(Request $request)
{
    $query = Docente::query();
    
    // Filtro por nombre
    if ($request->filled('nombre')) {
        $query->where('nombre', 'ilike', "%{$request->nombre}%");
    }
    
    // Filtro por carrera
    if ($request->filled('carrera_id')) {
        $query->whereHas('cargas.grupo.materia', function ($q) use ($request) {
            $q->where('carrera_id', $request->carrera_id);
        });
    }
    
    return $query->paginate(15);
}
```

#### Frontend

```typescript
const [filtroNombre, setFiltroNombre] = useState('');
const [filtroCarrera, setFiltroCarrera] = useState('');

const loadDocentes = async () => {
  const params = new URLSearchParams();
  if (filtroNombre) params.append('nombre', filtroNombre);
  if (filtroCarrera) params.append('carrera_id', filtroCarrera);
  
  const data = await getDocentes({ params: params.toString() });
  setDocentes(data);
};
```

### Ejemplo 4: Agregar Exportación

#### Backend

```php
// Crear clase de exportación
// app/Exports/DocentesExport.php
class DocentesExport extends BaseExcelExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Docente::all();
    }
    
    public function headings(): array
    {
        return ['ID', 'Nombre', 'Apellido', 'CI', 'Email'];
    }
}

// En controlador
public function exportar(Request $request)
{
    $formato = $request->get('formato', 'excel');
    
    if ($formato === 'pdf') {
        return (new DocentesPdfExport())->download();
    }
    
    return Excel::download(new DocentesExport(), 'docentes.xlsx');
}
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial

- [Laravel 11 Docs](https://laravel.com/docs/11.x)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Docs](https://docs.docker.com/)

### Archivos de Referencia en el Proyecto

- `README.md` - Documentación principal
- `ONBOARDING_COLABORADOR.md` - Guía de onboarding
- `GUIA_COMPLETA_PROYECTO.md` - Guía completa del proyecto

### Comandos de Referencia Rápida

```bash
# Docker
docker compose up -d              # Levantar contenedores
docker compose down               # Detener contenedores
docker compose logs -f            # Ver logs
docker compose exec backend bash  # Entrar al backend
docker compose exec frontend sh   # Entrar al frontend

# Backend
php artisan migrate               # Ejecutar migraciones
php artisan db:seed               # Ejecutar seeders
php artisan route:list            # Listar rutas
php artisan tinker                # REPL
php artisan cache:clear           # Limpiar cache

# Frontend
npm install                       # Instalar dependencias
npm run dev                       # Modo desarrollo
npm run build                     # Build producción
```

---

## 🎯 CONCLUSIÓN

Este documento proporciona el contexto completo del sistema. Para cualquier duda:

1. Revisa este documento primero
2. Consulta `ONBOARDING_COLABORADOR.md` para detalles específicos
3. Revisa el código fuente (está bien documentado)
4. Consulta con el equipo

**¡Bienvenido al equipo y éxito en el desarrollo! 🚀**

---

**Última actualización:** Noviembre 2025  
**Versión del documento:** 1.0

