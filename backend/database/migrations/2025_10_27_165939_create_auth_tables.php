<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Módulo de Autenticación
 * 
 * 📝 EXPLICACIÓN PARA APRENDER:
 * ============================
 * Las migraciones son como "versiones" de tu base de datos.
 * 
 * ¿Qué hace este archivo?
 * - Define las tablas: usuario, rol, permiso, usuario_rol, rol_permiso
 * - up(): Ejecuta cuando haces "php artisan migrate" (crea tablas)
 * - down(): Ejecuta cuando haces "php artisan migrate:rollback" (borra tablas)
 * 
 * Blueprint: Es como un "constructor" de tablas con métodos helper:
 * - $table->uuid('id'): Columna tipo UUID
 * - $table->string('nombre', 50): VARCHAR(50)
 * - $table->unique(['col1', 'col2']): Índice único compuesto
 * - $table->foreign('user_id'): Clave foránea (FK)
 * 
 * ¿Por qué el orden importa?
 * - Debes crear tablas PADRE antes que tablas HIJO
 * - Ejemplo: "usuario" antes que "usuario_rol" (porque tiene FK a usuario)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Orden de creación:
     * 1. usuario (tabla independiente)
     * 2. rol (tabla independiente)
     * 3. permiso (tabla independiente)
     * 4. usuario_rol (pivote, depende de usuario + rol)
     * 5. rol_permiso (pivote, depende de rol + permiso)
     */
    public function up(): void
    {
        // 1. Tabla: usuario
        // ==================
        // Almacena todos los usuarios del sistema (admins, docentes, coordinadores)
        Schema::create('usuario', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username', 50)->unique()->comment('Nombre de usuario único');
            $table->string('email', 120)->unique()->comment('Correo electrónico único');
            $table->string('password_hash', 255)->comment('Hash bcrypt del password');
            $table->enum('estado', ['activo', 'suspendido'])->default('activo')->comment('Estado de la cuenta');
            $table->timestampTz('creado_en')->useCurrent()->comment('Fecha de creación con timezone');
            $table->timestampTz('actualizado_en')->useCurrent()->comment('Última actualización');
        });

        // 2. Tabla: rol
        // =============
        // Define roles del sistema (admin, docente, coordinador)
        Schema::create('rol', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nombre', 40)->unique()->comment('Nombre del rol: admin, docente, etc.');
            $table->string('descripcion', 200)->nullable()->comment('Descripción del rol');
        });

        // 3. Tabla: permiso
        // =================
        // Define permisos granulares (academico.materias.crear, asistencia.marcar, etc.)
        Schema::create('permiso', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('codigo', 80)->unique()->comment('Código único del permiso (ej: academico.materias.crear)');
            $table->string('descripcion', 200)->nullable()->comment('Descripción del permiso');
        });

        // 4. Tabla pivote: usuario_rol
        // =============================
        // Relación many-to-many entre usuario y rol
        // Un usuario puede tener múltiples roles (ej: admin + docente)
        Schema::create('usuario_rol', function (Blueprint $table) {
            $table->uuid('usuario_id')->comment('FK: ID del usuario');
            $table->uuid('rol_id')->comment('FK: ID del rol');

            // Clave primaria compuesta
            $table->primary(['usuario_id', 'rol_id']);

            // Claves foráneas con CASCADE DELETE
            // Si borras un usuario → borra automáticamente sus relaciones en usuario_rol
            $table->foreign('usuario_id')
                ->references('id')->on('usuario')
                ->onDelete('cascade');

            $table->foreign('rol_id')
                ->references('id')->on('rol')
                ->onDelete('cascade');
        });

        // 5. Tabla pivote: rol_permiso
        // =============================
        // Relación many-to-many entre rol y permiso
        // Un rol puede tener muchos permisos
        Schema::create('rol_permiso', function (Blueprint $table) {
            $table->uuid('rol_id')->comment('FK: ID del rol');
            $table->uuid('permiso_id')->comment('FK: ID del permiso');

            // Clave primaria compuesta
            $table->primary(['rol_id', 'permiso_id']);

            // Claves foráneas
            $table->foreign('rol_id')
                ->references('id')->on('rol')
                ->onDelete('cascade');

            $table->foreign('permiso_id')
                ->references('id')->on('permiso')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Orden de eliminación (INVERSO al de creación):
     * 1. Primero las tablas con FKs (pivotes)
     * 2. Luego las tablas independientes
     */
    public function down(): void
    {
        Schema::dropIfExists('rol_permiso');
        Schema::dropIfExists('usuario_rol');
        Schema::dropIfExists('permiso');
        Schema::dropIfExists('rol');
        Schema::dropIfExists('usuario');
    }
};
