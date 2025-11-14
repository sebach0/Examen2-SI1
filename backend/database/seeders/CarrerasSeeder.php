<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Domain\Academico\Models\Carrera;

class CarrerasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "📚 Creando carreras...\n";

        $carreras = [
            [
                'nombre' => 'Ingenieria en sistemas',
                'codigo' => 'ING-SIS',
            ],
            [
                'nombre' => 'Ingenieria Informatica',
                'codigo' => 'ING-INF',
            ],
            [
                'nombre' => 'Ingenieria en telecomunicaciones',
                'codigo' => 'ING-TEL',
            ],
        ];

        foreach ($carreras as $carreraData) {
            // Verificar si ya existe
            $existe = Carrera::where('codigo', $carreraData['codigo'])
                ->orWhere('nombre', $carreraData['nombre'])
                ->first();

            if (!$existe) {
                Carrera::create([
                    'id' => (string) Str::uuid(),
                    'nombre' => $carreraData['nombre'],
                    'codigo' => $carreraData['codigo'],
                ]);
                echo "  ✅ Creada: {$carreraData['nombre']} ({$carreraData['codigo']})\n";
            } else {
                echo "  ⏭️  Ya existe: {$carreraData['nombre']} ({$carreraData['codigo']})\n";
            }
        }

        echo "✅ Carreras creadas\n\n";
    }
}



