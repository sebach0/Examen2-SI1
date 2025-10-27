<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Módulo de Infraestructura
 * 
 * 📝 EXPLICACIÓN:
 * ===============
 * Este módulo maneja la infraestructura física de la universidad:
 * - Edificios (Edificio A, Edificio Tecnológico, etc.)
 * - Aulas (salones donde se imparten clases)
 * 
 * Relación: Edificio → tiene muchas Aulas (one-to-many)
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla: edificio
        // ===================
        // Edificios de la universidad
        Schema::create('edificio', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nombre', 100)->unique()->comment('Nombre del edificio: Edificio A, Torre Este, etc.');
        });

        // 2. Tabla: aula
        // ===============
        // Salones/laboratorios dentro de cada edificio
        Schema::create('aula', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('edificio_id')->comment('FK: Edificio al que pertenece');
            $table->string('codigo', 20)->comment('Código del aula: 101, 202, LAB-A');
            $table->string('nombre', 80)->comment('Nombre descriptivo: Aula 101, Laboratorio de Física');
            $table->string('tipo', 30)->comment('Tipo: aula, laboratorio, auditorio, sala de cómputo');
            $table->integer('capacidad')->comment('Número máximo de personas');

            // Un aula es única por edificio + código
            // Ejemplo: Puede haber "101" en Edificio A y "101" en Edificio B
            $table->unique(['edificio_id', 'codigo'], 'unico_aula');

            // FK
            $table->foreign('edificio_id')
                ->references('id')->on('edificio')
                ->onDelete('cascade');
            
            // Índice para búsquedas por tipo
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aula');
        Schema::dropIfExists('edificio');
    }
};
