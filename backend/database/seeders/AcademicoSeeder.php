<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domain\Academico\Models\Carrera;
use App\Domain\Academico\Models\Materia;
use Illuminate\Support\Str;

class AcademicoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear Carreras
        $ingSistemas = Carrera::create([
            'id' => Str::uuid(),
            'nombre' => 'Ingeniería de Sistemas',
            'codigo' => 'ING-SIS',
        ]);

        $ingIndustrial = Carrera::create([
            'id' => Str::uuid(),
            'nombre' => 'Ingeniería Industrial',
            'codigo' => 'ING-IND',
        ]);

        // Materias de Ingeniería de Sistemas - Primer Semestre
        $calculo1 = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'MAT-101',
            'nombre' => 'Cálculo I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $algebra = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'MAT-111',
            'nombre' => 'Álgebra Lineal',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);

        $intro_prog = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-101',
            'nombre' => 'Introducción a la Programación',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        // Materias de Segundo Semestre con requisitos
        $calculo2 = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'MAT-102',
            'nombre' => 'Cálculo II',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        $calculo2->requisitos()->attach($calculo1->id);

        $prog_avanzada = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-102',
            'nombre' => 'Programación Avanzada',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        $prog_avanzada->requisitos()->attach($intro_prog->id);

        $estructuras = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-201',
            'nombre' => 'Estructuras de Datos',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        $estructuras->requisitos()->sync([$intro_prog->id, $algebra->id]);

        // Materias de Tercer Semestre
        $basedatos = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-301',
            'nombre' => 'Base de Datos I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        $basedatos->requisitos()->attach($estructuras->id);

        $algoritmos = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-202',
            'nombre' => 'Algoritmos y Complejidad',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);
        $algoritmos->requisitos()->attach($estructuras->id);

        // Materias de Ingeniería Industrial
        $calculo1_ind = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'MAT-101',
            'nombre' => 'Cálculo I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $fisica1 = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'FIS-101',
            'nombre' => 'Física I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $estadistica = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'EST-101',
            'nombre' => 'Estadística I',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);

        $this->command->info('✅ Creadas 2 carreras y ' . Materia::count() . ' materias académicas');
    }
}
