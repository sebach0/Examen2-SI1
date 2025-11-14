<?php

namespace App\Domain\Asistencia\Models;

use App\Domain\Academico\Models\Grupo;
use App\Domain\Shared\Traits\HasUuid;
use App\Domain\TiempoHorarios\Models\BloqueHorario;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Model QrSesion
 * 
 * 📝 CONCEPTO: Sesión QR Temporal
 * ================================
 * Genera códigos QR únicos para cada sesión de clase.
 * 
 * Flujo de trabajo:
 * 1. Coordinador crea sesión QR para una clase
 * 2. Sistema genera token único
 * 3. Muestra código QR en proyector del aula
 * 4. Docente escanea QR con su móvil
 * 5. Sistema registra asistencia automáticamente
 * 6. Token expira después de X minutos
 * 
 * Ventajas:
 * - Sin necesidad de registros manuales
 * - Valida presencia física en el aula
 * - Previene fraude (token único y temporal)
 * 
 * @property string $id
 * @property string $grupo_id
 * @property string $bloque_id
 * @property \DateTime $fecha
 * @property string $token (único, para validar escaneo)
 * @property \DateTime|null $expira_en
 * @property bool $activo
 * @property \DateTime $creado_en
 */
class QrSesion extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'qr_sesion';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;

    protected $fillable = [
        'grupo_id',
        'bloque_id',
        'fecha',
        'token',
        'expira_en',
        'activo',
    ];

    /**
     * Casts: Convertir fechas a Carbon, activo a boolean
     */
    protected $casts = [
        'fecha' => 'datetime',
        'expira_en' => 'datetime',
        'activo' => 'boolean',
        'creado_en' => 'datetime',
    ];

    /**
     * Accessor: Asegurar que expira_en siempre esté en timezone de Bolivia
     * Nota: El cast ya convierte a Carbon, pero necesitamos asegurar el timezone
     * IMPORTANTE: Usar getRawOriginal para evitar recursión infinita
     */
    public function getExpiraEnAttribute($value)
    {
        if (!$value) {
            return null;
        }
        
        // Si ya es Carbon (después del cast), asegurar timezone
        if ($value instanceof \Carbon\Carbon) {
            // Verificar si ya está en el timezone correcto para evitar conversiones innecesarias
            if ($value->timezone->getName() === config('app.timezone')) {
                return $value;
            }
            return $value->copy()->setTimezone(config('app.timezone'));
        }
        
        // Si es string, parsearlo y establecer timezone
        try {
            return \Carbon\Carbon::parse($value)->setTimezone(config('app.timezone'));
        } catch (\Exception $e) {
            // Si hay error al parsear, retornar null o el valor original
            \Log::warning('Error al parsear expira_en en QrSesion', [
                'value' => $value,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * BOOT: Generar token automáticamente
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function (QrSesion $sesion) {
            if (!$sesion->token) {
                // Genera token único de 32 caracteres
                $sesion->token = Str::random(32);
            }

            // Por defecto, expira en 15 minutos (en timezone de Bolivia)
            if (!$sesion->expira_en) {
                $sesion->expira_en = now()->setTimezone(config('app.timezone'))->addMinutes(15);
            }

            // Por defecto, está activo
            if (!isset($sesion->activo)) {
                $sesion->activo = true;
            }
        });
    }

    /**
     * RELACIONES
     */

    /**
     * Una sesión QR pertenece a un grupo
     */
    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    /**
     * Una sesión QR pertenece a un bloque horario
     */
    public function bloque()
    {
        return $this->belongsTo(BloqueHorario::class, 'bloque_id');
    }

    /**
     * SCOPES
     */

    /**
     * Solo sesiones activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true)
            ->where('expira_en', '>', now());
    }

    /**
     * Filtrar por grupo
     */
    public function scopePorGrupo($query, string $grupoId)
    {
        return $query->where('grupo_id', $grupoId);
    }

    /**
     * Filtrar por fecha
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    /**
     * Buscar por token
     */
    public function scopePorToken($query, string $token)
    {
        return $query->where('token', $token);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si la sesión sigue activa
     */
    public function estaActiva(): bool
    {
        return $this->activo 
            && $this->expira_en 
            && $this->expira_en->isFuture();
    }

    /**
     * Verifica si la sesión expiró
     */
    public function haExpirado(): bool
    {
        return !$this->estaActiva();
    }

    /**
     * Desactiva la sesión QR
     */
    public function desactivar(): void
    {
        $this->update(['activo' => false]);
    }

    /**
     * Extiende el tiempo de expiración
     */
    public function extenderTiempo(int $minutos): void
    {
        $this->update([
            'expira_en' => $this->expira_en->addMinutes($minutos)
        ]);
    }

    /**
     * Obtiene la URL del código QR
     * (Usarás esto en el frontend para generar el QR)
     */
    public function getUrlQrAttribute(): string
    {
        // URL que el docente escaneará
        return config('app.url') . "/api/asistencia/registrar-qr?token={$this->token}";
    }
}
