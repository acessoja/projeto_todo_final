<?php

namespace App\Domain\Log\DTOs;

/**
 * Data Transfer Object: CreateLogDTO
 *
 * Transporta os dados de entrada para criar um log entre as camadas.
 * Não tem comportamento — só carrega dados de forma tipada e imutável.
 *
 * Separa a representação de entrada (request HTTP) da entidade de domínio.
 */
readonly class CreateLogDTO
{
    public function __construct(
        public string $acao,
        public string $detalhe,
        public ?int   $usuarioId,
    ) {}

    /**
     * Constrói o DTO a partir de um array (útil para criar a partir do request validado).
     */
    public static function fromArray(array $dados): self
    {
        return new self(
            acao:      $dados['acao'],
            detalhe:   $dados['detalhe'],
            usuarioId: $dados['usuarioId'] ?? null,
        );
    }
}
