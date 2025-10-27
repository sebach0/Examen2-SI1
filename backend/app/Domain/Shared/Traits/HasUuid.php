<?php

namespace App\Domain\Shared\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Trait HasUuid
 * 
 * 📝 EXPLICACIÓN PARA APRENDER:
 * ============================
 * Este trait hace que los modelos usen UUID en vez de auto-increment IDs.
 * 
 * ¿Qué es un Trait en PHP?
 * - Es una forma de "mezclar" funcionalidad en una clase
 * - Evita duplicar código en múltiples modelos
 * - Se usa con: use HasUuid;
 * 
 * ¿Por qué UUID en vez de 1, 2, 3...?
 * - UUID = Identificador Único Universal (ej: 550e8400-e29b-41d4-a716-446655440000)
 * - Más seguro: No se puede predecir el siguiente ID
 * - Mejor para sistemas distribuidos
 * - Tu base de datos lo requiere según el diagrama UML
 * 
 * ¿Cómo funciona este código?
 * - booted() se ejecuta cuando Laravel inicializa el modelo
 * - creating es un "evento" que se dispara ANTES de guardar en DB
 * - Si no hay ID, genera un UUID automáticamente
 */
trait HasUuid
{
    /**
     * Bootstrap del trait - Laravel lo llama automáticamente
     */
    protected static function bootHasUuid(): void
    {
        // Evento: Antes de crear un nuevo registro
        static::creating(function (Model $model) {
            // Si el modelo no tiene ID aún, genera uno
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    /**
     * Indica a Laravel que NO auto-incremente el ID
     */
    public function getIncrementing(): bool
    {
        return false;
    }

    /**
     * Indica que el tipo de clave primaria es string (UUID)
     */
    public function getKeyType(): string
    {
        return 'string';
    }
}
