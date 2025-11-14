<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Docentes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            color: #666;
            font-size: 10px;
        }
        .summary {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-left: 4px solid #4472C4;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Docentes</h1>
        <p>Fecha de generación: {{ $fecha_generacion }}</p>
    </div>

    <div class="summary">
        <strong>Total de docentes:</strong> {{ $total }}
    </div>

    <table>
        <thead>
            <tr>
                <th>CI</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Roles</th>
            </tr>
        </thead>
        <tbody>
            @forelse($docentes as $docente)
                <tr>
                    <td>{{ $docente->ci ?? 'N/A' }}</td>
                    <td>{{ $docente->nombre }}</td>
                    <td>{{ $docente->usuario ? $docente->usuario->email : 'N/A' }}</td>
                    <td>{{ $docente->telefono ?? 'N/A' }}</td>
                    <td>{{ $docente->usuario ? $docente->usuario->username : 'N/A' }}</td>
                    <td>{{ $docente->usuario ? ucfirst($docente->usuario->estado) : 'N/A' }}</td>
                    <td>
                        @if($docente->usuario && $docente->usuario->roles)
                            {{ $docente->usuario->roles->pluck('nombre')->join(', ') }}
                        @else
                            N/A
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center;">No hay docentes para mostrar</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Generado el {{ $fecha_generacion }}</p>
    </div>
</body>
</html>

