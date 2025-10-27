<?php

namespace App\Domain\Infraestructura\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Edificio
 * 
 * @property string $id
 * @property string $nombre
 */
class Edificio extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'edificio';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un edificio tiene muchas aulas
     */
    public function aulas()
    {
        return $this->hasMany(Aula::class);
    }

    /**
     * SCOPES
     */

    /**
     * Buscar por nombre (case-insensitive)
     */
    public function scopeBuscarPorNombre($query, string $nombre)
    {
        return $query->whereRaw('LOWER(nombre) LIKE ?', ['%' . strtolower($nombre) . '%']);
    }
}
