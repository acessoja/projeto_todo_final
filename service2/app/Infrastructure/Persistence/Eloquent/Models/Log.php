<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model Eloquent: Log
 *
 * Representa a tabela `logs` no banco de dados.
 * Responsável APENAS pela persistência — sem lógica de negócio.
 *
 * O campo `created_at` é utilizado como timestamp principal do log.
 */
class Log extends Model
{
    protected $table = 'logs';

    /**
     * Campos permitidos para mass assignment.
     * Nunca colocar 'id' aqui — é gerado pelo banco.
     */
    protected $fillable = [
        'acao',
        'detalhe',
        'usuario_id',
    ];

    /**
     * Casting de tipos para evitar strings onde se espera inteiro.
     */
    protected $casts = [
        'usuario_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
