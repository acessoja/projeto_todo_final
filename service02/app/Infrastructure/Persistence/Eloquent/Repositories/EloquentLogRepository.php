<?php

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Log\Contracts\LogRepositoryInterface;
use App\Domain\Log\Entities\LogEntry;
use App\Infrastructure\Persistence\Eloquent\Models\Log;

/**
 * Repositório Eloquent: EloquentLogRepository
 *
 * Implementação concreta do LogRepositoryInterface usando Eloquent.
 * É a única camada que sabe que existe um banco de dados MySQL/SQLite/etc.
 *
 * Responsabilidade:
 *  - Converter LogEntry (domínio) ↔ Log (Eloquent model)
 *  - Executar as queries no banco
 *  - Retornar sempre entidades de domínio (LogEntry), nunca models brutos
 *
 * Trocar de ORM no futuro = criar outro repositório e trocar no ServiceProvider.
 * Nenhuma outra camada precisa mudar.
 */
class EloquentLogRepository implements LogRepositoryInterface
{
    /**
     * Persiste o log e retorna a entidade com id e timestamp preenchidos.
     */
    public function criar(LogEntry $log): LogEntry
    {
        $model = Log::create([
            'acao'       => $log->acao,
            'detalhe'    => $log->detalhe,
            'usuario_id' => $log->usuarioId,
        ]);

        return $this->toEntity($model);
    }

    /**
     * Lista logs com filtros opcionais.
     *
     * @param  array{acao?: string, usuarioId?: int, dataInicio?: string, dataFim?: string} $filtros
     * @return LogEntry[]
     */
    public function listar(array $filtros = []): array
    {
        $query = Log::query()->orderByDesc('created_at');

        if (! empty($filtros['acao'])) {
            $query->where('acao', $filtros['acao']);
        }

        if (! empty($filtros['usuarioId'])) {
            $query->where('usuario_id', (int) $filtros['usuarioId']);
        }

        if (! empty($filtros['dataInicio'])) {
            $query->whereDate('created_at', '>=', $filtros['dataInicio']);
        }

        if (! empty($filtros['dataFim'])) {
            $query->whereDate('created_at', '<=', $filtros['dataFim']);
        }

        return $query->get()
            ->map(fn (Log $model) => $this->toEntity($model))
            ->all();
    }

    /**
     * Lista todos os logs de um usuário específico.
     *
     * @return LogEntry[]
     */
    public function listarPorUsuario(int $usuarioId): array
    {
        return Log::where('usuario_id', $usuarioId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Log $model) => $this->toEntity($model))
            ->all();
    }

    // ─────────────────────────────────────────────────────────────────────
    // MAPEAMENTO PRIVADO: Model Eloquent → Entidade de Domínio
    // Mantido aqui para não vazar detalhes de infraestrutura para fora
    // ─────────────────────────────────────────────────────────────────────

    private function toEntity(Log $model): LogEntry
    {
        return new LogEntry(
            acao:      $model->acao,
            detalhe:   $model->detalhe,
            usuarioId: $model->usuario_id,
            id:        $model->id,
            timestamp: $model->created_at?->toIso8601String(),
        );
    }
}
