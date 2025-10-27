# 🎓 Sistema de Control de Asistencias# Examen2-SI1

Sistema completo de gestión académica y control de asistencias desarrollado con arquitectura moderna de microservicios.Proyecto full-stack con Laravel, Next.js, PostgreSQL y Docker.

## 🚀 Tecnologías## 🚀 Stack Tecnológico

### Backend- **Backend**: Laravel 10+ (PHP 8.2)

- **Laravel 11** - Framework PHP- **Frontend**: Next.js 14+ (React 18)

- **PostgreSQL 15** - Base de datos relacional- **Base de Datos**: PostgreSQL 15

- **Laravel Sanctum** - Autenticación API con tokens- **Containerización**: Docker & Docker Compose

- **Deploy**: Microsoft Azure VM

### Frontend

- **Next.js 16** - Framework React con App Router## 📋 Prerrequisitos

- **TypeScript** - Tipado estático

- **Tailwind CSS** - Estilos utility-first- Docker Desktop instalado

- **React Hook Form + Zod** - Validación de formularios- Git

- Node.js 18+ (para desarrollo local)

### DevOps- PHP 8.2+ y Composer (para desarrollo local)

- **Docker & Docker Compose** - Containerización

- **Nginx** - Reverse proxy## 🛠️ Instalación y Configuración

- **Git** - Control de versiones

### 1. Clonar el repositorio

## 📋 Características

```````bash

### ✅ Módulo de Autenticación (Implementado)git clone <tu-repositorio>

- [x] Login dual (usuarios normales y superadmin)cd Examen2-Si1

- [x] Autenticación con JWT/Sanctum```

- [x] Sistema de roles y permisos (RBAC)

- [x] Cierre de sesión seguro### 2. Configurar variables de entorno

- [x] Protección de rutas

```bash

### 🔄 Módulos en Desarrollo# Copiar el archivo de ejemplo

- [ ] Gestión Académica (Materias, Grupos, Gestiones)cp .env.example .env

- [ ] Control de Asistencias (Marcar, Reportes)

- [ ] Gestión de Horarios (Bloques, Cargas, Programación)# Editar .env con tus configuraciones

- [ ] Infraestructura (Aulas, Edificios)```



## 🏗️ Arquitectura### 3. Inicializar el Backend (Laravel)



``````bash

examen2-si1/# Crear un nuevo proyecto Laravel en la carpeta backend

├── backend/          # API Laravelcomposer create-project laravel/laravel backend

│   ├── app/

│   │   └── Domain/   # Domain-Driven Design# O si ya tienes el proyecto, instalar dependencias

│   │       ├── Auth/cd backend

│   │       ├── Academico/composer install

│   │       ├── Asistencia/php artisan key:generate

│   │       └── ...```

│   ├── routes/

│   └── database/### 4. Inicializar el Frontend (Next.js)

├── frontend/         # Next.js App

│   └── src/```bash

│       ├── app/      # Pages (App Router)# Crear un nuevo proyecto Next.js en la carpeta frontend

│       ├── components/npx create-next-app@latest frontend --typescript --tailwind --app

│       ├── services/

│       └── lib/# O si ya tienes el proyecto, instalar dependencias

├── nginx/           # Reverse Proxycd frontend

└── docker-compose.ymlnpm install

```````

## 🔧 Instalación y Configuración### 5. Configurar Laravel para PostgreSQL

### PrerrequisitosEdita `backend/.env`:

- Docker Desktop

- Git```env

DB_CONNECTION=pgsql

### Paso 1: Clonar el repositorioDB_HOST=postgres

DB_PORT=5432

```bashDB_DATABASE=examen2_db

git clone https://github.com/TU_USUARIO/examen2-si1.gitDB_USERNAME=examen2_user

cd examen2-si1DB_PASSWORD=examen2_password

```

### Paso 2: Configurar variables de entorno### 6. Configurar Next.js

**Backend (.env):**Crea `frontend/next.config.js`:

```````bash

cd backend```js

cp .env.example .env/** @type {import('next').NextConfig} */

```const nextConfig = {

  output: "standalone",

Editar `backend/.env`:  env: {

```env    NEXT_PUBLIC_API_URL:

APP_NAME="Sistema de Asistencias"      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",

APP_ENV=local  },

APP_DEBUG=true};

APP_URL=http://localhost:8000

module.exports = nextConfig;

