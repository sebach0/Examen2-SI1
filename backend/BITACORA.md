# Sistema de Bitácora (Audit Log)

## 📋 Descripción

Sistema profesional de registro de actividades (bitácora/audit log) para auditoría y seguridad. Registra automáticamente todas las acciones importantes del sistema siguiendo arquitectura Domain-Driven Design.

## 🏗️ Arquitectura

### Ubicación de Archivos (Modular)

```
backend/
├── app/Domain/Shared/
│   ├── Models/
│   │   └── Bitacora.php          # Modelo principal
│   └── Traits/
│       └── LogsActivity.php      # Trait reutilizable
├── app/Http/
│   ├── Controllers/Api/
│   │   └── BitacoraController.php
│   └── Middleware/
│       └── LogActivityMiddleware.php
└── database/migrations/
    ├── 2025_10_29_170956_create_bitacora_table.php
    └── 2025_10_29_172101_add_bitacora_foreign_key.php
```

## 📊 Estructura de la Tabla

| Campo          | Tipo      | Descripción                      |
| -------------- | --------- | -------------------------------- |
| id             | UUID      | Identificador único              |
| usuario_id     | UUID      | ID del usuario (nullable)        |
| accion         | String    | LOGIN, LOGOUT, CREAR, etc.       |
| descripcion    | Text      | Descripción legible de la acción |
| ip             | IP        | Dirección IP del cliente         |
| user_agent     | Text      | Navegador/cliente                |
| metodo_http    | String    | GET, POST, PUT, DELETE           |
| ruta           | String    | /api/auth/login                  |
| datos_request  | JSON      | Datos enviados (sin passwords)   |
| datos_response | JSON      | Respuesta del servidor           |
| codigo_http    | Integer   | 200, 404, 500, etc.              |
| created_at     | Timestamp | Fecha y hora del evento          |

## 🚀 Uso

### 1. Registro Automático (Middleware)

El middleware `LogActivityMiddleware` registra automáticamente:

-   ✅ Todas las peticiones POST, PUT, DELETE, PATCH
-   ✅ Solo usuarios autenticados
-   ✅ Excluye rutas frecuentes como `/api/auth/me`

**Configuración:** Ya está habilitado globalmente en `bootstrap/app.php`

### 2. Registro Manual en Controladores

Usa el trait `LogsActivity` en cualquier controlador:

```php
use App\Domain\Shared\Traits\LogsActivity;

class MiControlador extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        // Tu lógica aquí
        $materia = Materia::create($request->all());

        // Registrar en bitácora
        $this->logCrear('materia', $materia);

        return response()->json($materia, 201);
    }
}
```

### 3. Métodos Disponibles del Trait

```php
// Login/Logout
$this->logLogin('username');
$this->logLogout();
$this->logLoginFallido('username', 'Credenciales inválidas');

// CRUD
$this->logCrear('materia', $modelo);
$this->logActualizar('materia', $id);
$this->logEliminar('materia', $id);
$this->logConsultar('materias', 10);

// Otros
$this->logExportar('estudiantes', 'csv');
$this->logImportar('materias', 50);

// Genérico
$this->logActivity('ACCION_CUSTOM', 'Descripción', ['dato' => 'valor']);
```

### 4. Registro Directo con el Modelo

```php
use App\Domain\Shared\Models\Bitacora;

// Método estático
Bitacora::registrar('ACCION_PERSONALIZADA', 'Descripción de la acción', [
    'datos_response' => ['resultado' => 'exitoso'],
    'codigo_http' => 200
]);

// Constantes predefinidas
Bitacora::ACCION_LOGIN
Bitacora::ACCION_LOGOUT
Bitacora::ACCION_LOGIN_FALLIDO
Bitacora::ACCION_CREAR
Bitacora::ACCION_ACTUALIZAR
Bitacora::ACCION_ELIMINAR
Bitacora::ACCION_CONSULTAR
Bitacora::ACCION_EXPORTAR
Bitacora::ACCION_IMPORTAR
```

## 📡 API Endpoints

### Listar Bitácora

```http
GET /api/bitacora?usuario_id={uuid}&accion=LOGIN&desde=2025-01-01&hasta=2025-12-31&per_page=50

Authorization: Bearer {token}
```

**Respuesta:**

```json
{
    "data": [
        {
            "id": "uuid",
            "usuario_id": "uuid",
            "accion": "LOGIN",
            "descripcion": "Usuario 'admin' inició sesión correctamente",
            "ip": "192.168.1.100",
            "user_agent": "Mozilla/5.0...",
            "metodo_http": "POST",
            "ruta": "api/auth/login",
            "codigo_http": 200,
            "created_at": "2025-10-29T17:30:00Z",
            "usuario": {
                "id": "uuid",
                "username": "admin",
                "nombre": "Administrador"
            }
        }
    ],
    "current_page": 1,
    "total": 150
}
```

