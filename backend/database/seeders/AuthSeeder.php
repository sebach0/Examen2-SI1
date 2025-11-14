<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Domain\Auth\Models\Usuario;
use App\Domain\Auth\Models\Rol;
use App\Domain\Auth\Models\Permiso;

class AuthSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🔐 Creando sistema de permisos y roles...\n";

        // ========== CREAR PERMISOS ==========
        
        // Permisos de Dashboard
        $permisoDashboardVer = $this->crearPermiso('dashboard.ver', 'Permite ver el dashboard');

        // Permisos de Usuarios
        $permisoUsuariosVer = $this->crearPermiso('usuarios.ver', 'Ver listado de usuarios');
        $permisoUsuariosCrear = $this->crearPermiso('usuarios.crear', 'Crear nuevos usuarios');
        $permisoUsuariosEditar = $this->crearPermiso('usuarios.editar', 'Editar usuarios existentes');
        $permisoUsuariosEliminar = $this->crearPermiso('usuarios.eliminar', 'Eliminar usuarios');

        // Permisos de Roles
        $permisoRolesVer = $this->crearPermiso('roles.ver', 'Ver listado de roles');
        $permisoRolesCrear = $this->crearPermiso('roles.crear', 'Crear nuevos roles');
        $permisoRolesEditar = $this->crearPermiso('roles.editar', 'Editar roles existentes');

        // Permisos de Permisos
        $permisoPermisosVer = $this->crearPermiso('permisos.ver', 'Ver listado de permisos');

        // Permisos de Académico
        $permisoMateriasVer = $this->crearPermiso('academico.materias.ver', 'Ver materias');
        $permisoMateriasGestionar = $this->crearPermiso('academico.materias.gestionar', 'Crear, editar y eliminar materias');
        $permisoGruposVer = $this->crearPermiso('academico.grupos.ver', 'Ver grupos');
        $permisoGruposGestionar = $this->crearPermiso('academico.grupos.gestionar', 'Crear, editar y eliminar grupos');

        // Permisos de Infraestructura
        $permisoAulasVer = $this->crearPermiso('infraestructura.aulas.ver', 'Ver aulas');
        $permisoAulasGestionar = $this->crearPermiso('infraestructura.aulas.gestionar', 'Gestionar aulas');

        // Permisos de Horarios
        $permisoHorariosVer = $this->crearPermiso('horarios.ver', 'Ver horarios');
        $permisoHorariosGestionar = $this->crearPermiso('horarios.gestionar', 'Gestionar horarios');

        // Permisos de Asistencia
        $permisoAsistenciaVer = $this->crearPermiso('asistencia.ver', 'Ver registros de asistencia');
        $permisoAsistenciaMarcar = $this->crearPermiso('asistencia.marcar', 'Marcar asistencia');

        // Permisos de Bitácora
        $permisoBitacoraVer = $this->crearPermiso('sistema.bitacora.ver', 'Ver bitácora del sistema');

        echo "✅ Permisos creados\n";

        // ========== CREAR ROLES ==========
        
        // Rol Superadmin
        $rolSuperadmin = $this->crearRol('superadmin', 'Administrador del sistema con acceso total');

        // Asignar TODOS los permisos al superadmin
        $todosPermisos = Permiso::all()->pluck('id')->toArray();
        $this->asignarPermisosARol($rolSuperadmin->id, $todosPermisos);

        // Rol Admin
        $rolAdmin = $this->crearRol('admin', 'Administrador general del sistema');

        // Admin tiene acceso a todo excepto gestión de roles/permisos
        $permisosAdmin = [
            $permisoDashboardVer->id,
            $permisoUsuariosVer->id,
            $permisoUsuariosCrear->id,
            $permisoUsuariosEditar->id,
            $permisoMateriasVer->id,
            $permisoMateriasGestionar->id,
            $permisoGruposVer->id,
            $permisoGruposGestionar->id,
            $permisoAulasVer->id,
            $permisoAulasGestionar->id,
            $permisoHorariosVer->id,
            $permisoHorariosGestionar->id,
            $permisoAsistenciaVer->id,
            $permisoBitacoraVer->id,
        ];

        $this->asignarPermisosARol($rolAdmin->id, $permisosAdmin);

        // Rol Coordinador
        $rolCoordinador = $this->crearRol('coordinador', 'Coordinador académico');

        $permisosCoordinador = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoMateriasGestionar->id,
            $permisoGruposVer->id,
            $permisoGruposGestionar->id,
            $permisoAulasVer->id,
            $permisoHorariosVer->id,
            $permisoHorariosGestionar->id,
            $permisoAsistenciaVer->id,
        ];

        $this->asignarPermisosARol($rolCoordinador->id, $permisosCoordinador);

        // Rol Docente
        $rolDocente = $this->crearRol('docente', 'Docente del sistema');

        $permisosDocente = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoGruposVer->id,
            $permisoHorariosVer->id,
            $permisoAsistenciaVer->id,
            $permisoAsistenciaMarcar->id,
        ];

        $this->asignarPermisosARol($rolDocente->id, $permisosDocente);

        // Rol Auxiliar
        $rolAuxiliar = $this->crearRol('auxiliar', 'Auxiliar de docente');

        $permisosAuxiliar = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoGruposVer->id,
            $permisoAsistenciaVer->id,
            $permisoAsistenciaMarcar->id,
        ];

        $this->asignarPermisosARol($rolAuxiliar->id, $permisosAuxiliar);

        // Rol Estudiante
        $rolEstudiante = $this->crearRol('estudiante', 'Estudiante del sistema');

        $permisosEstudiante = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoHorariosVer->id,
        ];

        $this->asignarPermisosARol($rolEstudiante->id, $permisosEstudiante);

        echo "✅ Roles creados con sus permisos\n";

        // ========== CREAR USUARIOS ==========
        
        // Usuario superadmin
        $superadmin = $this->crearUsuario('superadmin', 'superadmin@sistema.com', 'super123');
        $this->asignarRolAUsuario($superadmin->id, $rolSuperadmin->id);

        // Usuario admin
        $admin = $this->crearUsuario('admin', 'admin@sistema.com', 'admin123');
        $this->asignarRolAUsuario($admin->id, $rolAdmin->id);

        echo "✅ Usuarios creados\n\n";
        $this->command->info('🎉 Sistema de autenticación inicializado:');
        $this->command->info('   Superadmin: superadmin / super123 (' . count($todosPermisos) . ' permisos)');
        $this->command->info('   Admin: admin / admin123 (' . count($permisosAdmin) . ' permisos)');
        $this->command->info('');
        $this->command->info('   Total: ' . Permiso::count() . ' permisos | ' . Rol::count() . ' roles | 2 usuarios base');
    }

    /**
     * Crear permiso si no existe
     */
    private function crearPermiso(string $codigo, string $descripcion): Permiso
    {
        $permiso = Permiso::where('codigo', $codigo)->first();
        
        if (!$permiso) {
            $permiso = Permiso::create([
                'id' => (string) Str::uuid(),
                'codigo' => $codigo,
                'descripcion' => $descripcion,
            ]);
        }
        
        return $permiso;
    }

    /**
     * Crear rol si no existe
     */
    private function crearRol(string $nombre, string $descripcion): Rol
    {
        $rol = Rol::where('nombre', $nombre)->first();
        
        if (!$rol) {
            $rol = Rol::create([
                'id' => (string) Str::uuid(),
                'nombre' => $nombre,
                'descripcion' => $descripcion,
            ]);
        }
        
        return $rol;
    }

    /**
     * Asignar permisos a un rol (evita duplicados)
     */
    private function asignarPermisosARol(string $rolId, array $permisoIds): void
    {
        foreach ($permisoIds as $permisoId) {
            $existe = DB::table('rol_permiso')
                ->where('rol_id', $rolId)
                ->where('permiso_id', $permisoId)
                ->exists();
            
            if (!$existe) {
                DB::table('rol_permiso')->insert([
                    'rol_id' => $rolId,
                    'permiso_id' => $permisoId,
                ]);
            }
        }
    }

    /**
     * Crear usuario si no existe
     */
    private function crearUsuario(string $username, string $email, string $password): Usuario
    {
        $usuario = Usuario::where('username', $username)
            ->orWhere('email', $email)
            ->first();
        
        if (!$usuario) {
            $usuario = Usuario::create([
                'id' => (string) Str::uuid(),
                'username' => $username,
                'email' => $email,
                'password_hash' => Hash::make($password),
                'estado' => 'activo',
            ]);
        }
        
        return $usuario;
    }

    /**
     * Asignar rol a usuario (evita duplicados)
     */
    private function asignarRolAUsuario(string $usuarioId, string $rolId): void
    {
        $existe = DB::table('usuario_rol')
            ->where('usuario_id', $usuarioId)
            ->where('rol_id', $rolId)
            ->exists();
        
        if (!$existe) {
            DB::table('usuario_rol')->insert([
                'usuario_id' => $usuarioId,
                'rol_id' => $rolId,
            ]);
        }
    }
}
