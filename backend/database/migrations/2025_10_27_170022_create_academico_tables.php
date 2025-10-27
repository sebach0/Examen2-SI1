<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Módulo Académico
 * 
 * 📝 EXPLICACIÓN:
 * ===============
 * Este módulo maneja todo lo relacionado con la gestión académica:
 * - Gestiones (periodos académicos: 2024-1, 2024-2, etc.)
 * - Carreras (Ingeniería de Sistemas, Medicina, etc.)
 * - Materias (Cálculo I, Física II, etc.)
 * - Grupos (paralelos de una materia en una gestión)
 * - Docentes (profesores con sus datos)
 * - Perfiles de Gestión (qué rol tiene un usuario en una gestión específica)
 * 
 * Relaciones clave:
 * - Materia → pertenece a Carrera
 * - Grupo → pertenece a Materia + Gestión
 * - Docente → es un Usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: gestion
        // ==================
        // Representa periodos académicos (semestres/años)
        Schema::create('gestion', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('anio')->comment('Año académico: 2024, 2025, etc.');
            $table->string('periodo', 20)->comment('Periodo: Primer Semestre, Segundo Semestre, Anual');
            $table->date('fecha_inicio')->comment('Fecha de inicio del periodo');
            $table->date('fecha_fin')->comment('Fecha de fin del periodo');
            $table->string('codigo', 20)->unique()->comment('Código único: 2024-1, 2024-2, 2024-A');
            
            // Índice para búsquedas por año + periodo
            $table->index(['anio', 'periodo']);
        });

        // 2. Tabla: docente
        // ==================
        // Información adicional de usuarios que son docentes
        Schema::create('docente', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('usuario_id')->unique()->comment('FK: Usuario asociado (one-to-one)');
            $table->string('ci', 20)->unique()->comment('Cédula de identidad única');
            $table->string('nombre', 100)->comment('Nombre completo del docente');
            $table->string('telefono', 30)->nullable()->comment('Teléfono de contacto');

            // FK a usuario
            $table->foreign('usuario_id')
                ->references('id')->on('usuario')
                ->onDelete('cascade');
        });

        // 3. Tabla: perfil_gestion
        // =========================
        // Define qué rol tiene un usuario en una gestión específica
        // Ejemplo: Juan es "coordinador" en 2024-1, pero "docente" en 2024-2
        Schema::create('perfil_gestion', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('gestion_id')->comment('FK: Gestión académica');
            $table->uuid('usuario_id')->comment('FK: Usuario');
            $table->uuid('rol_id')->comment('FK: Rol en esta gestión');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestampTz('creado_en')->useCurrent();

            // Un usuario no puede tener el mismo rol duplicado en una gestión
            $table->unique(['gestion_id', 'usuario_id', 'rol_id'], 'unico_perfil');

            // FKs
            $table->foreign('gestion_id')
                ->references('id')->on('gestion')
                ->onDelete('cascade');
            $table->foreign('usuario_id')
                ->references('id')->on('usuario')
                ->onDelete('cascade');
            $table->foreign('rol_id')
                ->references('id')->on('rol')
                ->onDelete('cascade');
        });

        // 4. Tabla: carrera
        // ==================
        // Carreras ofrecidas por la universidad
        Schema::create('carrera', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nombre', 120)->unique()->comment('Nombre de la carrera');
            $table->string('codigo', 20)->unique()->comment('Código único: ING-SIS, MED, etc.');
        });

        // 5. Tabla: materia
        // ==================
        // Materias/asignaturas de cada carrera
        Schema::create('materia', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('carrera_id')->comment('FK: Carrera a la que pertenece');
            $table->string('codigo', 20)->unique()->comment('Código único: MAT-101, FIS-202');
            $table->string('nombre', 120)->comment('Nombre de la materia');
            $table->integer('horas_semanales')->comment('Horas de clase por semana');
            $table->integer('creditos')->comment('Créditos académicos');

            // FK
            $table->foreign('carrera_id')
                ->references('id')->on('carrera')
                ->onDelete('cascade');
        });

        // 6. Tabla: materia_requisito
        // ============================
        // Define pre-requisitos entre materias
        // Ejemplo: Para cursar "Cálculo II" necesitas haber aprobado "Cálculo I"
        Schema::create('materia_requisito', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('materia_id')->comment('FK: Materia que tiene requisitos');
            $table->uuid('requisito_id')->comment('FK: Materia requerida (pre-requisito)');

            // Una materia no puede tener el mismo requisito duplicado
            $table->unique(['materia_id', 'requisito_id'], 'unico_requisito');

            // FKs
            $table->foreign('materia_id')
                ->references('id')->on('materia')
                ->onDelete('cascade');
            $table->foreign('requisito_id')
                ->references('id')->on('materia')
                ->onDelete('cascade');
        });

        // 7. Tabla: grupo
        // ================
        // Paralelos de una materia en una gestión específica
        // Ejemplo: "Cálculo I" en "2024-1" tiene grupos: A, B, C
        Schema::create('grupo', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('materia_id')->comment('FK: Materia');
            $table->uuid('gestion_id')->comment('FK: Gestión académica');
            $table->string('codigo', 20)->comment('Código del grupo: A, B, LAB-1, etc.');
            $table->integer('capacidad')->comment('Número máximo de estudiantes');

            // Un grupo es único por materia + gestión + código
            // Ejemplo: No puede haber dos "Grupo A" de "Cálculo I" en "2024-1"
            $table->unique(['materia_id', 'gestion_id', 'codigo'], 'unico_grupo');

            // FKs
            $table->foreign('materia_id')
                ->references('id')->on('materia')
                ->onDelete('cascade');
            $table->foreign('gestion_id')
                ->references('id')->on('gestion')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Orden inverso de creación
        Schema::dropIfExists('grupo');
        Schema::dropIfExists('materia_requisito');
        Schema::dropIfExists('materia');
        Schema::dropIfExists('carrera');
        Schema::dropIfExists('perfil_gestion');
        Schema::dropIfExists('docente');
        Schema::dropIfExists('gestion');
    }
};
