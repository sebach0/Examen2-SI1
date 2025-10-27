<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Módulo de Tiempo y Horarios
 * 
 * 📝 EXPLICACIÓN:
 * ===============
 * Este módulo maneja todo lo relacionado con horarios y asignaciones:
 * - Bloques horarios (períodos de tiempo: Lunes 8:00-9:30, Martes 10:00-11:30)
 * - Carga docente (qué docente enseña qué grupo)
 * - Horario de grupos (cuándo y dónde se imparte cada grupo)
 * 
 * Conceptos clave:
 * - dia_semana: 1=Lunes, 2=Martes, ..., 7=Domingo
 * - Bloque: Período de tiempo específico (ej: 8:00-9:30)
 * - Horario: Asigna un grupo a un bloque + aula
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: bloque_horario
        // =========================
        // Define bloques de tiempo reutilizables
        // Ejemplo: "Lunes 8:00-9:30" es un bloque
        Schema::create('bloque_horario', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('dia_semana')->comment('1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab, 7=Dom');
            $table->time('hora_inicio')->comment('Hora de inicio del bloque');
            $table->time('hora_fin')->comment('Hora de fin del bloque');

            // Un bloque es único por día + hora_inicio + hora_fin
            // No puede haber dos bloques "Lunes 8:00-9:30"
            $table->unique(['dia_semana', 'hora_inicio', 'hora_fin'], 'unico_bloque');

            // Índice para búsquedas por día
            $table->index('dia_semana');
        });

        // 2. Tabla: carga_docente
        // ========================
        // Asigna docentes a grupos
        // Ejemplo: "Dr. García enseña Cálculo I - Grupo A"
        Schema::create('carga_docente', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('docente_id')->comment('FK: Docente asignado');
            $table->uuid('grupo_id')->comment('FK: Grupo que enseña');
            $table->integer('horas_asignadas')->comment('Total de horas semanales asignadas');

            // Un docente no puede estar asignado dos veces al mismo grupo
            $table->unique(['docente_id', 'grupo_id'], 'unico_carga');

            // FKs
            $table->foreign('docente_id')
                ->references('id')->on('docente')
                ->onDelete('cascade');
            $table->foreign('grupo_id')
                ->references('id')->on('grupo')
                ->onDelete('cascade');
        });

        // 3. Tabla: horario_grupo
        // ========================
        // Define cuándo y dónde se imparte cada grupo
        // Ejemplo: "Cálculo I - Grupo A" se dicta los Lunes 8:00-9:30 en Aula 101
        Schema::create('horario_grupo', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grupo_id')->comment('FK: Grupo');
            $table->uuid('bloque_id')->comment('FK: Bloque horario (día + hora)');
            $table->uuid('aula_id')->comment('FK: Aula donde se imparte');
            $table->string('tipo', 20)->comment('Tipo de clase: teorica, practica, laboratorio');

            // FKs
            $table->foreign('grupo_id')
                ->references('id')->on('grupo')
                ->onDelete('cascade');
            $table->foreign('bloque_id')
                ->references('id')->on('bloque_horario')
                ->onDelete('cascade');
            $table->foreign('aula_id')
                ->references('id')->on('aula')
                ->onDelete('cascade');
            
            // Índices para búsquedas frecuentes
            $table->index('grupo_id');
            $table->index('bloque_id');
            $table->index('aula_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horario_grupo');
        Schema::dropIfExists('carga_docente');
        Schema::dropIfExists('bloque_horario');
    }
};
