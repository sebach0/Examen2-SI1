<?php

namespace App\Exports;

use App\Domain\Asistencia\Models\Asistencia;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * 📊 EXPORTACIÓN DE ASISTENCIAS A EXCEL
 * ======================================
 * Genera archivo Excel con reporte de asistencias
 */
class AsistenciasExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
{
    protected $asistencias;

    public function __construct($asistencias)
    {
        $this->asistencias = $asistencias;
    }

    /**
     * Colección de datos a exportar
     */
    public function collection()
    {
        return $this->asistencias;
    }

    /**
     * Encabezados de las columnas
     */
    public function headings(): array
    {
        return [
            'ID',
            'Fecha',
            'Docente',
            'CI Docente',
            'Materia',
            'Grupo',
            'Bloque Horario',
            'Aula',
            'Estado',
            'Observaciones',
            'Registrado Por',
            'Fecha Registro',
        ];
    }

    /**
     * Mapear cada fila
     */
    public function map($asistencia): array
    {
        return [
            $asistencia->id,
            $asistencia->fecha ? $asistencia->fecha->format('d/m/Y') : '',
            $asistencia->docente ? $asistencia->docente->nombre : 'N/A',
            $asistencia->docente ? $asistencia->docente->ci : 'N/A',
            $asistencia->grupo && $asistencia->grupo->materia 
                ? $asistencia->grupo->materia->nombre 
                : 'N/A',
            $asistencia->grupo ? $asistencia->grupo->codigo : 'N/A',
            $asistencia->bloque 
                ? $asistencia->bloque->dia_semana . ' ' . $asistencia->bloque->hora_inicio . '-' . $asistencia->bloque->hora_fin
                : 'N/A',
            'N/A', // Aula se obtiene del horario-grupo, no directamente de asistencia
            $this->getEstadoLabel($asistencia->estado),
            $asistencia->observaciones ?? '',
            $asistencia->usuario_registro ?? 'Sistema',
            $asistencia->created_at ? $asistencia->created_at->format('d/m/Y H:i') : '',
        ];
    }

    /**
     * Obtener etiqueta del estado
     */
    protected function getEstadoLabel(string $estado): string
    {
        $estados = [
            'presente' => 'Presente',
            'ausente' => 'Ausente',
            'tarde' => 'Tarde',
            'justificado' => 'Justificado',
        ];

        return $estados[$estado] ?? $estado;
    }

    /**
     * Título de la hoja
     */
    public function title(): string
    {
        return 'Reporte de Asistencias';
    }
    
    /**
     * Columnas a auto-ajustar
     */
    protected function getColumnsToAutoSize(): array
    {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    }
}

