# 🎓 Sistema de Asistencias - Universidad

Sistema completo de gestión académica y control de asistencias desarrollado con arquitectura moderna y Domain-Driven Design.

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

---

## 🚀 Stack Tecnológico

### Backend
- **Laravel 11** - Framework PHP con arquitectura DDD
- **PostgreSQL 15** - Base de datos relacional
- **Laravel Sanctum** - Autenticación API con Bearer tokens
- **Timezone** - America/La_Paz (Bolivia)
- **Bitácora** - Sistema completo de auditoría

### Frontend
- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **React Hook Form + Zod** - Validación de formularios
- **Responsive Design** - Móvil y escritorio

### DevOps
- **Docker & Docker Compose** - Containerización
- **Nginx** - Reverse proxy
- **Azure Ready** - Preparado para despliegue en la nube

---

## 📋 Características Implementadas

### ✅ Sistema de Autenticación
- [x] Login dual (usuarios y superadmin)
- [x] Autenticación con Sanctum (Bearer tokens)
- [x] Sistema de roles y permisos (RBAC)
- [x] Protección de rutas frontend y backend
- [x] Cierre de sesión con revocación de tokens

### ✅ Gestión de Usuarios
- [x] CRUD completo de usuarios
- [x] Asignación múltiple de roles
- [x] Suspender/Activar usuarios
- [x] Validaciones de seguridad (no eliminar único admin)
- [x] Estadísticas de usuarios

### ✅ Roles y Permisos
- [x] CRUD de roles con asignación de permisos
- [x] CRUD de permisos agrupados por módulo
- [x] Validación de roles en uso
- [x] Sistema jerárquico de permisos

### ✅ Gestión Académica
- [x] **Docentes**: CRUD con usuario asociado, validación de CI único
- [x] **Materias**: CRUD con códigos únicos, filtros por semestre
- [x] **Grupos**: CRUD con materia, docente, aula y horarios
- [x] Estadísticas por módulo

### ✅ Infraestructura
- [x] **Aulas**: CRUD con edificios, tipos y capacidad
- [x] Validación de códigos únicos
- [x] Estadísticas de ocupación

### ✅ Gestión de Horarios
- [x] **Bloques Horarios**: CRUD con validación de solapamiento
- [x] Formato 24h (HH:MM)
- [x] Cálculo automático de duración

### ✅ Sistema de Bitácora (Auditoría)
- [x] Registro automático de todas las acciones
- [x] 10 tipos de eventos (LOGIN, CREAR, ACTUALIZAR, ELIMINAR, etc.)
- [x] Captura de IP, User-Agent, fecha/hora
- [x] Filtros avanzados (acción, fecha, usuario)
- [x] Estadísticas de actividad
- [x] 100% de cobertura en todos los CRUDs

---

## 🏗️ Arquitectura

```
Examen2-Si1/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Domain/            # Domain-Driven Design
│   │   │   ├── Auth/          # Usuarios, Roles, Permisos
│   │   │   ├── Academico/     # Docentes, Materias, Grupos
│   │   │   ├── Infraestructura/ # Aulas, Edificios
│   │   │   ├── TiempoHorarios/  # Bloques Horarios
│   │   │   ├── Asistencia/    # Control de asistencias
│   │   │   └── Shared/        # Bitácora, Traits
│   │   ├── Http/
│   │   │   ├── Controllers/   # API Controllers
│   │   │   ├── Middleware/    # TrustProxies, Sanctum
│   │   │   └── Resources/     # API Resources
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/        # 9 migraciones
│   │   └── seeders/           # Datos de prueba
│   ├── routes/api.php         # 50+ endpoints
│   └── config/                # Configuración
│
├── frontend/                   # Next.js 16
│   └── src/
│       ├── app/               # Pages (App Router)
│       │   ├── login/         # Autenticación
│       │   ├── admin-login/   # Login superadmin
│       │   ├── dashboard/     # Dashboard
│       │   ├── usuarios/      # Gestión usuarios
│       │   ├── roles/         # Gestión roles
│       │   ├── permisos/      # Gestión permisos
│       │   ├── docentes/      # Gestión docentes
│       │   ├── academico/     # Materias y Grupos
│       │   ├── infra/         # Aulas
│       │   ├── horarios/      # Bloques horarios
│       │   └── bitacora/      # Auditoría
│       ├── components/
│       │   ├── shared/        # ProtectedLayout, Navbar
│       │   ├── forms/         # Formularios reutilizables
│       │   └── ui/            # Componentes UI
│       ├── services/          # API Services
│       ├── lib/               # Utilities (api, auth)
│       └── types/             # TypeScript types
│
├── nginx/                      # Reverse Proxy
│   └── nginx.conf
│
├── docker-compose.yml          # Orquestación
├── DEPLOY_AZURE.md            # Guía de despliegue Azure
├── VALIDACION_CRUDS.md        # Reporte de validación
└── README.md                  # Este archivo
```