DB_CONNECTION=pgsql```

DB_HOST=postgres

DB_PORT=5432## 🐳 Ejecutar con Docker

DB_DATABASE=examen2_db

DB_USERNAME=examen2_user### Desarrollo

DB_PASSWORD=examen2_password

``````bash

# Iniciar todos los servicios

**Frontend (.env.local):**docker-compose up -d

```bash

cd ../frontend# Ver logs

cp .env.example .env.localdocker-compose logs -f

```````

# Acceder al contenedor de backend

Editar `frontend/.env.local`:docker-compose exec backend bash

````env

NEXT_PUBLIC_API_URL=http://localhost:8000/api# Ejecutar migraciones

```docker-compose exec backend php artisan migrate



### Paso 3: Levantar los contenedores# Detener servicios

docker-compose down

```bash```

cd ..

docker-compose up -d --build### Servicios disponibles

````

- **Frontend**: http://localhost:3000

### Paso 4: Instalar dependencias y ejecutar migraciones- **Backend API**: http://localhost:8000

- **PostgreSQL**: localhost:5432

````bash- **Nginx (Proxy)**: http://localhost:80

# Backend: Instalar dependencias de Composer

docker-compose exec backend composer install## 📁 Estructura del Proyecto



# Backend: Generar key de aplicación```

docker-compose exec backend php artisan key:generateExamen2-Si1/

├── backend/              # Laravel API

# Backend: Ejecutar migraciones y seeders│   ├── app/

docker-compose exec backend php artisan migrate:fresh --seed│   ├── database/

│   ├── routes/

# Frontend: Ya se instalan automáticamente en el build│   └── Dockerfile

```├── frontend/             # Next.js App

│   ├── src/

### Paso 5: Acceder a la aplicación│   ├── public/

│   └── Dockerfile

- **Frontend:** http://localhost:3000├── nginx/                # Configuración Nginx

- **Backend API:** http://localhost:8000│   └── nginx.conf

- **Nginx:** http://localhost├── docker-compose.yml    # Orquestación Docker

└── README.md

## 👤 Usuarios de Prueba```



### Superadmin## 🔧 Comandos Útiles

- **Usuario:** `admin`

- **Contraseña:** `admin123`### Backend (Laravel)

- **URL:** http://localhost:3000/admin-login

```bash

### Docente# Ejecutar migraciones

- **Usuario:** `docente1`docker-compose exec backend php artisan migrate

- **Contraseña:** `docente123`

- **URL:** http://localhost:3000/login# Crear un modelo con migración

docker-compose exec backend php artisan make:model NombreModelo -m

> ⚠️ **IMPORTANTE:** Cambiar estas credenciales en producción

# Crear un controlador

## 📡 API Endpointsdocker-compose exec backend php artisan make:controller NombreController



### Autenticación# Limpiar caché

docker-compose exec backend php artisan cache:clear

| Método | Endpoint | Descripción | Auth |```

|--------|----------|-------------|------|

| POST | `/api/auth/login` | Login normal | No |### Frontend (Next.js)

| POST | `/api/auth/admin-login` | Login superadmin | No |

| POST | `/api/auth/logout` | Cerrar sesión | Sí |```bash

| GET | `/api/auth/me` | Usuario actual | Sí |# Instalar paquetes

docker-compose exec frontend npm install <paquete>

## 🗄️ Esquema de Base de Datos

# Ejecutar en modo desarrollo (sin Docker)

### Tablas Principalescd frontend

npm run dev

- **usuario** - Usuarios del sistema```

- **rol** - Roles (superadmin, docente, coordinador)

- **permiso** - Permisos granulares### Base de Datos

- **materia** - Materias/asignaturas

- **grupo** - Grupos de estudiantes```bash

- **asistencia** - Registros de asistencia# Acceder a PostgreSQL

- **aula** - Infraestructura físicadocker-compose exec postgres psql -U examen2_user -d examen2_db

- **bloque_horario** - Bloques de tiempo

# Backup de la base de datos

## 🛠️ Comandos Útilesdocker-compose exec postgres pg_dump -U examen2_user examen2_db > backup.sql



### Docker# Restaurar backup

docker-compose exec -T postgres psql -U examen2_user examen2_db < backup.sql

```bash```

# Iniciar contenedores

docker-compose up -d## ☁️ Deploy en Azure



# Ver logs### 1. Preparar la VM en Azure

docker-compose logs -f

```bash

# Detener contenedores# Conectarse a la VM

docker-compose downssh usuario@tu-vm-azure.com



# Reconstruir contenedores# Instalar Docker

docker-compose up -d --buildcurl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh

