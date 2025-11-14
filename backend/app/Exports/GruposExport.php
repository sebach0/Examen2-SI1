<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * 📊 EXPORTACIÓN DE GRUPOS A EXCEL
 * =================================
 * Genera archivo Excel con listado de grupos
 */
class GruposExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
{
    protected $grupos;

    public function __construct($grupos)
    {
        $this->grupos = $grupos;
    }

    public function collection()
    {
        return $this->grupos;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Código',
            'Materia',
            'Código Materia',
            'Carrera',
            'Gestión',
            'Capacidad',
            'Estudiantes Inscritos',
            'Fecha Registro',
        ];
    }

    public function map($grupo): array
    {
        $materia = $grupo->materia;
        $carrera = $materia && $materia->carrera ? $materia->carrera->nombre : 'N/A';
        $gestion = $grupo->gestion;
        $gestionNombre = $gestion ? $gestion->codigo . ' (' . $gestion->anio . ')' : 'N/A';
        
        return [
            $grupo->id,
            $grupo->codigo,
            $materia ? $materia->nombre : 'N/A',
            $materia ? $materia->codigo : 'N/A',
            $carrera,
            $gestionNombre,
            $grupo->capacidad ?? 0,
            0, // Estudiantes inscritos (se puede calcular si hay relación)
            $grupo->created_at ? $grupo->created_at->format('d/m/Y H:i') : 'N/A',
        ];
    }

    public function title(): string
    {
        return 'Listado de Grupos';
    }
    
    protected function getColumnsToAutoSize(): array
    {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    }
}

