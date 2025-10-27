<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Módulo de Importación
 * 
 * 📝 EXPLICACIÓN:
 * ===============
 * Este módulo gestiona la importación masiva de datos desde archivos Excel/CSV.
 * 
 * Casos de uso:
 * - Importar 500 estudiantes desde Excel
 * - Importar lista de materias desde CSV
 * - Importar horarios desde plantilla
 * 
 * ¿Por qué una tabla para esto?
 * - Trazabilidad: Saber quién importó qué y cuándo
 * - Debugging: Si falla, ver qué registros procesó
 * - UI: Mostrar progreso en tiempo real (procesados/total)
 * - Auditoría: Historial de importaciones
 * 
 * Estados:
 * - pending: En cola, aún no procesado
 * - processing: Se está ejecutando ahora
 * - completed: Terminó exitosamente
 * - failed: Falló por algún error
 * - partial: Completó algunos, otros fallaron
 */
return new class extends Migration
{
    public function up(): void
    {
        // Tabla: import_job
        // ==================
        // Registro de trabajos de importación
        Schema::create('import_job', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('tipo', 40)
                ->comment('Tipo de importación: usuarios, materias, horarios, etc.');
            $table->enum('estado', ['pending', 'processing', 'completed', 'failed', 'partial'])
                ->default('pending')
                ->comment('Estado actual del job');
            $table->string('file_path', 255)
                ->comment('Ruta del archivo importado');
            $table->integer('total')->default(0)
                ->comment('Total de registros en el archivo');
            $table->integer('procesados')->default(0)
                ->comment('Registros procesados exitosamente');
            $table->integer('errores')->default(0)
                ->comment('Registros que fallaron');
            $table->timestampTz('creado_en')->useCurrent()
                ->comment('Cuándo se creó el job');
            $table->text('detalle_error')->nullable()
                ->comment('JSON con detalles de errores por fila');

            // Índices para reportes y dashboard
            $table->index('tipo');
            $table->index('estado');
            $table->index('creado_en');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_job');
    }
};
