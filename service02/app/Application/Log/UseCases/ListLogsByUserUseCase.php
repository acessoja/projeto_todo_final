<?php

namespace App\Application\Log\UseCases;

use App\Domain\Log\Contracts\LogRepositoryInterface;
use App\Domain\Log\Entities\LogEntry;

/**
 * Caso de Uso: Listar Logs por Usuário
 *
 * Filtra logs de um usuário específico.
 * Separado do ListLogsUseCase por clareza e para facilitar
 * adicionar regras específicas por usuário no futuro (ex: autorização).
 */
class ListLogsByUserUseCase
{
    public function __construct(
        private readonly LogRepositoryInterface $repository,
    ) {}

    /**
     * @return LogEntry[]
     */
    public function execute(int $usuarioId): array
    {
        return $this->repository->listarPorUsuario($usuarioId);
    }
}
