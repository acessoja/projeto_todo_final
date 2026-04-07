<?php

namespace App\Application\Log\UseCases;

use App\Domain\Log\Contracts\LogRepositoryInterface;
use App\Domain\Log\Entities\LogEntry;

/**
 * Caso de Uso: Listar Logs
 *
 * Recupera logs do repositório com filtros opcionais.
 * Não conhece nada de HTTP ou banco de dados — apenas orquestra.
 *
 * Filtros suportados:
 *  - acao       → filtra por tipo de evento
 *  - usuarioId  → filtra por usuário
 *  - dataInicio → data mínima (formato Y-m-d ou ISO)
 *  - dataFim    → data máxima (formato Y-m-d ou ISO)
 */
class ListLogsUseCase
{
    public function __construct(
        private readonly LogRepositoryInterface $repository,
    ) {}

    /**
     * @param  array{acao?: string, usuarioId?: int, dataInicio?: string, dataFim?: string} $filtros
     * @return LogEntry[]
     */
    public function execute(array $filtros = []): array
    {
        // Filtros são passados diretamente ao repositório.
        // Regras adicionais (ex: só admin pode filtrar por usuário) podem ser
        // adicionadas aqui no futuro sem tocar o repositório ou o controller.
        return $this->repository->listar($filtros);
    }
}
