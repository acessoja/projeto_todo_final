<?php

namespace App\Application\Log\UseCases;

use App\Domain\Log\Contracts\LogRepositoryInterface;
use App\Domain\Log\DTOs\CreateLogDTO;
use App\Domain\Log\Entities\LogEntry;
use InvalidArgumentException;

/**
 * Caso de Uso: Criar Log
 *
 * Contém TODA a lógica de orquestração para registrar um evento de log.
 * Não conhece o framework, nem HTTP, nem banco de dados diretamente.
 *
 * Responsabilidades:
 *  - Validar regras de domínio (ação permitida)
 *  - Construir a entidade LogEntry
 *  - Delegar a persistência ao repositório
 *  - Retornar a entidade persistida
 */
class CreateLogUseCase
{
    public function __construct(
        private readonly LogRepositoryInterface $repository,
    ) {}

    /**
     * Executa o caso de uso.
     *
     * @throws InvalidArgumentException se a ação não for um tipo conhecido
     */
    public function execute(CreateLogDTO $dto): LogEntry
    {
        // ── Regra de domínio: só acões conhecidas são aceitas ──────────────
        $entry = new LogEntry(
            acao:      $dto->acao,
            detalhe:   $dto->detalhe,
            usuarioId: $dto->usuarioId,
        );

        if (! $entry->acaoEhValida()) {
            throw new InvalidArgumentException(
                sprintf(
                    'Ação "%s" não é válida. Ações permitidas: %s',
                    $dto->acao,
                    implode(', ', LogEntry::acoesPermitidas()),
                )
            );
        }
        // ───────────────────────────────────────────────────────────────────

        return $this->repository->criar($entry);
    }
}
