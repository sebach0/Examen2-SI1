<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

/**
 * 📊 CLASE BASE PARA EXPORTACIONES EXCEL
 * =======================================
 * Proporciona funcionalidad común para todas las exportaciones Excel
 * 
 * Uso:
 * class MiExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
 * {
 *     protected $data;
 *     
 *     public function __construct($data) {
 *         $this->data = $data;
 *     }
 *     
 *     public function collection() { return $this->data; }
 *     public function headings(): array { return ['Col1', 'Col2']; }
 *     public function map($item): array { return [$item->campo1, $item->campo2]; }
 *     public function title(): string { return 'Mi Reporte'; }
 * }
 */
abstract class BaseExcelExport implements WithStyles, WithTitle
{
    /**
     * Color de encabezado (azul por defecto)
     */
    protected $headerColor = '4472C4';
    
    /**
     * Título de la hoja
     */
    abstract public function title(): string;
    
    /**
     * Obtener el rango de columnas para los encabezados
     * Debe ser implementado por las clases hijas o se calcula automáticamente
     */
    protected function getHeaderRange(): ?string
    {
        return null; // Se calculará automáticamente si es null
    }
    
    /**
     * Obtener las columnas a auto-ajustar
     * Retorna array de letras de columnas, ej: ['A', 'B', 'C']
     */
    protected function getColumnsToAutoSize(): array
    {
        return []; // Se calculará automáticamente si está vacío
    }
    
    /**
     * Aplicar estilos a la hoja
     */
    public function styles(Worksheet $sheet)
    {
        // Obtener el rango de encabezados
        $headerRange = $this->getHeaderRange();
        
        // Si no se especifica, intentar calcularlo
        if (!$headerRange) {
            $highestColumn = $sheet->getHighestColumn();
            $headerRange = 'A1:' . $highestColumn . '1';
        }
        
        // Estilo para encabezados
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $this->headerColor],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        
        // Auto-ajustar ancho de columnas
        $columns = $this->getColumnsToAutoSize();
        if (empty($columns)) {
            // Calcular automáticamente basado en el rango de encabezados
            $highestColumn = $sheet->getHighestColumn();
            $columns = range('A', $highestColumn);
        }
        
        foreach ($columns as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        // Estilo para filas de datos (alternar colores)
        $highestRow = $sheet->getHighestRow();
        if ($highestRow > 1) {
            for ($row = 2; $row <= $highestRow; $row++) {
                if ($row % 2 == 0) {
                    $rowRange = 'A' . $row . ':' . $sheet->getHighestColumn() . $row;
                    $sheet->getStyle($rowRange)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F2F2F2'],
                        ],
                    ]);
                }
            }
        }
        
        return $sheet;
    }
}

