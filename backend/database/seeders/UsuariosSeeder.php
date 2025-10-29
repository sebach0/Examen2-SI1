<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener roles existentes
        $roles = DB::table('rol')->pluck('id', 'nombre')->toArray();

        if (empty($roles)) {
            $this->command->error('❌ No hay roles en la base de datos. Ejecuta AuthSeeder primero.');
            return;
        }

        // Limpiar tabla de relaciones usuario-rol
        DB::table('usuario_rol')->truncate();

        // Crear usuarios de prueba
        $usuarios = [
            [
                'id' => Str::uuid()->toString(),
                'username' => 'admin',
                'email' => 'admin@universidad.edu.bo',
                'password_hash' => Hash::make('admin123'),
                'estado' => 'activo',
                'roles' => ['admin']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'coord_informatica',
                'email' => 'coordinador.informatica@universidad.edu.bo',
                'password_hash' => Hash::make('coord123'),
                'estado' => 'activo',
                'roles' => ['coordinador']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'docente1',
                'email' => 'docente1@universidad.edu.bo',
                'password_hash' => Hash::make('docente123'),
                'estado' => 'activo',
                'roles' => ['docente']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'docente2',
                'email' => 'docente2@universidad.edu.bo',
                'password_hash' => Hash::make('docente123'),
                'estado' => 'activo',
                'roles' => ['docente']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'asistente1',
                'email' => 'asistente1@universidad.edu.bo',
                'password_hash' => Hash::make('asistente123'),
                'estado' => 'activo',
                'roles' => ['auxiliar']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'estudiante1',
                'email' => 'estudiante1@universidad.edu.bo',
                'password_hash' => Hash::make('estudiante123'),
                'estado' => 'activo',
                'roles' => ['estudiante']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'usuario_suspendido',
                'email' => 'suspendido@universidad.edu.bo',
                'password_hash' => Hash::make('usuario123'),
                'estado' => 'suspendido',
                'roles' => ['estudiante']
            ],
            [
                'id' => Str::uuid()->toString(),
                'username' => 'multi_rol',
                'email' => 'multiples@universidad.edu.bo',
                'password_hash' => Hash::make('multi123'),
                'estado' => 'activo',
                'roles' => ['docente', 'coordinador']
            ],
        ];

        $usuariosCreados = 0;
        $rolesAsignados = 0;

        foreach ($usuarios as $usuarioData) {
            // Verificar si el usuario ya existe
            $existe = DB::table('usuario')->where('username', $usuarioData['username'])->exists();

            if (!$existe) {
                $rolesUsuario = $usuarioData['roles'];
                unset($usuarioData['roles']);

                // Insertar usuario
                DB::table('usuario')->insert($usuarioData);
                $usuariosCreados++;

                // Asignar roles
                foreach ($rolesUsuario as $rolNombre) {
                    if (isset($roles[$rolNombre])) {
                        DB::table('usuario_rol')->insert([
                            'id' => Str::uuid()->toString(),
                            'usuario_id' => $usuarioData['id'],
                            'rol_id' => $roles[$rolNombre]
                        ]);
                        $rolesAsignados++;
                    }
                }
            }
        }

        $this->command->info("✅ Se crearon {$usuariosCreados} usuarios de prueba");
        $this->command->info("✅ Se asignaron {$rolesAsignados} roles");
        $this->command->info('');
        $this->command->info('Usuarios creados:');
        $this->command->info('  - admin / admin123 (Admin)');
        $this->command->info('  - coord_informatica / coord123 (Coordinador)');
        $this->command->info('  - docente1 / docente123 (Docente)');
        $this->command->info('  - docente2 / docente123 (Docente)');
        $this->command->info('  - asistente1 / asistente123 (Auxiliar)');
        $this->command->info('  - estudiante1 / estudiante123 (Estudiante)');
        $this->command->info('  - usuario_suspendido / usuario123 (Suspendido)');
        $this->command->info('  - multi_rol / multi123 (Docente + Coordinador)');
    }
}
