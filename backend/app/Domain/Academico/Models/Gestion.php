<?php

namespace App\Domain\Academico\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Gestion
 * 
 * 📝 CONCEPTO: Gestiones Académicas
 * ==================================
 * Representa periodos académicos (semestres, cuatrimestres, años).
 * 
 * Ejemplos:
 * - Código "2024-1": Primer semestre de 2024
 * - Código "2024-2": Segundo semestre de 2024
 * - Código "2024-A": Año completo 2024
 * 
 * Uso práctico:
 * - Agrupar grupos por periodo
 * - Reportes históricos de asistencias
 * - Asignar roles temporales (coordinador solo en 2024-1)
 * 
 * @property string $id
 * @property int $anio
 * @property string $periodo
 * @property \Carbon\Carbon $fecha_inicio
 * @property \Carbon\Carbon $fecha_fin
 * @property string $codigo
 */
class Gestion extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'gestion';

    public $timestamps = false;

    protected $fillable = [
        'anio',
        'periodo',
        'fecha_inicio',
        'fecha_fin',
        'codigo',
    ];

    /**
     * Casts: Convertir strings de fecha a objetos Carbon
     * Esto permite usar: $gestion->fecha_inicio->format('d/m/Y')
     */
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    /**
     * RELACIONES
     */

    /**
     * Una gestión tiene muchos grupos
     */
    public function grupos()
    {
        return $this->hasMany(Grupo::class);
    }

    /**
     * Una gestión tiene muchos perfiles asignados
     */
    public function perfiles()
    {
        return $this->hasMany(PerfilGestion::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por año
     * Uso: Gestion::porAnio(2024)->get()
     */
    public function scopePorAnio($query, int $anio)
    {
        return $query->where('anio', $anio);
    }

    /**
     * Obtener gestión actual (basado en fecha actual)
     * Uso: Gestion::actual()->first()
     */
    public function scopeActual($query)
    {
        $hoy = now();
        return $query->where('fecha_inicio', '<=', $hoy)
                    ->where('fecha_fin', '>=', $hoy);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si la gestión está activa actualmente
     */
    public function isActiva(): bool
    {
        $hoy = now();
        return $this->fecha_inicio <= $hoy && $this->fecha_fin >= $hoy;
    }

    /**
     * Obtiene el nombre completo de la gestión
     * Ejemplo: "2024 - Primer Semestre"
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->anio} - {$this->periodo}";
    }
}
