<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domain\Academico\Models\Carrera;
use App\Domain\Academico\Models\Materia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $calculo2->id,
            'requisito_id' => $calculo1->id,
        ]);

        $prog_avanzada = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-102',
            'nombre' => 'Programación Avanzada',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $prog_avanzada->id,
            'requisito_id' => $intro_prog->id,
        ]);

        $estructuras = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-201',
            'nombre' => 'Estructuras de Datos',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $estructuras->id,
            'requisito_id' => $intro_prog->id,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $estructuras->id,
            'requisito_id' => $algebra->id,
        ]);

        // Materias de Tercer Semestre
        $basedatos = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-301',
            'nombre' => 'Base de Datos I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $basedatos->id,
            'requisito_id' => $estructuras->id,
        ]);

        $algoritmos = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-202',
            'nombre' => 'Algoritmos y Complejidad',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $algoritmos->id,
            'requisito_id' => $estructuras->id,
        ]);

        // Materias de Ingeniería Industrial
        $calculo1_ind = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'IND-101',
            'nombre' => 'Cálculo I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $fisica1 = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'IND-102',
            'nombre' => 'Física I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $estadistica = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'IND-103',
            'nombre' => 'Estadística I',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);

        // Más materias de Sistemas - Cuarto Semestre
        $ingsoft = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-401',
            'nombre' => 'Ingeniería de Software I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $ingsoft->id,
            'requisito_id' => $basedatos->id,
        ]);

        $redesI = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-402',
            'nombre' => 'Redes de Computadoras I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $sisoper = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-403',
            'nombre' => 'Sistemas Operativos',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        // Quinto Semestre
        $basedatos2 = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-501',
            'nombre' => 'Base de Datos II',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $basedatos2->id,
            'requisito_id' => $basedatos->id,
        ]);

        $webI = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-502',
            'nombre' => 'Desarrollo Web I',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $webI->id,
            'requisito_id' => $prog_avanzada->id,
        ]);

        $ia = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingSistemas->id,
            'codigo' => 'SIS-503',
            'nombre' => 'Inteligencia Artificial',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $ia->id,
            'requisito_id' => $algoritmos->id,
        ]);
        DB::table('materia_requisito')->insert([
            'id' => Str::uuid(),
            'materia_id' => $ia->id,
            'requisito_id' => $estadistica->id,
        ]);

        // Más materias de Industrial
        $produccion = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'IND-201',
            'nombre' => 'Gestión de Producción',
            'horas_semanales' => 6,
            'creditos' => 8,
        ]);

        $calidad = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'IND-301',
            'nombre' => 'Control de Calidad',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);

        $logistica = Materia::create([
            'id' => Str::uuid(),
            'carrera_id' => $ingIndustrial->id,
            'codigo' => 'IND-302',
            'nombre' => 'Logística y Cadena de Suministro',
            'horas_semanales' => 4,
            'creditos' => 6,
        ]);

        $this->command->info('✅ Creadas 2 carreras y ' . Materia::count() . ' materias académicas');
    }
}
