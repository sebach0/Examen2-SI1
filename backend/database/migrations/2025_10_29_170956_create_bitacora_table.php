<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bitacora', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('usuario_id')->nullable();
            $table->string('accion', 100); // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.
            $table->text('descripcion')->nullable();
            $table->ipAddress('ip')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('metodo_http', 10)->nullable(); // GET, POST, PUT, DELETE
            $table->string('ruta', 255)->nullable(); // /api/auth/login
            $table->json('datos_request')->nullable(); // Datos enviados (sin passwords)
            $table->json('datos_response')->nullable(); // Respuesta del servidor
            $table->integer('codigo_http')->nullable(); // 200, 404, 500, etc.
            $table->timestamp('created_at')->useCurrent();

            // Índices para búsquedas rápidas
            $table->index('usuario_id');
            $table->index('accion');
            $table->index('created_at');
            $table->index(['usuario_id', 'accion']);

            // Nota: La foreign key se agregará después de que exista la tabla usuarios
            // Ver migración: 2025_10_29_add_bitacora_foreign_key.php
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bitacora');
    }
};
