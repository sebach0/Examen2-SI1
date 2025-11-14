<?php

namespace App\Exports;

use Barryvdh\DomPDF\Facade\Pdf as DomPDF;
use Illuminate\Support\Collection;

/**
 * 📄 CLASE BASE PARA EXPORTACIONES PDF
 * =====================================
 * Proporciona funcionalidad común para todas las exportaciones PDF
 * 
 * Uso:
 * class MiPdfExport extends BasePdfExport
 * {
 *     protected $viewName = 'exports.mi-vista';
 *     protected $fileName = 'mi-reporte';
 *     
 *     protected function prepareData($data): array
 *     {
 *         return [
 *             'items' => $data,
 *             'total' => $data->count(),
 *             'fecha' => now()->format('d/m/Y H:i:s'),
 *         ];
 *     }
 * }
 */
abstract class BasePdfExport
{
    /**
     * Nombre de la vista Blade (sin extensión)
     * Debe estar en resources/views/exports/
     */
    protected $viewName;
    
    /**
     * Nombre base del archivo (sin extensión)
     */
    protected $fileName;
    
    /**
     * Datos a exportar
     */
    protected $data;
    
    /**
     * Filtros aplicados
     */
    protected $filtros = [];
    
    public function __construct($data, $filtros = [])
    {
        $this->data = $data;
        $this->filtros = $filtros;
    }
    
    /**
     * Preparar datos para la vista
     * Debe ser implementado por las clases hijas
     */
    abstract protected function prepareData($data): array;
    
    /**
     * Generar PDF (stream)
     */
    public function generate()
    {
        $viewData = $this->prepareData($this->data);
        $viewData['filtros'] = $this->filtros;
        
        $pdf = DomPDF::loadView($this->viewName, $viewData);
        
        $fileName = $this->getFileName();
        return $pdf->stream($fileName);
    }
    
    /**
     * Descargar PDF
     */
    public function download()
    {
        $viewData = $this->prepareData($this->data);
        $viewData['filtros'] = $this->filtros;
        
        $pdf = DomPDF::loadView($this->viewName, $viewData);
        
        $fileName = $this->getFileName();
        return $pdf->download($fileName);
    }
    
    /**
     * Obtener nombre del archivo con fecha
     */
    protected function getFileName(): string
    {
        $date = now()->format('Y-m-d');
        return $this->fileName . '-' . $date . '.pdf';
    }
}

