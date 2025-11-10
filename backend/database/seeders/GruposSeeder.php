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
        $algebraLineal = Materia::where('codigo', 'MAT-111')->first();
        $introProg = Materia::where('codigo', 'SIS-101')->first();
        $progAvanzada = Materia::where('codigo', 'SIS-102')->first();
        $estructuras = Materia::where('codigo', 'SIS-201')->first();
        $baseDatos = Materia::where('codigo', 'SIS-301')->first();
        $ingsoft = Materia::where('codigo', 'SIS-401')->first();
        $webI = Materia::where('codigo', 'SIS-502')->first();
        $ia = Materia::where('codigo', 'SIS-503')->first();

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
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $calculoII->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'B',
                'capacidad' => 35,
            ];
        }

        // Grupos para Álgebra Lineal (2024-1)
        if ($algebraLineal && $gestion2024_1) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $algebraLineal->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'A',
                'capacidad' => 40,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $algebraLineal->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'B',
                'capacidad' => 40,
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
                'codigo' => 'C',
                'capacidad' => 30,
            ];
        }

        // Grupos para Programación Avanzada (2024-2)
        if ($progAvanzada && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $progAvanzada->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 30,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $progAvanzada->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'B',
                'capacidad' => 30,
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
                'codigo' => 'B',
                'capacidad' => 30,
            ];
        }

        // Grupos para Base de Datos I (2024-1 y 2024-2)
        if ($baseDatos && $gestion2024_1) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $baseDatos->id,
                'gestion_id' => $gestion2024_1->id,
                'codigo' => 'A',
                'capacidad' => 25,
            ];
        }
        if ($baseDatos && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $baseDatos->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 25,
            ];
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $baseDatos->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'B',
                'capacidad' => 25,
            ];
        }

        // Grupos para Ingeniería de Software I (2024-2)
        if ($ingsoft && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $ingsoft->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 25,
            ];
        }

        // Grupos para Desarrollo Web I (2024-2)
        if ($webI && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $webI->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 25,
            ];
        }

        // Grupos para Inteligencia Artificial (2024-2)
        if ($ia && $gestion2024_2) {
            $grupos[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'materia_id' => $ia->id,
                'gestion_id' => $gestion2024_2->id,
                'codigo' => 'A',
                'capacidad' => 20,
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