# Ver contenedores activossudo usermod -aG docker $USER

docker-compose ps

```# Instalar Docker Compose

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

### Laravel (Backend)sudo chmod +x /usr/local/bin/docker-compose

````

````bash

# Acceder al contenedor### 2. Clonar y configurar el proyecto

docker-compose exec backend bash

```bash

# Ejecutar migraciones# Clonar el repositorio

php artisan migrategit clone <tu-repositorio>

cd Examen2-Si1

# Crear seeder

php artisan make:seeder NombreSeeder# Configurar variables de entorno para producción

cp .env.example .env

# Limpiar cachénano .env  # Editar con configuraciones de producción

php artisan cache:clear

php artisan config:clear# Iniciar servicios

php artisan route:cleardocker-compose up -d

````

# Ejecutar migraciones

### Next.js (Frontend)docker-compose exec backend php artisan migrate --force

````

```bash

# Acceder al contenedor### 3. Configurar firewall en Azure

docker-compose exec frontend sh

Abrir los siguientes puertos en el Network Security Group:

# Limpiar caché de Next.js

rm -rf .next- 80 (HTTP)

- 443 (HTTPS)

# Instalar nueva dependencia- 22 (SSH - solo tu IP)

npm install paquete-nuevo

```### 4. Configurar dominio y SSL (opcional)



## 🧪 Testing```bash

# Instalar Certbot

```bashsudo apt-get install certbot

# Backend: Ejecutar tests

docker-compose exec backend php artisan test# Obtener certificado SSL

sudo certbot certonly --standalone -d tu-dominio.com

# Frontend: Ejecutar tests (cuando estén configurados)```

docker-compose exec frontend npm test

```## 🧪 Testing



## 📦 Estructura de Carpetas```bash

# Backend tests

### Backend (Laravel)docker-compose exec backend php artisan test



```# Frontend tests

backend/docker-compose exec frontend npm test

├── app/```

│   ├── Domain/              # Lógica de negocio por dominio

│   │   ├── Auth/           # Autenticación y autorización## 📝 Notas Importantes

│   │   ├── Academico/      # Gestión académica

│   │   ├── Asistencia/     # Control de asistencias- Cambia las credenciales de la base de datos en producción

│   │   └── Shared/         # Código compartido- Configura `APP_DEBUG=false` en producción

│   └── Http/- Usa variables de entorno para secretos

│       ├── Controllers/    # Controladores API- Configura CORS en Laravel para permitir peticiones del frontend

│       └── Middleware/     # Middleware personalizado- Implementa autenticación (Laravel Sanctum recomendado)

├── database/

│   ├── migrations/         # Migraciones de BD## 🤝 Contribuir

│   └── seeders/           # Datos de prueba

└── routes/1. Fork el proyecto

    └── api.php            # Rutas de API2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)

```3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

4. Push a la rama (`git push origin feature/AmazingFeature`)

### Frontend (Next.js)5. Abre un Pull Request



```## 📄 Licencia

frontend/src/

├── app/                    # Pages (App Router)Este proyecto está bajo la Licencia MIT.

│   ├── login/             # Login normal
│   ├── admin-login/       # Login admin
│   ├── dashboard/         # Dashboard principal
│   ├── academico/         # Módulo académico
│   └── asistencia/        # Módulo asistencias
├── components/
│   ├── shared/            # Componentes compartidos
│   ├── forms/             # Formularios reutilizables
│   └── ui/                # Componentes UI base
├── services/              # Servicios API
├── lib/                   # Utilidades
└── types/                 # Tipos TypeScript
````

## 🔒 Seguridad

- ✅ Autenticación con Sanctum (Bearer tokens)
- ✅ CORS configurado para desarrollo
- ✅ Validación de datos con Zod (frontend) y Laravel Validator (backend)
- ✅ Protección contra CSRF
- ✅ Sanitización de inputs
- ✅ Sistema de roles y permisos (RBAC)

## 🚢 Despliegue

Para desplegar en producción, consultar la documentación específica:

- Azure: Ver `AZURE_DEPLOY.md`
- Otros proveedores: Configurar según las guías oficiales

## 📝 Licencia

Este proyecto es parte de un examen académico.

## 👨‍💻 Autor

Desarrollado como proyecto del segundo examen de SI1.

## 🤝 Contribuir

Este es un proyecto académico, pero si encuentras algún bug o mejora:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📞 Soporte

Para dudas o problemas, crear un issue en el repositorio.

---

⭐ Si te fue útil este proyecto, dale una estrella!
