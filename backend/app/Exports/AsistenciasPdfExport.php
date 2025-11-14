<?php

namespace App\Exports;

/**
 * 📄 EXPORTACIÓN DE ASISTENCIAS A PDF
 * ====================================
 * Genera archivo PDF con reporte de asistencias
 */
class AsistenciasPdfExport extends BasePdfExport
{
    protected $viewName = 'exports.asistencias';
    protected $fileName = 'reporte-asistencias';
    
    /**
     * Preparar datos para la vista
     */
    protected function prepareData($data): array
    {
        return [
            'asistencias' => $data,
            'total' => $data->count(),
            'fecha_generacion' => now()->format('d/m/Y H:i:s'),
        ];
    }
}

