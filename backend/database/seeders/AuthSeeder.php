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
        $permisoDashboardVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'dashboard.ver',
            'descripcion' => 'Permite ver el dashboard',
        ]);

        // Permisos de Usuarios
        $permisoUsuariosVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'usuarios.ver',
            'descripcion' => 'Ver listado de usuarios',
        ]);
        $permisoUsuariosCrear = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'usuarios.crear',
            'descripcion' => 'Crear nuevos usuarios',
        ]);
        $permisoUsuariosEditar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'usuarios.editar',
            'descripcion' => 'Editar usuarios existentes',
        ]);
        $permisoUsuariosEliminar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'usuarios.eliminar',
            'descripcion' => 'Eliminar usuarios',
        ]);

        // Permisos de Roles
        $permisoRolesVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'roles.ver',
            'descripcion' => 'Ver listado de roles',
        ]);
        $permisoRolesCrear = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'roles.crear',
            'descripcion' => 'Crear nuevos roles',
        ]);
        $permisoRolesEditar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'roles.editar',
            'descripcion' => 'Editar roles existentes',
        ]);

        // Permisos de Permisos
        $permisoPermisosVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'permisos.ver',
            'descripcion' => 'Ver listado de permisos',
        ]);

        // Permisos de Académico
        $permisoMateriasVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'academico.materias.ver',
            'descripcion' => 'Ver materias',
        ]);
        $permisoMateriasGestionar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'academico.materias.gestionar',
            'descripcion' => 'Crear, editar y eliminar materias',
        ]);
        $permisoGruposVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'academico.grupos.ver',
            'descripcion' => 'Ver grupos',
        ]);
        $permisoGruposGestionar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'academico.grupos.gestionar',
            'descripcion' => 'Crear, editar y eliminar grupos',
        ]);

        // Permisos de Infraestructura
        $permisoAulasVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'infraestructura.aulas.ver',
            'descripcion' => 'Ver aulas',
        ]);
        $permisoAulasGestionar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'infraestructura.aulas.gestionar',
            'descripcion' => 'Gestionar aulas',
        ]);

        // Permisos de Horarios
        $permisoHorariosVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'horarios.ver',
            'descripcion' => 'Ver horarios',
        ]);
        $permisoHorariosGestionar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'horarios.gestionar',
            'descripcion' => 'Gestionar horarios',
        ]);

        // Permisos de Asistencia
        $permisoAsistenciaVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'asistencia.ver',
            'descripcion' => 'Ver registros de asistencia',
        ]);
        $permisoAsistenciaMarcar = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'asistencia.marcar',
            'descripcion' => 'Marcar asistencia',
        ]);

        // Permisos de Bitácora
        $permisoBitacoraVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'sistema.bitacora.ver',
            'descripcion' => 'Ver bitácora del sistema',
        ]);

        echo "✅ Permisos creados\n";

        // ========== CREAR ROLES ==========
        
        // Rol Superadmin
        $rolSuperadmin = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'superadmin',
            'descripcion' => 'Administrador del sistema con acceso total',
        ]);

        // Asignar TODOS los permisos al superadmin
        $todosPermisos = Permiso::all()->pluck('id')->toArray();
        foreach ($todosPermisos as $permisoId) {
            DB::table('rol_permiso')->insert([
                'rol_id' => $rolSuperadmin->id,
                'permiso_id' => $permisoId,
            ]);
        }

        // Rol Admin
        $rolAdmin = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'admin',
            'descripcion' => 'Administrador general del sistema',
        ]);

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

        foreach ($permisosAdmin as $permisoId) {
            DB::table('rol_permiso')->insert([
                'rol_id' => $rolAdmin->id,
                'permiso_id' => $permisoId,
            ]);
        }

        // Rol Coordinador
        $rolCoordinador = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'coordinador',
            'descripcion' => 'Coordinador académico',
        ]);

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

        foreach ($permisosCoordinador as $permisoId) {
            DB::table('rol_permiso')->insert([
                'rol_id' => $rolCoordinador->id,
                'permiso_id' => $permisoId,
            ]);
        }

        // Rol Docente
        $rolDocente = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'docente',
            'descripcion' => 'Docente del sistema',
        ]);

        $permisosDocente = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoGruposVer->id,
            $permisoHorariosVer->id,
            $permisoAsistenciaVer->id,
            $permisoAsistenciaMarcar->id,
        ];

        foreach ($permisosDocente as $permisoId) {
            DB::table('rol_permiso')->insert([
                'rol_id' => $rolDocente->id,
                'permiso_id' => $permisoId,
            ]);
        }

        // Rol Auxiliar
        $rolAuxiliar = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'auxiliar',
            'descripcion' => 'Auxiliar de docente',
        ]);

        $permisosAuxiliar = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoGruposVer->id,
            $permisoAsistenciaVer->id,
            $permisoAsistenciaMarcar->id,
        ];

        foreach ($permisosAuxiliar as $permisoId) {
            DB::table('rol_permiso')->insert([
                'rol_id' => $rolAuxiliar->id,
                'permiso_id' => $permisoId,
            ]);
        }

        // Rol Estudiante
        $rolEstudiante = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'estudiante',
            'descripcion' => 'Estudiante del sistema',
        ]);

        $permisosEstudiante = [
            $permisoDashboardVer->id,
            $permisoMateriasVer->id,
            $permisoHorariosVer->id,
        ];

        foreach ($permisosEstudiante as $permisoId) {
            DB::table('rol_permiso')->insert([
                'rol_id' => $rolEstudiante->id,
                'permiso_id' => $permisoId,
            ]);
        }

        echo "✅ Roles creados con sus permisos\n";

        // ========== CREAR USUARIOS ==========
        
        // Usuario superadmin
        $superadmin = Usuario::create([
            'id' => (string) Str::uuid(),
            'username' => 'superadmin',
            'email' => 'superadmin@sistema.com',
            'password_hash' => Hash::make('super123'), // CAMBIAR EN PRODUCCIÓN
            'estado' => 'activo',
        ]);

        DB::table('usuario_rol')->insert([
            'usuario_id' => $superadmin->id,
            'rol_id' => $rolSuperadmin->id,
        ]);

        // Usuario admin
        $admin = Usuario::create([
            'id' => (string) Str::uuid(),
            'username' => 'admin',
            'email' => 'admin@sistema.com',
            'password_hash' => Hash::make('admin123'), // CAMBIAR EN PRODUCCIÓN
            'estado' => 'activo',
        ]);

        DB::table('usuario_rol')->insert([
            'usuario_id' => $admin->id,
            'rol_id' => $rolAdmin->id,
        ]);

        // Usuario docente de prueba
        $docente = Usuario::create([
            'id' => (string) Str::uuid(),
            'username' => 'docente',
            'email' => 'docente@sistema.com',
            'password_hash' => Hash::make('docente123'), // CAMBIAR EN PRODUCCIÓN
            'estado' => 'activo',
        ]);

        DB::table('usuario_rol')->insert([
            'usuario_id' => $docente->id,
            'rol_id' => $rolDocente->id,
        ]);

        echo "✅ Usuarios creados\n\n";
        $this->command->info('🎉 Sistema de autenticación inicializado:');
        $this->command->info('   Superadmin: superadmin / super123 (' . count($todosPermisos) . ' permisos)');
        $this->command->info('   Admin: admin / admin123 (' . count($permisosAdmin) . ' permisos)');
        $this->command->info('   Docente: docente / docente123 (' . count($permisosDocente) . ' permisos)');
        $this->command->info('');
        $this->command->info('   Total: ' . Permiso::count() . ' permisos | ' . Rol::count() . ' roles | 3 usuarios base');
    }
}
