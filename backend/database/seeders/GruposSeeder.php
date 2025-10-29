<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Domain\Academico\Models\Materia;
use App\Domain\Academico\Models\Gestion;

class GruposSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🏫 Creando gestiones...\n";
        
        // Crear gestiones
        $gestiones = [
            [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'codigo' => '2024-1',
                'anio' => 2024,
                'periodo' => 'Primer Semestre',
                'fecha_inicio' => '2024-02-01',
                'fecha_fin' => '2024-06-30',
            ],
            [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'codigo' => '2024-2',
                'anio' => 2024,
                'periodo' => 'Segundo Semestre',
                'fecha_inicio' => '2024-08-01',
                'fecha_fin' => '2024-12-15',
            ],
        ];

        foreach ($gestiones as $gestion) {
            DB::table('gestion')->updateOrInsert(
                ['codigo' => $gestion['codigo']],
                $gestion
            );
        }

        echo "✅ Gestiones creadas\n";

        // Obtener gestiones
        $gestion2024_1 = Gestion::where('codigo', '2024-1')->first();
        $gestion2024_2 = Gestion::where('codigo', '2024-2')->first();

        echo "👥 Creando grupos...\n";

        // Obtener algunas materias
        $calculoI = Materia::where('codigo', 'MAT-101')->first();
        $calculoII = Materia::where('codigo', 'MAT-102')->first();
        $fisica = Materia::where('codigo', 'FIS-101')->first();
        $introProg = Materia::where('codigo', 'INF-101')->first();
        $estructuras = Materia::where('codigo', 'INF-102')->first();
        $baseDatos = Materia::where('codigo', 'INF-201')->first();

        $grupos = [];

        // Grupos para Cálculo I (2024-1)
        if ($calculoI && $gestion2024_1) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $calculoI->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'A',
                'capacidad' => 40,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $calculoI->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'B',
                'capacidad' => 40,
            ];
        }

        // Grupos para Cálculo II (2024-2)
        if ($calculoII && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $calculoII->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 35,
            ];
        }

        // Grupos para Física (2024-1)
        if ($fisica && $gestion2024_1) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $fisica->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'A',
                'capacidad' => 35,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $fisica->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'LAB-1',
                'capacidad' => 20,
            ];
        }

        // Grupos para Introducción a la Programación (2024-1)
        if ($introProg && $gestion2024_1) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $introProg->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'A',
                'capacidad' => 30,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $introProg->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'B',
                'capacidad' => 30,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $introProg->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'LAB-1',
                'capacidad' => 25,
            ];
        }

        // Grupos para Estructuras de Datos (2024-2)
        if ($estructuras && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $estructuras->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 30,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $estructuras->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'LAB-1',
                'capacidad' => 20,
            ];
        }

        // Grupos para Base de Datos (2024-2)
        if ($baseDatos && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $baseDatos->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 35,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $baseDatos->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'B',
                'capacidad' => 35,
            ];
        }

        // Insertar grupos
        foreach ($grupos as $grupo) {
            DB::table('grupo')->insert($grupo);
        }

        echo "✅ " . count($grupos) . " grupos creados exitosamente\n";
        echo "📊 Resumen:\n";
        echo "   - Gestión 2024-1: " . count(array_filter($grupos, fn($g) => $g['gestion_id'] === $gestion2024_1?->id)) . " grupos\n";
        echo "   - Gestión 2024-2: " . count(array_filter($grupos, fn($g) => $g['gestion_id'] === $gestion2024_2?->id)) . " grupos\n";
    }
}
