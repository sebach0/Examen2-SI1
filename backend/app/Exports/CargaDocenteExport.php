<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * 📊 EXPORTACIÓN DE CARGA DOCENTE A EXCEL
 * ========================================
 * Genera archivo Excel con listado de cargas docentes
 */
class CargaDocenteExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
{
    protected $cargas;

    public function __construct($cargas)
    {
        $this->cargas = $cargas;
    }

    public function collection()
    {
        return $this->cargas;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Docente',
            'CI Docente',
            'Email',
            'Grupo',
            'Materia',
            'Gestión',
            'Horas Asignadas',
            'Fecha Asignación',
        ];
    }

    public function map($carga): array
    {
        $docente = $carga->docente;
        $usuario = $docente && $docente->usuario ? $docente->usuario : null;
        $grupo = $carga->grupo;
        $materia = $grupo && $grupo->materia ? $grupo->materia->nombre : 'N/A';
        $gestion = $grupo && $grupo->gestion ? $grupo->gestion->codigo : 'N/A';
        
        return [
            $carga->id,
            $docente ? $docente->nombre : 'N/A',
            $docente ? ($docente->ci ?? 'N/A') : 'N/A',
            $usuario ? $usuario->email : 'N/A',
            $grupo ? $grupo->codigo : 'N/A',
            $materia,
            $gestion,
            $carga->horas_asignadas ?? 0,
            $carga->created_at ? $carga->created_at->format('d/m/Y H:i') : 'N/A',
        ];
    }

    public function title(): string
    {
        return 'Carga Docente';
    }
    
    protected function getColumnsToAutoSize(): array
    {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    }
}

