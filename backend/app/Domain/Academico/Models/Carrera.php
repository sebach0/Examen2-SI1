<?php

namespace App\Domain\Academico\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Carrera
 * 
 * @property string $id
 * @property string $nombre
 * @property string $codigo
 */
class Carrera extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'carrera';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'codigo',
    ];

    /**
     * RELACIONES
     */

    /**
     * Una carrera tiene muchas materias
     */
    public function materias()
    {
        return $this->hasMany(Materia::class);
    }
}
