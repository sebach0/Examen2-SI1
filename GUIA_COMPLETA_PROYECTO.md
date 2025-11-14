# 📚 GUÍA COMPLETA DEL PROYECTO

## 🎯 Estado Actual del Proyecto

### ✅ Lo que está implementado y funcional:

1. **Sistema de Autenticación** - Login con roles y permisos
2. **Importación de Usuarios** - Excel/CSV para crear usuarios masivamente
3. **Exportación de Reportes** - Excel y PDF para asistencias
4. **Gestión Académica** - Carreras, Materias, Grupos, Docentes, Gestiones
5. **Infraestructura** - Aulas y Edificios
6. **Horarios** - Bloques horarios y asignación de horarios a grupos
7. **Asistencia** - Control de asistencia docente con QR
8. **Bitácora** - Sistema de auditoría completo

---

## 🗄️ ESTRUCTURA DE LA BASE DE DATOS

### Diagrama de Relaciones

```
┌─────────────┐
│   USUARIO   │ (Tabla base de autenticación)
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│  DOCENTE    │ (Extensión de Usuario)
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────────┐
│ CARGA_DOCENTE   │ (Asigna docente a grupo)
└────────┬────────┘
         │
         │ N:1
         ▼
┌─────────────┐
│   GRUPO     │
└──────┬──────┘
       │
       │ N:1        N:1
       ▼            ▼
┌─────────────┐  ┌─────────────┐
│   MATERIA   │  │  GESTION    │
└──────┬──────┘  └─────────────┘
       │
       │ N:1
       ▼
┌─────────────┐
│  CARRERA    │
└─────────────┘

┌─────────────┐
│   GRUPO     │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────────┐
│ HORARIO_GRUPO   │ (Cuándo y dónde se imparte)
└──────┬──────────┘
       │
       │ N:1        N:1
       ▼            ▼
┌─────────────┐  ┌─────────────┐
│ BLOQUE_HOR. │  │    AULA     │
└─────────────┘  └─────────────┘
```

### Explicación de "Cantidad" en cada módulo:

1. **Grupo → Capacidad**: Número máximo de estudiantes que puede tener el grupo
2. **Carga Docente → Horas Asignadas**: Total de horas semanales que el docente dedica a ese grupo
3. **Materia → Horas Semanales**: Horas de clase por semana que requiere la materia
4. **Materia → Créditos**: Créditos académicos de la materia

---

## 🚀 PASO A PASO: EJECUTAR EL PROYECTO

### Paso 1: Verificar Requisitos

```bash
# Verificar que Docker está corriendo
docker --version
docker compose version
```

### Paso 2: Clonar/Acceder al Proyecto

```bash
cd D:\Examen2-Si1
```

### Paso 3: Configurar Variables de Entorno (Si no existen)

```bash
# Verificar si existe .env en la raíz
# Si no existe, crear desde .env.example
```

### Paso 4: Construir e Iniciar Contenedores

```bash
# Opción A: Primera vez (construye todo)
docker compose up -d --build

# Opción B: Si ya construiste antes (más rápido)
docker compose up -d
```

**Tiempo esperado:** 30 segundos - 5 minutos (depende si es primera vez)

### Paso 5: Verificar que los Contenedores Están Corriendo

```bash
docker compose ps
```

**Debes ver 4 contenedores:**

- ✅ `examen2_postgres` - Estado: healthy
- ✅ `examen2_backend` - Estado: Up
- ✅ `examen2_frontend` - Estado: Up
- ✅ `examen2_nginx` - Estado: Up

### Paso 6: Ejecutar Migraciones (Crear Tablas)

```bash
docker compose exec backend php artisan migrate
```

**Salida esperada:**

```
Migrating: 2025_10_27_165939_create_auth_tables
Migrated:  2025_10_27_165939_create_auth_tables
Migrating: 2025_10_27_170022_create_academico_tables
Migrated:  2025_10_27_170022_create_academico_tables
...
```

### Paso 7: Ejecutar Seeders (Crear Datos Iniciales)

```bash
docker compose exec backend php artisan db:seed
```

**Salida esperada:**

```
🔐 Creando sistema de permisos y roles...
✅ Permisos creados
✅ Roles creados con sus permisos
✅ Usuarios creados

🎉 Sistema de autenticación inicializado:
   Superadmin: superadmin / super123
   Admin: admin / admin123
```

### Paso 8: Acceder al Sistema

Abre tu navegador en:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Nginx:** http://localhost

### Paso 9: Iniciar Sesión