---

## 📋 Prerrequisitos

- **Docker Desktop** (recomendado) o Docker Engine
- **Git**
- *Opcional*: Node.js 18+ y PHP 8.2+ para desarrollo local

---

## 🛠️ Instalación Rápida con Docker

### 1. Clonar el repositorio

```bash
git clone https://github.com/sebach0/Examen2-SI1.git
cd Examen2-Si1
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.example frontend/.env.local
```

**Editar `backend/.env`:**
```env
APP_NAME="Sistema de Asistencias"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_TIMEZONE=America/La_Paz

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=examen2_db
DB_USERNAME=examen2_user
DB_PASSWORD=examen2_password

SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
```

**Editar `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Iniciar con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar que todo esté corriendo
docker-compose ps
```

Deberías ver 4 servicios corriendo:
- ✅ `postgres` - Base de datos PostgreSQL 15
- ✅ `backend` - Laravel 11 API (puerto 8000)
- ✅ `frontend` - Next.js 16 (puerto 3001)
- ✅ `nginx` - Reverse proxy (puerto 80)

### 4. Ejecutar migraciones y seeders

```bash
# Ejecutar migraciones
docker-compose exec backend php artisan migrate

# Ejecutar seeders (datos de prueba)
docker-compose exec backend php artisan db:seed
```

### 5. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Nginx**: http://localhost (puerto 80)

### 6. Credenciales de prueba

**Superadmin:**
```
Usuario: admin
Password: password
URL: http://localhost:3000/admin-login
```

**Usuario normal:**
```
Usuario: asistente1
Password: password
URL: http://localhost:3000/login
```

---

## 🧪 Comandos Útiles

### Docker

```bash
# Detener servicios
docker-compose down

# Reconstruir solo backend
docker-compose up -d --build backend

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ejecutar comandos en el contenedor
docker-compose exec backend php artisan route:list
docker-compose exec backend php artisan tinker

# Limpiar todo (¡cuidado! elimina volúmenes)
docker-compose down -v
```

### Laravel (Backend)

```bash
# Limpiar cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear

# Crear nueva migración
docker-compose exec backend php artisan make:migration create_xxx_table

# Crear nuevo controlador
docker-compose exec backend php artisan make:controller Api/XxxController

# Ejecutar tests
docker-compose exec backend php artisan test

# Ver rutas disponibles
docker-compose exec backend php artisan route:list
```

### Next.js (Frontend)

```bash
# Limpiar cache de Next.js
cd frontend
rm -rf .next
npm run dev

# Lint
npm run lint

# Build para producción
npm run build
```

### PostgreSQL

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U examen2_user -d examen2_db

# Backup de base de datos
docker-compose exec postgres pg_dump -U examen2_user examen2_db > backup.sql

# Restore de base de datos
docker-compose exec -T postgres psql -U examen2_user examen2_db < backup.sql

# Ver registros de bitácora
docker-compose exec postgres psql -U examen2_user -d examen2_db \
  -c "SELECT accion, descripcion, created_at FROM bitacora ORDER BY created_at DESC LIMIT 10;"

