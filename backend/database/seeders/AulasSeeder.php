<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Domain\Infraestructura\Models\Edificio;

class AulasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🏢 Creando edificios...\n";
        
        // Crear edificios
        $edificios = [
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'nombre' => 'Edificio A'],
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'nombre' => 'Edificio B'],
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'nombre' => 'Edificio C'],
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'nombre' => 'Torre Norte'],
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'nombre' => 'Centro de Cómputo'],
        ];

        foreach ($edificios as $edificio) {
            DB::table('edificio')->updateOrInsert(
                ['nombre' => $edificio['nombre']],
                $edificio
            );
        }

        echo "✅ Edificios creados\n";

        // Obtener edificios
        $edificioA = Edificio::where('nombre', 'Edificio A')->first();
        $edificioB = Edificio::where('nombre', 'Edificio B')->first();
        $edificioC = Edificio::where('nombre', 'Edificio C')->first();
        $torreNorte = Edificio::where('nombre', 'Torre Norte')->first();
        $centroCómputo = Edificio::where('nombre', 'Centro de Cómputo')->first();

        echo "🚪 Creando aulas...\n";

        $aulas = [];

        // Aulas en Edificio A (aulas tradicionales)
        if ($edificioA) {
            for ($i = 1; $i <= 5; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $edificioA->id,
                    'codigo' => "10{$i}",
                    'nombre' => "Aula 10{$i}",
                    'tipo' => 'aula',
                    'capacidad' => 40,
                ];
            }
            for ($i = 1; $i <= 5; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $edificioA->id,
                    'codigo' => "20{$i}",
                    'nombre' => "Aula 20{$i}",
                    'tipo' => 'aula',
                    'capacidad' => 35,
                ];
            }
        }

        // Aulas en Edificio B (aulas y laboratorios)
        if ($edificioB) {
            for ($i = 1; $i <= 3; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $edificioB->id,
                    'codigo' => "30{$i}",
                    'nombre' => "Aula 30{$i}",
                    'tipo' => 'aula',
                    'capacidad' => 30,
                ];
            }
            // Laboratorios de Física
            for ($i = 1; $i <= 2; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $edificioB->id,
                    'codigo' => "LAB-FIS-{$i}",
                    'nombre' => "Laboratorio de Física {$i}",
                    'tipo' => 'laboratorio',
                    'capacidad' => 25,
                ];
            }
            // Laboratorios de Química
            for ($i = 1; $i <= 2; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $edificioB->id,
                    'codigo' => "LAB-QUI-{$i}",
                    'nombre' => "Laboratorio de Química {$i}",
                    'tipo' => 'laboratorio',
                    'capacidad' => 20,
                ];
            }
        }

        // Aulas en Edificio C (auditorios y aulas grandes)
        if ($edificioC) {
            $aulas[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'edificio_id' => $edificioC->id,
                'codigo' => 'AUD-MAGNA',
                'nombre' => 'Auditorio Magna',
                'tipo' => 'auditorio',
                'capacidad' => 200,
            ];
            $aulas[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'edificio_id' => $edificioC->id,
                'codigo' => 'AUD-A',
                'nombre' => 'Auditorio A',
                'tipo' => 'auditorio',
                'capacidad' => 100,
            ];
            $aulas[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'edificio_id' => $edificioC->id,
                'codigo' => 'AUD-B',
                'nombre' => 'Auditorio B',
                'tipo' => 'auditorio',
                'capacidad' => 80,
            ];
        }

        // Aulas en Torre Norte
        if ($torreNorte) {
            for ($i = 1; $i <= 4; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $torreNorte->id,
                    'codigo' => "40{$i}",
                    'nombre' => "Aula 40{$i}",
                    'tipo' => 'aula',
                    'capacidad' => 45,
                ];
            }
        }

        // Salas de Cómputo
        if ($centroCómputo) {
            for ($i = 1; $i <= 4; $i++) {
                $aulas[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'edificio_id' => $centroCómputo->id,
                    'codigo' => "COMP-{$i}",
                    'nombre' => "Sala de Cómputo {$i}",
                    'tipo' => 'sala de cómputo',
                    'capacidad' => 30,
                ];
            }
        }

        // Insertar aulas
        foreach ($aulas as $aula) {
            DB::table('aula')->insert($aula);
        }

        echo "✅ " . count($aulas) . " aulas creadas exitosamente\n";
        echo "📊 Resumen por edificio:\n";
        
        $edificiosCounts = [
            'Edificio A' => count(array_filter($aulas, fn($a) => $a['edificio_id'] === $edificioA?->id)),
            'Edificio B' => count(array_filter($aulas, fn($a) => $a['edificio_id'] === $edificioB?->id)),
            'Edificio C' => count(array_filter($aulas, fn($a) => $a['edificio_id'] === $edificioC?->id)),
            'Torre Norte' => count(array_filter($aulas, fn($a) => $a['edificio_id'] === $torreNorte?->id)),
            'Centro de Cómputo' => count(array_filter($aulas, fn($a) => $a['edificio_id'] === $centroCómputo?->id)),
        ];

        foreach ($edificiosCounts as $edificio => $count) {
            if ($count > 0) {
                echo "   - {$edificio}: {$count} aulas\n";
            }
        }

        echo "\n📈 Resumen por tipo:\n";
        $tiposCounts = [
            'aula' => count(array_filter($aulas, fn($a) => $a['tipo'] === 'aula')),
            'laboratorio' => count(array_filter($aulas, fn($a) => $a['tipo'] === 'laboratorio')),
            'auditorio' => count(array_filter($aulas, fn($a) => $a['tipo'] === 'auditorio')),
            'sala de cómputo' => count(array_filter($aulas, fn($a) => $a['tipo'] === 'sala de cómputo')),
        ];

        foreach ($tiposCounts as $tipo => $count) {
            if ($count > 0) {
                echo "   - " . ucfirst($tipo) . ": {$count}\n";
            }
        }
    }
}
