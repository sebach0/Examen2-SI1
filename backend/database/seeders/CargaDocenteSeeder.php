<?php

namespace Database\Seeders;

use App\Domain\Academico\Models\Docente;
use App\Domain\Academico\Models\Grupo;
use App\Domain\TiempoHorarios\Models\CargaDocente;
use Illuminate\Database\Seeder;

class CargaDocenteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar cargas existentes
        CargaDocente::truncate();

        // Obtener todos los docentes y grupos
        $docentes = Docente::all();
        $grupos = Grupo::all();

        if ($docentes->isEmpty() || $grupos->isEmpty()) {
            $this->command->warn('⚠️  No hay docentes o grupos para crear cargas');
            return;
        }

        $cargasCreadas = 0;

        // Asignar cada docente a 2-4 grupos aleatorios
        foreach ($docentes as $docente) {
            $gruposAsignados = $grupos->random(min(rand(2, 4), $grupos->count()));

            foreach ($gruposAsignados as $grupo) {
                // Verificar que no exista ya esta combinación
                $existe = CargaDocente::where('docente_id', $docente->id)
                    ->where('grupo_id', $grupo->id)
                    ->exists();

                if (!$existe) {
                    CargaDocente::create([
                        'docente_id' => $docente->id,
                        'grupo_id' => $grupo->id,
                        'horas_asignadas' => rand(2, 6), // Entre 2 y 6 horas
                    ]);
                    $cargasCreadas++;
                }
            }
        }

        $this->command->info("✅ {$cargasCreadas} cargas docentes creadas exitosamente");
    }
}
