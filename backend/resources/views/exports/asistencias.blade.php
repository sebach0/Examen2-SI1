<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Asistencias</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .filtros {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .filtros h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
        }
        .filtros p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #4472C4;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .estado-presente {
            color: #28a745;
            font-weight: bold;
        }
        .estado-ausente {
            color: #dc3545;
            font-weight: bold;
        }
        .estado-tarde {
            color: #ffc107;
            font-weight: bold;
        }
        .estado-justificado {
            color: #17a2b8;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .total {
            margin-top: 20px;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Asistencias</h1>
        <p>Sistema de Gestión Académica</p>
        <p>Generado el: {{ $fecha_generacion }}</p>
    </div>

    @if (!empty($filtros))
    <div class="filtros">
        <h3>Filtros Aplicados:</h3>
        @if (isset($filtros['fecha_inicio']) || isset($filtros['fecha_fin']))
            <p><strong>Período:</strong> 
                {{ $filtros['fecha_inicio'] ?? 'Inicio' }} 
                - 
                {{ $filtros['fecha_fin'] ?? 'Fin' }}
            </p>
        @endif
        @if (isset($filtros['estado']))
            <p><strong>Estado:</strong> {{ ucfirst($filtros['estado']) }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Docente</th>
                <th>Materia</th>
                <th>Grupo</th>
                <th>Horario</th>
                <th>Estado</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($asistencias as $asistencia)
            <tr>
                <td>{{ $asistencia->fecha ? $asistencia->fecha->format('d/m/Y') : 'N/A' }}</td>
                <td>{{ $asistencia->docente ? $asistencia->docente->nombre : 'N/A' }}</td>
                <td>{{ $asistencia->grupo && $asistencia->grupo->materia ? $asistencia->grupo->materia->nombre : 'N/A' }}</td>
                <td>{{ $asistencia->grupo ? $asistencia->grupo->codigo : 'N/A' }}</td>
                <td>
                    @if ($asistencia->bloque)
                        {{ $asistencia->bloque->dia_semana }} 
                        {{ $asistencia->bloque->hora_inicio }}-{{ $asistencia->bloque->hora_fin }}
                    @else
                        N/A
                    @endif
                </td>
                <td class="estado-{{ $asistencia->estado }}">
                    {{ ucfirst($asistencia->estado) }}
                </td>
                <td>{{ $asistencia->observaciones ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No se encontraron registros
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="total">
        Total de registros: {{ $total }}
    </div>

    <div class="footer">
        <p>Este documento fue generado automáticamente por el Sistema de Gestión Académica</p>
        <p>Fecha de generación: {{ $fecha_generacion }}</p>
    </div>
</body>
</html>



