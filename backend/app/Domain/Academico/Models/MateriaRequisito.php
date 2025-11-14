<?php

namespace App\Domain\Academico\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Model MateriaRequisito (Pivot)
 * 
 * 📝 CONCEPTO: Tabla Pivot con UUID
 * ==================================
 * Modelo personalizado para la tabla pivot materia_requisito.
 * 
 * ¿Por qué un modelo Pivot personalizado?
 * - La tabla tiene una columna 'id' UUID que debe generarse automáticamente
 * - Laravel por defecto no genera UUIDs en tablas pivot
 * - Usamos el trait HasUuid para generar el ID automáticamente
 * 
 * @property string $id UUID
 * @property string $materia_id
 * @property string $requisito_id
 */
class MateriaRequisito extends Pivot
{
    use HasUuid;

    protected $table = 'materia_requisito';

    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'materia_id',
        'requisito_id',
    ];

    /**
     * Ocultar el pivot de la serialización JSON
     * Esto evita que se incluya información innecesaria del pivot
     */
    protected $hidden = ['pivot'];
}

