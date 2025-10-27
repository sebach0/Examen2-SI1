<?php

namespace App\Domain\Importacion\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model ImportJob
 * 
 * 📝 CONCEPTO: Importación Masiva de Datos
 * =========================================
 * Rastrea procesos de importación desde archivos (Excel, CSV, etc.)
 * 
 * Casos de uso:
 * - Importar lista de docentes al inicio de gestión
 * - Importar horarios desde archivo Excel
 * - Importar estudiantes por carrera
 * - Cargar materias y grupos
 * 
 * Estados:
 * - pending: En cola, esperando procesamiento
 * - processing: Procesando actualmente
 * - completed: Completado exitosamente (100%)
 * - failed: Falló completamente
 * - partial: Completado con algunos errores
 * 
 * @property string $id
 * @property string $tipo (docentes, grupos, horarios, etc.)
 * @property string $file_path
 * @property string $estado
 * @property int $total
 * @property int $procesados
 * @property int $errores
 * @property string|null $detalle_error (text con detalles)
 * @property \DateTime $creado_en
 */
class ImportJob extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'import_job';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;

    protected $fillable = [
        'tipo',
        'file_path',
        'estado',
        'total',
        'procesados',
        'errores',
        'detalle_error',
    ];

    /**
     * Casts: Convertir detalle_error a array, fechas a Carbon
     */
    protected $casts = [
        'detalle_error' => 'array',
        'creado_en' => 'datetime',
    ];

    /**
     * SCOPES
     */

    /**
     * Filtrar por tipo de importación
     */
    public function scopePorTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Filtrar por estado
     */
    public function scopePorEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Solo importaciones pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pending');
    }

    /**
     * Solo importaciones en proceso
     */
    public function scopeEnProceso($query)
    {
        return $query->where('estado', 'processing');
    }

    /**
     * Solo importaciones completadas
     */
    public function scopeCompletadas($query)
    {
        return $query->where('estado', 'completed');
    }

    /**
     * Importaciones con errores
     */
    public function scopeConErrores($query)
    {
        return $query->whereIn('estado', ['failed', 'partial']);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Inicia el procesamiento
     */
    public function iniciarProcesamiento(): void
    {
        $this->update([
            'estado' => 'processing',
        ]);
    }

    /**
     * Incrementa el contador de procesados
     */
    public function incrementarProcesados(): void
    {
        $this->increment('procesados');
    }

    /**
     * Incrementa el contador de errores
     */
    public function incrementarErrores(): void
    {
        $this->increment('errores');
    }

    /**
     * Agrega un error al log
     */
    public function agregarError(int $fila, string $mensaje): void
    {
        $detalles = $this->detalle_error ?? [];
        
        $detalles[] = [
            'fila' => $fila,
            'mensaje' => $mensaje,
            'timestamp' => now()->toDateTimeString(),
        ];

        $this->update(['detalle_error' => $detalles]);
    }

    /**
     * Marca como completada
     */
    public function marcarCompletada(): void
    {
        $estado = $this->errores > 0 ? 'partial' : 'completed';
        
        $this->update(['estado' => $estado]);
    }

    /**
     * Marca como fallida
     */
    public function marcarFallida(string $razon): void
    {
        $this->agregarError(0, $razon);
        $this->update(['estado' => 'failed']);
    }

    /**
     * Calcula el porcentaje de progreso
     */
    public function getPorcentajeProgresoAttribute(): float
    {
        if ($this->total === 0) {
            return 0;
        }

        return round(($this->procesados / $this->total) * 100, 2);
    }

    /**
     * Verifica si está completa
     */
    public function estaCompleta(): bool
    {
        return in_array($this->estado, ['completed', 'partial']);
    }

    /**
     * Verifica si falló
     */
    public function fallo(): bool
    {
        return $this->estado === 'failed';
    }

    /**
     * Obtiene resumen de la importación
     */
    public function getResumenAttribute(): array
    {
        return [
            'tipo' => $this->tipo,
            'estado' => $this->estado,
            'total' => $this->total,
            'procesados' => $this->procesados,
            'errores' => $this->errores,
            'porcentaje' => $this->porcentaje_progreso,
            'fecha' => $this->creado_en->format('Y-m-d H:i'),
        ];
    }
}