**Credenciales:**

- **Superadmin:**
  - Username: `superadmin`
  - Password: `super123`
- **Admin:**
  - Username: `admin`
  - Password: `admin123`

---

## 📋 FLUJO DE TRABAJO RECOMENDADO

### Orden Lógico para Configurar el Sistema:

#### 1️⃣ **Configuración Inicial (Una vez)**

```
1. Crear Carreras
   └─> Ejemplo: "Ingeniería de Sistemas", "Medicina"

2. Crear Gestiones Académicas
   └─> Ejemplo: "2024-1", "2024-2"
```

#### 2️⃣ **Configuración de Infraestructura**

```
3. Crear Edificios
   └─> Ejemplo: "Edificio A", "Edificio B"

4. Crear Aulas
   └─> Ejemplo: "A-101", "B-205", "Lab-1"
   └─> Asignar: Edificio, Tipo, Capacidad
```

#### 3️⃣ **Configuración Académica**

```
5. Crear Materias
   └─> Ejemplo: "Cálculo I", "Física II"
   └─> Asignar: Carrera, Código, Horas Semanales, Créditos
   └─> Opcional: Agregar Pre-requisitos

6. Crear Grupos
   └─> Ejemplo: "Cálculo I - Grupo A"
   └─> Asignar: Materia, Gestión, Código (A, B, C), Capacidad
```

#### 4️⃣ **Configuración de Docentes**

```
7. Crear Usuarios (si no se importaron)
   └─> O usar: Importación masiva (Excel/CSV)

8. Crear Docentes
   └─> Asignar: Usuario, CI, Nombre, Teléfono
```

#### 5️⃣ **Configuración de Horarios**

```
9. Crear Bloques Horarios
   └─> Ejemplo: "Lunes 8:00-9:30", "Martes 10:00-11:30"
   └─> Día de semana (1-7), Hora inicio, Hora fin

10. Asignar Carga Docente
    └─> Asignar: Docente → Grupo
    └─> Especificar: Horas Asignadas

11. Crear Horarios de Grupos
    └─> Asignar: Grupo → Bloque Horario → Aula
    └─> Especificar: Tipo (teoría, práctica, laboratorio)
```

#### 6️⃣ **Uso Operativo**

```
12. Marcar Asistencias
    └─> Manual o por QR
    └─> Seleccionar: Horario-Grupo, Docente, Fecha

13. Ver Reportes
    └─> Exportar a Excel o PDF
```

---

## 🔗 RELACIONES ENTRE MÓDULOS EXPLICADAS

### ¿Cómo se conectan los módulos?

#### **Carrera → Materia**

- Una **Carrera** tiene muchas **Materias**
- Ejemplo: "Ingeniería de Sistemas" tiene "Cálculo I", "Programación I", etc.

#### **Materia → Grupo**

- Una **Materia** tiene muchos **Grupos** (en diferentes gestiones)
- Ejemplo: "Cálculo I" tiene grupos A, B, C en "2024-1"

#### **Grupo → Horario**

- Un **Grupo** tiene muchos **Horarios** (puede tener clase varios días)
- Ejemplo: "Cálculo I - Grupo A" tiene clase:
  - Lunes 8:00-9:30 en Aula 101
  - Miércoles 10:00-11:30 en Aula 101

#### **Grupo → Docente**

- Un **Grupo** puede tener varios **Docentes** (teoría, práctica, lab)
- Un **Docente** puede enseñar varios **Grupos**
- Se conecta a través de **Carga Docente**

#### **Horario → Aula**

- Un **Horario** se imparte en un **Aula** específica
- El sistema valida que no haya conflictos (aula ocupada a la misma hora)

---

## 📊 EJEMPLO PRÁCTICO COMPLETO

### Escenario: Configurar "Cálculo I" para el semestre 2024-1

#### Paso 1: Crear/Verificar Carrera

```
Carrera: "Ingeniería de Sistemas"
Código: "ING-SIS"
```

#### Paso 2: Crear/Verificar Gestión

```
Gestión: "2024-1"
Año: 2024
Periodo: "Primer Semestre"
Fecha Inicio: 01/02/2024
Fecha Fin: 30/06/2024
```

#### Paso 3: Crear Materia

```
Materia: "Cálculo I"
Código: "MAT-101"
Carrera: "Ingeniería de Sistemas"
Horas Semanales: 6
Créditos: 8
```

#### Paso 4: Crear Aulas (si no existen)

```
Aula: "A-101"
Edificio: "Edificio A"
Tipo: "Aula"
Capacidad: 40
```