# Contar registros por tabla
docker-compose exec postgres psql -U examen2_user -d examen2_db \
  -c "SELECT COUNT(*) FROM bitacora;"
```

---

## 📊 Endpoints API

### Autenticación
```
POST   /api/login              # Login usuario
POST   /api/admin-login        # Login superadmin
POST   /api/logout             # Logout
GET    /api/me                 # Usuario autenticado
```

### Usuarios
```
GET    /api/usuarios           # Listar usuarios
GET    /api/usuarios/{id}      # Ver usuario
POST   /api/usuarios           # Crear usuario
PUT    /api/usuarios/{id}      # Actualizar usuario
DELETE /api/usuarios/{id}      # Eliminar usuario
POST   /api/usuarios/{id}/estado  # Cambiar estado
GET    /api/usuarios/estadisticas # Estadísticas
```

### Roles y Permisos
```
GET    /api/roles              # Listar roles
POST   /api/roles              # Crear rol
PUT    /api/roles/{id}         # Actualizar rol
DELETE /api/roles/{id}         # Eliminar rol
GET    /api/permisos           # Listar permisos
GET    /api/permisos/agrupados # Permisos por módulo
POST   /api/roles/{id}/permisos # Asignar permisos
```

### Docentes
```
GET    /api/docentes           # Listar docentes
GET    /api/docentes/{id}      # Ver docente
POST   /api/docentes           # Crear docente
PUT    /api/docentes/{id}      # Actualizar docente
DELETE /api/docentes/{id}      # Eliminar docente
GET    /api/docentes/estadisticas # Estadísticas
```

### Materias
```
GET    /api/materias           # Listar materias
GET    /api/materias/{id}      # Ver materia
POST   /api/materias           # Crear materia
PUT    /api/materias/{id}      # Actualizar materia
DELETE /api/materias/{id}      # Eliminar materia
```

### Grupos
```
GET    /api/grupos             # Listar grupos
GET    /api/grupos/{id}        # Ver grupo
POST   /api/grupos             # Crear grupo
PUT    /api/grupos/{id}        # Actualizar grupo
DELETE /api/grupos/{id}        # Eliminar grupo
```

### Aulas
```
GET    /api/aulas              # Listar aulas
GET    /api/aulas/{id}         # Ver aula
POST   /api/aulas              # Crear aula
PUT    /api/aulas/{id}         # Actualizar aula
DELETE /api/aulas/{id}         # Eliminar aula
GET    /api/aulas/edificios    # Listar edificios
GET    /api/aulas/tipos        # Tipos de aula
GET    /api/aulas/estadisticas # Estadísticas
```

### Bloques Horarios
```
GET    /api/bloques            # Listar bloques horarios
GET    /api/bloques/{id}       # Ver bloque
POST   /api/bloques            # Crear bloque
PUT    /api/bloques/{id}       # Actualizar bloque
DELETE /api/bloques/{id}       # Eliminar bloque
GET    /api/bloques/estadisticas # Estadísticas
```

### Bitácora
```
GET    /api/bitacora           # Listar registros
GET    /api/bitacora/estadisticas # Estadísticas
```

**Ver documentación completa**: `backend/routes/api.php`

---

## 🔐 Sistema de Bitácora

El sistema registra automáticamente **todas las acciones** realizadas por los usuarios:

### Eventos Registrados
- `LOGIN` - Inicio de sesión exitoso
- `LOGIN_ADMIN` - Acceso de superadmin
- `LOGIN_FALLIDO` - Intentos fallidos
- `LOGOUT` - Cierre de sesión
- `CREAR` - Creación de registros
- `ACTUALIZAR` - Modificación de registros
- `ELIMINAR` - Eliminación de registros
- `CONSULTAR` - Consultas y listados
- `EXPORTAR` - Exportación de datos
- `IMPORTAR` - Importación de datos

### Información Capturada
- Usuario que ejecuta la acción
- Tipo de acción
- Descripción detallada
- IP del cliente
- User-Agent
- Timestamp (America/La_Paz)
- Datos adicionales en JSON

### Ejemplo de Consulta
```sql
SELECT 
  accion,
  descripcion,
  ip_address,
  created_at AT TIME ZONE 'America/La_Paz' as fecha
