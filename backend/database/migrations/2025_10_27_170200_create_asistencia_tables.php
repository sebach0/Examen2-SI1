<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Módulo de Asistencia
 * 
 * 📝 EXPLICACIÓN:
 * ===============
 * ¡El corazón de tu sistema! Gestiona el registro de asistencias.
 * 
 * Flujo del sistema QR:
 * 1. Coordinador genera un QR para "Cálculo I - Grupo A - Lunes 8:00"
 * 2. Se crea un registro en qr_sesion con un token único + expiración
 * 3. Docente escanea el QR con su móvil
 * 4. Sistema valida el token y registra la asistencia
 * 5. Se guarda en la tabla asistencia: presente/ausente/tarde
 * 
 * Estados de asistencia:
 * - presente: Llegó a tiempo
 * - ausente: No marcó asistencia
 * - tarde: Llegó fuera del tiempo permitido
 * - justificado: Falta justificada con documento
 * 
 * Modos de marcado:
 * - QR: Escaneo de código QR
 * - manual: Marcado por coordinador/admin
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: asistencia
        // =====================
        // Registro de asistencias de docentes
        Schema::create('asistencia', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('docente_id')->comment('FK: Docente que marcó asistencia');
            $table->uuid('grupo_id')->comment('FK: Grupo donde marcó');
            $table->date('fecha')->comment('Fecha de la clase');
            $table->uuid('bloque_id')->comment('FK: Bloque horario de la clase');
            $table->enum('estado', ['presente', 'ausente', 'tarde', 'justificado'])
                ->comment('Estado de asistencia');
            $table->timestampTz('hora_marcado')->nullable()
                ->comment('Hora exacta en que marcó (null si ausente)');
            $table->enum('modo', ['QR', 'manual'])->comment('Modo de marcado');
            $table->string('observacion', 250)->nullable()
                ->comment('Observaciones adicionales');

            // Un docente solo puede marcar una vez por grupo + fecha + bloque
            $table->unique(['docente_id', 'grupo_id', 'fecha', 'bloque_id'], 'unico_asistencia');

            // FKs
            $table->foreign('docente_id')
                ->references('id')->on('docente')
                ->onDelete('cascade');
            $table->foreign('grupo_id')
                ->references('id')->on('grupo')
                ->onDelete('cascade');
            $table->foreign('bloque_id')
                ->references('id')->on('bloque_horario')
                ->onDelete('cascade');

            // Índices para reportes
            $table->index('fecha');
            $table->index('estado');
            $table->index(['docente_id', 'fecha']); // Para reportes por docente
        });

        // 2. Tabla: qr_sesion
        // ====================
        // Códigos QR generados para cada clase
        Schema::create('qr_sesion', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grupo_id');
            $table->date('fecha');
            $table->uuid('bloque_id');
            $table->string('token', 120)->unique();
            $table->timestampTz('expira_en')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestampTz('creado_en')->useCurrent();

            // Unique constraint: solo puede haber una sesión QR por grupo/fecha/bloque
            $table->unique(['grupo_id', 'fecha', 'bloque_id'], 'qr_sesion_grupo_fecha_bloque_unique');

            // Foreign keys
            $table->foreign('grupo_id')->references('id')->on('grupo')->onDelete('cascade');
            $table->foreign('bloque_id')->references('id')->on('bloque_horario')->onDelete('restrict');

            // Indexes
            $table->index('grupo_id');
            $table->index('fecha');
            $table->index('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencia');
        Schema::dropIfExists('qr_sesion');
    }
};
