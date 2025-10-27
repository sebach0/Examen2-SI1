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
        // Crear permisos básicos
        $permisoVer = Permiso::create([
            'id' => (string) Str::uuid(),
            'codigo' => 'dashboard.ver',
            'descripcion' => 'Permite ver el dashboard',
        ]);

        // Crear rol de Superadmin
        $rolSuperadmin = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'superadmin',
            'descripcion' => 'Administrador del sistema con acceso total',
        ]);

        // Para tablas pivot con UUID, debemos generar el ID manualmente
        DB::table('rol_permiso')->insert([
            'id' => (string) Str::uuid(),
            'rol_id' => $rolSuperadmin->id,
            'permiso_id' => $permisoVer->id,
        ]);

        // Crear rol de Docente
        $rolDocente = Rol::create([
            'id' => (string) Str::uuid(),
            'nombre' => 'docente',
            'descripcion' => 'Docente del sistema',
        ]);

        DB::table('rol_permiso')->insert([
            'id' => (string) Str::uuid(),
            'rol_id' => $rolDocente->id,
            'permiso_id' => $permisoVer->id,
        ]);

        // Crear usuario superadmin
        $superadmin = Usuario::create([
            'id' => (string) Str::uuid(),
            'username' => 'admin',
            'email' => 'admin@sistema.com',
            'password_hash' => Hash::make('admin123'), // CAMBIAR EN PRODUCCIÓN
            'estado' => 'activo',
        ]);

        DB::table('usuario_rol')->insert([
            'id' => (string) Str::uuid(),
            'usuario_id' => $superadmin->id,
            'rol_id' => $rolSuperadmin->id,
        ]);

        // Crear usuario docente de prueba
        $docente = Usuario::create([
            'id' => (string) Str::uuid(),
            'username' => 'docente1',
            'email' => 'docente1@sistema.com',
            'password_hash' => Hash::make('docente123'), // CAMBIAR EN PRODUCCIÓN
            'estado' => 'activo',
        ]);

        DB::table('usuario_rol')->insert([
            'id' => (string) Str::uuid(),
            'usuario_id' => $docente->id,
            'rol_id' => $rolDocente->id,
        ]);

        $this->command->info('✅ Usuarios de prueba creados:');
        $this->command->info('   Superadmin: admin / admin123');
        $this->command->info('   Docente: docente1 / docente123');
    }
}
