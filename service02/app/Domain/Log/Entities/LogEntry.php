<?php

namespace App\Domain\Log\Entities;

/**
 * Entidade de domínio: LogEntry
 *
 * Representa um evento de log com suas regras de negócio.
 * Não depende de framework, ORM nem infraestrutura.
 *
 * É a representação pura do conceito de "log" no domínio da aplicação.
 */
class LogEntry
{
    public function __construct(
        public readonly string $acao,
        public readonly string $detalhe,
        public readonly ?int   $usuarioId,
        public readonly ?int   $id        = null,
        public readonly ?string $timestamp = null,
    ) {}

    /**
     * Valida se a ação é um dos tipos permitidos no domínio.
     * Novos tipos podem ser adicionados aqui sem alterar outros arquivos.
     */
    public static function acoesPermitidas(): array
    {
        return [
            'CRIACAO_TAREFA',
            'CONCLUSAO_TAREFA',
            'ERRO',
        ];
    }

    public function acaoEhValida(): bool
    {
        return in_array($this->acao, self::acoesPermitidas(), true);
    }

    /**
     * Serialização padrão da entidade para resposta JSON.
     */
    public function toArray(): array
    {
        return [
            'id'        => $this->id,
            'acao'      => $this->acao,
            'detalhe'   => $this->detalhe,
            'usuarioId' => $this->usuarioId,
            'timestamp' => $this->timestamp,
        ];
    }
}
