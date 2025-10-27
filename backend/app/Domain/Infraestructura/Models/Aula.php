<?php

namespace App\Domain\Infraestructura\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Aula
 * 
 * @property string $id
 * @property string $edificio_id
 * @property string $codigo
 * @property string $nombre
 * @property string $tipo
 * @property int $capacidad
 */
class Aula extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'aula';

    public $timestamps = false;

    protected $fillable = [
        'edificio_id',
        'codigo',
        'nombre',
        'tipo',
        'capacidad',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un aula pertenece a un edificio
     */
    public function edificio()
    {
        return $this->belongsTo(Edificio::class);
    }

    /**
     * Un aula tiene muchos horarios asignados
     */
    public function horarios()
    {
        return $this->hasMany(\App\Domain\TiempoHorarios\Models\HorarioGrupo::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por tipo de aula
     */
    public function scopePorTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Filtrar por edificio
     */
    public function scopePorEdificio($query, string $edificioId)
    {
        return $query->where('edificio_id', $edificioId);
    }

    /**
     * Aulas con capacidad mínima
     */
    public function scopeConCapacidadMinima($query, int $capacidad)
    {
        return $query->where('capacidad', '>=', $capacidad);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Obtiene el código completo del aula
     * Ejemplo: "Edificio A - Aula 101"
     */
    public function getCodigoCompletoAttribute(): string
    {
        return "{$this->edificio->nombre} - {$this->nombre}";
    }

    /**
     * Verifica si el aula está disponible en un bloque específico
     */
    public function estaDisponible(string $bloqueId, string $fecha): bool
    {
        // Verifica si ya hay un horario asignado en ese bloque
        return !$this->horarios()
            ->where('bloque_id', $bloqueId)
            ->whereHas('grupo', function ($query) use ($fecha) {
                $query->whereHas('gestion', function ($q) use ($fecha) {
                    $q->where('fecha_inicio', '<=', $fecha)
                      ->where('fecha_fin', '>=', $fecha);
                });
            })
            ->exists();
    }
}
