<?php

namespace App\Exports;

/**
 * 📄 EXPORTACIÓN DE DOCENTES A PDF
 * =================================
 * Genera archivo PDF con listado de docentes
 */
class DocentesPdfExport extends BasePdfExport
{
    protected $viewName = 'exports.docentes';
    protected $fileName = 'reporte-docentes';
    
    /**
     * Preparar datos para la vista
     */
    protected function prepareData($data): array
    {
        return [
            'docentes' => $data,
            'total' => $data->count(),
            'fecha_generacion' => now()->format('d/m/Y H:i:s'),
        ];
    }
}