#### Paso 5: Crear Bloques Horarios

```
Bloque 1:
- Día: Lunes (1)
- Hora Inicio: 08:00
- Hora Fin: 09:30

Bloque 2:
- Día: Miércoles (3)
- Hora Inicio: 10:00
- Hora Fin: 11:30
```

#### Paso 6: Crear Grupo

```
Grupo: "Cálculo I - Grupo A"
Materia: "Cálculo I"
Gestión: "2024-1"
Código: "A"
Capacidad: 35
```

#### Paso 7: Crear Docente (si no existe)

```
Usuario: Crear usuario "docente1"
Docente:
- Usuario: docente1
- CI: "1234567"
- Nombre: "Dr. García"
- Teléfono: "70000000"
```

#### Paso 8: Asignar Carga Docente

```
Carga Docente:
- Docente: "Dr. García"
- Grupo: "Cálculo I - Grupo A"
- Horas Asignadas: 6
```

#### Paso 9: Crear Horarios del Grupo

```
Horario 1:
- Grupo: "Cálculo I - Grupo A"
- Bloque: "Lunes 08:00-09:30"
- Aula: "A-101"
- Tipo: "teorica"

Horario 2:
- Grupo: "Cálculo I - Grupo A"
- Bloque: "Miércoles 10:00-11:30"
- Aula: "A-101"
- Tipo: "teorica"
```

#### Paso 10: Marcar Asistencia

```
Asistencia:
- Horario-Grupo: Seleccionar horario creado
- Docente: "Dr. García"
- Fecha: Seleccionar fecha
- Estado: "presente" o "ausente"
```

---

## 🛠️ COMANDOS ÚTILES

### Ver Logs

```bash
# Ver logs del backend
docker compose logs -f backend

# Ver logs del frontend
docker compose logs -f frontend

# Ver logs de postgres
docker compose logs -f postgres
```

### Reiniciar Servicios

```bash
# Reiniciar un servicio específico
docker compose restart backend

# Reiniciar todos
docker compose restart
```

### Detener Todo

```bash
docker compose down
```

### Limpiar Todo (CUIDADO: Borra datos)

```bash
# Detener y eliminar contenedores, volúmenes
docker compose down -v
```

### Acceder a la Base de Datos

```bash
docker compose exec postgres psql -U examen2_user -d examen2_db
```

### Ejecutar Comandos Artisan

```bash
# Ver rutas
docker compose exec backend php artisan route:list

# Limpiar cache
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear

# Verificar estado
docker compose exec backend php artisan about
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Puerto ya en uso"

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Detener contenedores
docker compose down

# Cambiar puertos en docker-compose.yml si es necesario
```

### Error: "Base de datos no conecta"

```bash
# Verificar que postgres está corriendo
docker compose ps postgres

# Ver logs de postgres
docker compose logs postgres

# Reiniciar postgres
docker compose restart postgres
```

### Error: "Permisos denegados"

```bash
# Arreglar permisos de storage
docker compose exec backend chmod -R 775 storage bootstrap/cache
docker compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Error: "Migraciones fallan"

```bash
# Resetear migraciones (CUIDADO: borra datos)
docker compose exec backend php artisan migrate:fresh

# O solo rollback
docker compose exec backend php artisan migrate:rollback
```

---

## 📝 NOTAS IMPORTANTES

1. **Orden de Creación Importante:**

   - Primero: Carreras y Gestiones
   - Segundo: Aulas
   - Tercero: Materias
   - Cuarto: Grupos
   - Quinto: Docentes
   - Sexto: Horarios

2. **Validaciones del Sistema:**

   - No puedes crear un grupo sin materia y gestión
   - No puedes crear un horario sin grupo, bloque y aula
   - El sistema valida conflictos de horarios (aula ocupada)

3. **Datos Iniciales:**

   - Solo se crean usuarios de login (superadmin, admin)
   - Todo lo demás se crea manualmente o por importación

4. **Importación Masiva:**
   - Usa la funcionalidad de importación para crear usuarios
   - Formato: Excel o CSV con columnas específicas

---

## 🎯 RESUMEN RÁPIDO

```bash
# 1. Iniciar proyecto
docker compose up -d

# 2. Crear tablas
docker compose exec backend php artisan migrate

# 3. Crear datos iniciales
docker compose exec backend php artisan db:seed

# 4. Acceder
# http://localhost:3000
# Login: superadmin / super123
```

---

**¡Listo para usar! 🚀**