FROM bitacora 
WHERE usuario_id = 'xxx'
ORDER BY created_at DESC
LIMIT 20;
```

### Implementación
El sistema utiliza el trait `LogsActivity` en todos los controladores:

```php
use App\Domain\Shared\Traits\LogsActivity;

class UsuarioController extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        $usuario = Usuario::create($validated);
        
        $this->logActivity(
            'CREAR',
            "Usuario creado: {$usuario->name}",
            $usuario->toArray()
        );
    }
}
```

---

## 🚀 Despliegue en Azure

El proyecto está **preparado** para despliegue en Microsoft Azure. Ver guía completa:

- **[DEPLOY_AZURE.md](./DEPLOY_AZURE.md)** - Guía paso a paso
- **[backend/.env.azure.example](./backend/.env.azure.example)** - Configuración Azure

### Servicios Azure Recomendados
- **Azure App Service** - Backend Laravel
- **Azure Database for PostgreSQL** - Base de datos
- **Azure Static Web Apps** - Frontend Next.js (opcional)
- **Azure Application Gateway** - Load balancer y SSL

### Características Azure Ready
✅ TrustProxies middleware configurado  
✅ Variables de entorno documentadas  
✅ Health check endpoint (`/api/health`)  
✅ Timezone America/La_Paz  
✅ CORS configurado correctamente  

---

## 📖 Documentación Adicional

- **[CRUD_VALIDATION_REPORT.md](./backend/CRUD_VALIDATION_REPORT.md)** - Reporte técnico detallado
- **[VALIDACION_CRUDS.md](./VALIDACION_CRUDS.md)** - Resumen ejecutivo visual
- **[CORRECCION_ERRORES.md](./CORRECCION_ERRORES.md)** - Historial de correcciones

---

## 🧪 Testing

```bash
# Backend (PHPUnit)
docker-compose exec backend php artisan test

# Frontend (Jest - cuando esté configurado)
cd frontend
npm run test
```

---

## 📝 Convenciones de Código

### Backend (Laravel)
- **PSR-12** para estilo de código PHP
- **Domain-Driven Design** para organización
- **Repository Pattern** para acceso a datos
- **Trait LogsActivity** para bitácora

### Frontend (Next.js)
- **TypeScript** obligatorio
- **ESLint** + **Prettier** para formateo
- **Conventional Commits** para mensajes de git

### Git Commits
```
feat: Nueva característica
fix: Corrección de bug
docs: Documentación
style: Formato de código
refactor: Refactorización
test: Tests
chore: Mantenimiento
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🔒 Seguridad

### Implementaciones de Seguridad
- ✅ Autenticación con Laravel Sanctum (Bearer tokens)
- ✅ CORS configurado para desarrollo y producción
- ✅ Validación de datos con Zod (frontend) y Laravel Validator (backend)
- ✅ Protección contra CSRF
- ✅ Sanitización de inputs
- ✅ Sistema de roles y permisos (RBAC)
- ✅ Bitácora de auditoría completa

### Recomendaciones para Producción
1. Cambiar todas las credenciales por defecto
2. Configurar `APP_DEBUG=false`
3. Usar HTTPS con certificado SSL
4. Configurar firewall (solo puertos necesarios)
5. Backups automáticos de base de datos
6. Monitoreo de logs y errores

---

## 📄 Licencia

Este proyecto es parte de un examen académico para la Universidad.

---

## 👨‍💻 Autor

- **Sebastian** - [sebach0](https://github.com/sebach0)

---

## 🙏 Agradecimientos

- Laravel Documentation
- Next.js Documentation
- Tailwind CSS
- Docker Community
- PostgreSQL Team

---

## 📞 Soporte

¿Problemas o preguntas?
- 📧 Email: [tu-email@ejemplo.com]
- 📚 Issues: [GitHub Issues](https://github.com/sebach0/Examen2-SI1/issues)

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**
