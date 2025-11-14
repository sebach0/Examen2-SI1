<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * 📊 EXPORTACIÓN DE MATERIAS A EXCEL
 * ===================================
 * Genera archivo Excel con listado de materias
 */
class MateriasExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
{
    protected $materias;

    public function __construct($materias)
    {
        $this->materias = $materias;
    }

    public function collection()
    {
        return $this->materias;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Código',
            'Nombre',
            'Carrera',
            'Horas Semanales',
            'Créditos',
            'Pre-requisitos',
            'Fecha Registro',
        ];
    }

    public function map($materia): array
    {
        $carrera = $materia->carrera ? $materia->carrera->nombre : 'N/A';
        $requisitos = $materia->requisitos 
            ? $materia->requisitos->pluck('codigo')->join(', ') 
            : 'Ninguno';
        
        return [
            $materia->id,
            $materia->codigo,
            $materia->nombre,
            $carrera,
            $materia->horas_semanales ?? 0,
            $materia->creditos ?? 0,
            $requisitos,
            $materia->created_at ? $materia->created_at->format('d/m/Y H:i') : 'N/A',
        ];
    }

    public function title(): string
    {
        return 'Listado de Materias';
    }
    
    protected function getColumnsToAutoSize(): array
    {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    }
}

