<?php

namespace App\Exports;

use App\Domain\Academico\Models\Docente;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * 📊 EXPORTACIÓN DE DOCENTES A EXCEL
 * ===================================
 * Genera archivo Excel con listado de docentes
 */
class DocentesExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
{
    protected $docentes;

    public function __construct($docentes)
    {
        $this->docentes = $docentes;
    }

    /**
     * Colección de datos a exportar
     */
    public function collection()
    {
        return $this->docentes;
    }

    /**
     * Encabezados de las columnas
     */
    public function headings(): array
    {
        return [
            'ID',
            'CI',
            'Nombre Completo',
            'Email',
            'Teléfono',
            'Usuario',
            'Estado',
            'Roles',
            'Carga Horaria',
            'Fecha Registro',
        ];
    }

    /**
     * Mapear cada fila
     */
    public function map($docente): array
    {
        $usuario = $docente->usuario;
        $roles = $usuario ? $usuario->roles->pluck('nombre')->join(', ') : 'N/A';
        
        // Calcular carga horaria total
        $cargaHoraria = 0;
        if ($docente->cargas) {
            $cargaHoraria = $docente->cargas->sum('horas_asignadas');
        }
        
        return [
            $docente->id,
            $docente->ci ?? 'N/A',
            $docente->nombre,
            $usuario ? $usuario->email : 'N/A',
            $docente->telefono ?? 'N/A',
            $usuario ? $usuario->username : 'N/A',
            $usuario ? ucfirst($usuario->estado) : 'N/A',
            $roles,
            $cargaHoraria . ' horas',
            $docente->created_at ? $docente->created_at->format('d/m/Y H:i') : 'N/A',
        ];
    }

    /**
     * Título de la hoja
     */
    public function title(): string
    {
        return 'Listado de Docentes';
    }
    
    /**
     * Columnas a auto-ajustar
     */
    protected function getColumnsToAutoSize(): array
    {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    }
}

