<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * 📊 EXPORTACIÓN DE HORARIOS A EXCEL
 * ===================================
 * Genera archivo Excel con listado de horarios de grupos
 */
class HorariosExport extends BaseExcelExport implements FromCollection, WithHeadings, WithMapping
{
    protected $horarios;

    public function __construct($horarios)
    {
        $this->horarios = $horarios;
    }

    public function collection()
    {
        return $this->horarios;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Grupo',
            'Materia',
            'Gestión',
            'Día',
            'Hora Inicio',
            'Hora Fin',
            'Aula',
            'Edificio',
            'Tipo',
            'Fecha Registro',
        ];
    }

    public function map($horario): array
    {
        $grupo = $horario->grupo;
        $materia = $grupo && $grupo->materia ? $grupo->materia->nombre : 'N/A';
        $gestion = $grupo && $grupo->gestion ? $grupo->gestion->codigo : 'N/A';
        $bloque = $horario->bloque;
        $aula = $horario->aula;
        $edificio = $aula && $aula->edificio ? $aula->edificio->nombre : 'N/A';
        
        $dias = [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo',
        ];
        
        $diaNombre = $bloque && isset($dias[$bloque->dia_semana]) 
            ? $dias[$bloque->dia_semana] 
            : ($bloque ? $bloque->dia_semana : 'N/A');
        
        $tipos = [
            'teorica' => 'Teórica',
            'practica' => 'Práctica',
            'laboratorio' => 'Laboratorio',
        ];
        
        $tipoNombre = isset($tipos[$horario->tipo]) ? $tipos[$horario->tipo] : ucfirst($horario->tipo);
        
        return [
            $horario->id,
            $grupo ? $grupo->codigo : 'N/A',
            $materia,
            $gestion,
            $diaNombre,
            $bloque ? substr($bloque->hora_inicio, 0, 5) : 'N/A',
            $bloque ? substr($bloque->hora_fin, 0, 5) : 'N/A',
            $aula ? $aula->codigo : 'N/A',
            $edificio,
            $tipoNombre,
            $horario->created_at ? $horario->created_at->format('d/m/Y H:i') : 'N/A',
        ];
    }

    public function title(): string
    {
        return 'Horarios de Grupos';
    }
    
    protected function getColumnsToAutoSize(): array
    {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    }
}