### Estadísticas

```http
GET /api/bitacora/estadisticas?dias=30

Authorization: Bearer {token}
```

**Respuesta:**

```json
{
    "total_eventos": 1250,
    "logins_exitosos": 45,
    "logins_fallidos": 5,
    "usuarios_activos": 12,
    "acciones_por_tipo": [
        { "accion": "CONSULTAR", "total": 650 },
        { "accion": "CREAR", "total": 120 }
    ],
    "actividad_por_dia": [{ "fecha": "2025-10-29", "total": 50 }]
}
```

### Actividad de Usuario

```http
GET /api/bitacora/usuario/{usuarioId}

Authorization: Bearer {token}
```

## 🔍 Consultas con Scopes

```php
// Filtrar por usuario
Bitacora::deUsuario($usuarioId)->get();

// Filtrar por acción
Bitacora::porAccion(Bitacora::ACCION_LOGIN)->get();

// Actividad reciente (últimos 7 días por defecto)
Bitacora::reciente(30)->get();

// Rango de fechas
Bitacora::entreFechas('2025-01-01', '2025-01-31')->get();

// Combinado
Bitacora::deUsuario($id)
    ->porAccion(Bitacora::ACCION_LOGIN)
    ->reciente(7)
    ->orderBy('created_at', 'desc')
    ->get();
```

## 🔒 Seguridad

### Datos Sensibles

Los siguientes campos se sanitizan automáticamente antes de guardar:

-   `password`
-   `password_confirmation`
-   `token`
-   `api_key`
-   `secret`

Estos se reemplazan con: `***OCULTO***`

### Permisos

Solo usuarios autenticados pueden:

-   ✅ Ver su propia actividad
-   ✅ Ver estadísticas generales

Los superadmins pueden:

-   ✅ Ver actividad de todos los usuarios
-   ✅ Exportar reportes completos

## 📈 Mejores Prácticas

### 1. Registro en Acciones Críticas

Siempre registra:

-   ✅ Login/Logout
-   ✅ Cambios en configuración
-   ✅ Eliminación de datos
-   ✅ Exportación de información sensible
-   ✅ Cambios en permisos/roles

### 2. Descripciones Claras

```php
// ❌ Malo
$this->logActivity('UPDATE', 'Actualización');

// ✅ Bueno
$this->logActivity('ACTUALIZAR', 'Actualizó materia "Cálculo I" cambiando créditos de 4 a 5');
```

### 3. Mantenimiento

Considera limpiar registros antiguos periódicamente:

```php
// Eliminar registros de más de 2 años
Bitacora::where('created_at', '<', now()->subYears(2))->delete();
```

## 🧪 Testing

Para probar el sistema:

1. **Login exitoso:**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

2. **Ver bitácora:**

```bash
curl http://localhost:8000/api/bitacora \
  -H "Authorization: Bearer {tu-token}"
```

3. **Ver estadísticas:**

```bash
curl http://localhost:8000/api/bitacora/estadisticas \
  -H "Authorization: Bearer {tu-token}"
```

## 📝 Ejemplo Completo

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Shared\Traits\LogsActivity;
use App\Domain\Academico\Models\Materia;

class MateriaController extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        $materia = Materia::create($request->validated());

        $this->logCrear('materia', $materia);

        return response()->json($materia, 201);
    }

    public function destroy($id)
    {
        $materia = Materia::findOrFail($id);
        $nombreMateria = $materia->nombre;

        $materia->delete();

        $this->logActivity(
            'ELIMINAR_MATERIA',
            "Eliminó la materia '{$nombreMateria}' permanentemente",
            ['materia_id' => $id, 'nombre' => $nombreMateria]
        );

        return response()->json(['message' => 'Materia eliminada'], 200);
    }
}
```

## ✅ Checklist de Implementación

-   [x] Modelo Bitacora creado
-   [x] Trait LogsActivity creado
-   [x] Middleware configurado
-   [x] Rutas API definidas
-   [x] AuthController actualizado
-   [x] Migraciones ejecutadas
-   [x] Documentación completa

## 🎯 Próximos Pasos Recomendados

1. **Frontend:** Crear interfaz para visualizar bitácora
2. **Reportes:** Agregar exportación a PDF/Excel
3. **Alertas:** Notificar intentos de acceso sospechosos
4. **Dashboard:** Gráficas de actividad en tiempo real
5. **Limpieza automática:** Job programado para eliminar registros antiguos

---

**Autor:** Sistema de Control de Asistencias  
**Fecha:** Octubre 2025  
**Versión:** 1.0.0
