<?php

namespace App\Domain\Log\Contracts;

use App\Domain\Log\Entities\LogEntry;

/**
 * Contrato (interface) do repositório de logs.
 *
 * Define APENAS o que o domínio precisa.
 * Nenhuma implementação de banco aqui — só assinaturas.
 *
 * A implementação concreta fica na camada de infraestrutura.
 * Isso permite trocar MySQL por PostgreSQL, MongoDB, etc.,
 * sem tocar em nada acima dessa interface.
 */
interface LogRepositoryInterface
{
    /**
     * Persiste um novo log e retorna a entidade com id e timestamp preenchidos.
     */
    public function criar(LogEntry $log): LogEntry;

    /**
     * Retorna todos os logs, com filtros opcionais.
     *
     * @param  array{acao?: string, usuarioId?: int, dataInicio?: string, dataFim?: string} $filtros
     * @return LogEntry[]
     */
    public function listar(array $filtros = []): array;

    /**
     * Retorna todos os logs de um usuário específico.
     *
     * @return LogEntry[]
     */
    public function listarPorUsuario(int $usuarioId): array;
}
