<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DocentesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "👨‍🏫 Creando docentes...\n";

        // Obtener rol de docente
        $rolDocente = DB::table('rol')->where('nombre', 'docente')->first();
        
        if (!$rolDocente) {
            $this->command->error('❌ No existe el rol "docente". Ejecuta AuthSeeder primero.');
            return;
        }

        $docentes = [
            [
                'username' => 'doc_ramirez',
                'email' => 'juan.ramirez@universidad.edu.bo',
                'ci' => '12345678',
                'nombre' => 'Juan Carlos Ramírez López',
                'telefono' => '70123456',
            ],
            [
                'username' => 'doc_garcia',
                'email' => 'maria.garcia@universidad.edu.bo',
                'ci' => '87654321',
                'nombre' => 'María Elena García Flores',
                'telefono' => '71234567',
            ],
            [
                'username' => 'doc_mendez',
                'email' => 'carlos.mendez@universidad.edu.bo',
                'ci' => '11223344',
                'nombre' => 'Carlos Alberto Méndez Rojas',
                'telefono' => '72345678',
            ],
            [
                'username' => 'doc_silva',
                'email' => 'ana.silva@universidad.edu.bo',
                'ci' => '44332211',
                'nombre' => 'Ana Lucía Silva Morales',
                'telefono' => '73456789',
            ],
            [
                'username' => 'doc_vargas',
                'email' => 'roberto.vargas@universidad.edu.bo',
                'ci' => '55667788',
                'nombre' => 'Roberto Vargas Castro',
                'telefono' => '74567890',
            ],
            [
                'username' => 'doc_torres',
                'email' => 'patricia.torres@universidad.edu.bo',
                'ci' => '99887766',
                'nombre' => 'Patricia Torres Gutiérrez',
                'telefono' => '75678901',
            ],
            [
                'username' => 'doc_fernandez',
                'email' => 'luis.fernandez@universidad.edu.bo',
                'ci' => '22334455',
                'nombre' => 'Luis Fernando Fernández Quispe',
                'telefono' => '76789012',
            ],
            [
                'username' => 'doc_lopez',
                'email' => 'sofia.lopez@universidad.edu.bo',
                'ci' => '66778899',
                'nombre' => 'Sofía López Mamani',
                'telefono' => '77890123',
            ],
            [
                'username' => 'doc_rojas',
                'email' => 'diego.rojas@universidad.edu.bo',
                'ci' => '33445566',
                'nombre' => 'Diego Rojas Condori',
                'telefono' => '78901234',
            ],
            [
                'username' => 'doc_castro',
                'email' => 'laura.castro@universidad.edu.bo',
                'ci' => '77889900',
                'nombre' => 'Laura Castro Pérez',
                'telefono' => '79012345',
            ],
        ];

        $docentesCreados = 0;

        foreach ($docentes as $docenteData) {
            // Verificar si ya existe
            $existe = DB::table('usuario')->where('username', $docenteData['username'])->exists();
            
            if (!$existe) {
                // Crear usuario
                $usuarioId = Str::uuid()->toString();
                DB::table('usuario')->insert([
                    'id' => $usuarioId,
                    'username' => $docenteData['username'],
                    'email' => $docenteData['email'],
                    'password_hash' => Hash::make('docente123'),
                    'estado' => 'activo',
                ]);

                // Asignar rol de docente
                DB::table('usuario_rol')->insert([
                    'usuario_id' => $usuarioId,
                    'rol_id' => $rolDocente->id,
                ]);

                // Crear registro de docente
                DB::table('docente')->insert([
                    'id' => Str::uuid()->toString(),
                    'usuario_id' => $usuarioId,
                    'ci' => $docenteData['ci'],
                    'nombre' => $docenteData['nombre'],
                    'telefono' => $docenteData['telefono'] ?? null,
                ]);

                $docentesCreados++;
            }
        }

        $this->command->info("✅ Se crearon {$docentesCreados} docentes");
        $this->command->info("   Todos los docentes tienen contraseña: docente123");
    }
}
