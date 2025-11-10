<?php

namespace Database\Seeders;

use App\Domain\Academico\Models\Grupo;
use App\Domain\Infraestructura\Models\Aula;
use App\Domain\TiempoHorarios\Models\BloqueHorario;
use App\Domain\TiempoHorarios\Models\HorarioGrupo;
use Illuminate\Database\Seeder;

class HorarioGrupoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar horarios existentes
        HorarioGrupo::truncate();

        // Obtener recursos necesarios
        $grupos = Grupo::all();
        $aulas = Aula::all();
        $bloques = BloqueHorario::all();

        if ($grupos->isEmpty() || $aulas->isEmpty() || $bloques->isEmpty()) {
            $this->command->warn('⚠️  Faltan datos: grupos, aulas o bloques horarios');
            return;
        }

        $horariosCreados = 0;
        $tipos = ['teórico', 'práctico', 'laboratorio'];

        // Asignar 2-4 bloques horarios a cada grupo
        foreach ($grupos as $grupo) {
            $bloquesAsignados = $bloques->random(min(rand(2, 4), $bloques->count()));
            
            foreach ($bloquesAsignados as $bloque) {
                // Verificar que no exista ya este horario
                $existe = HorarioGrupo::where('grupo_id', $grupo->id)
                    ->where('bloque_id', $bloque->id)
                    ->exists();

                if (!$existe) {
                    // Asignar aula aleatoria
                    $aula = $aulas->random();

                    HorarioGrupo::create([
                        'grupo_id' => $grupo->id,
                        'bloque_id' => $bloque->id,
                        'aula_id' => $aula->id,
                        'tipo' => $tipos[array_rand($tipos)],
                    ]);
                    $horariosCreados++;
                }
            }
        }

        $this->command->info("✅ {$horariosCreados} horarios de grupo creados exitosamente");
    }
}
