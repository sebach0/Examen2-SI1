<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BloquesHorariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar tabla antes de insertar
        DB::table('bloque_horario')->truncate();

        $bloques = [];

        // Bloques comunes para días de semana (Lunes a Viernes)
        $horarios = [
            ['06:45', '08:15'],  // Bloque 1
            ['08:15', '09:45'],  // Bloque 2
            ['09:45', '11:15'],  // Bloque 3
            ['11:15', '12:45'],  // Bloque 4
            ['12:45', '14:15'],  // Bloque 5
            ['14:15', '15:45'],  // Bloque 6
            ['15:45', '17:15'],  // Bloque 7
            ['17:15', '18:45'],  // Bloque 8
            ['18:45', '20:15'],  // Bloque 9
            ['20:15', '21:45'],  // Bloque 10
        ];

        // Crear bloques para días de semana (1=Lunes a 5=Viernes)
        for ($dia = 1; $dia <= 5; $dia++) {
            foreach ($horarios as $horario) {
                $bloques[] = [
                    'id' => Str::uuid()->toString(),
                    'dia_semana' => $dia,
                    'hora_inicio' => $horario[0],
                    'hora_fin' => $horario[1],
                ];
            }
        }

        // Bloques especiales para Sábado (horarios reducidos)
        $horariosSabado = [
            ['08:00', '09:30'],
            ['09:30', '11:00'],
            ['11:00', '12:30'],
            ['12:30', '14:00'],
            ['14:00', '15:30'],
        ];

        foreach ($horariosSabado as $horario) {
            $bloques[] = [
                'id' => Str::uuid()->toString(),
                'dia_semana' => 6, // Sábado
                'hora_inicio' => $horario[0],
                'hora_fin' => $horario[1],
            ];
        }

        // Insertar todos los bloques
        DB::table('bloque_horario')->insert($bloques);

        $this->command->info('✅ Se crearon ' . count($bloques) . ' bloques horarios');
        $this->command->info('   - Lunes a Viernes: ' . (5 * count($horarios)) . ' bloques');
        $this->command->info('   - Sábado: ' . count($horariosSabado) . ' bloques');
    }
}
