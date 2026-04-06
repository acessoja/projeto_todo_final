<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cria a tabela de logs do sistema.
     *
     * Campos:
     *  - id          → chave primária auto incremental
     *  - acao        → tipo do evento (CRIACAO_TAREFA, CONCLUSAO_TAREFA, ERRO, etc.)
     *  - detalhe     → descrição legível do que aconteceu
     *  - usuario_id  → usuário relacionado ao evento (nullable para erros de sistema)
     *  - timestamps  → created_at é usado como timestamp principal do log
     */
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->string('acao');
            $table->text('detalhe');
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->timestamps(); // created_at será o timestamp do log
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
