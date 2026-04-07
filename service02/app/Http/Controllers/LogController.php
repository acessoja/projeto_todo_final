<?php

namespace App\Http\Controllers;

use App\Application\Log\UseCases\CreateLogUseCase;
use App\Application\Log\UseCases\ListLogsByUserUseCase;
use App\Application\Log\UseCases\ListLogsUseCase;
use App\Domain\Log\DTOs\CreateLogDTO;
use App\Http\Requests\CreateLogRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Throwable;

/**
 * Controller: LogController
 *
 * Responsabilidade ÚNICA: receber requisições HTTP, delegar aos casos de uso
 * e formatar respostas JSON.
 *
 * NÃO contém:
 *  - Lógica de negócio
 *  - Acesso direto ao banco
 *  - Validação de regras de domínio
 *
 * Cada método é um ponto de entrada HTTP com mínimo de lógica possível.
 */
class LogController extends Controller
{
    public function __construct(
        private readonly CreateLogUseCase      $createLog,
        private readonly ListLogsUseCase       $listLogs,
        private readonly ListLogsByUserUseCase $listLogsByUser,
    ) {}

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/logs
    // Recebe evento e registra no banco
    // ─────────────────────────────────────────────────────────────────────

    public function store(CreateLogRequest $request): JsonResponse
    {
        try {
            $dto = CreateLogDTO::fromArray($request->validated());
            $log = $this->createLog->execute($dto);

            return response()->json($log->toArray(), 201);

        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Erro interno ao registrar log.',
                'erro'    => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/logs
    // Lista todos os logs (com filtros opcionais via query params)
    //
    // Query params suportados:
    //  ?acao=ERRO
    //  ?usuarioId=1
    //  ?dataInicio=2026-01-01
    //  ?dataFim=2026-03-29
    // ─────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $filtros = array_filter([
            'acao'       => $request->query('acao'),
            'usuarioId'  => $request->query('usuarioId'),
            'dataInicio' => $request->query('dataInicio'),
            'dataFim'    => $request->query('dataFim'),
        ]);

        $logs = $this->listLogs->execute($filtros);

        return response()->json(
            array_map(fn ($log) => $log->toArray(), $logs)
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/logs/usuario/{id}
    // Lista todos os logs de um usuário específico
    // ─────────────────────────────────────────────────────────────────────

    public function indexByUser(int $usuarioId): JsonResponse
    {
        $logs = $this->listLogsByUser->execute($usuarioId);

        return response()->json(
            array_map(fn ($log) => $log->toArray(), $logs)
        );
    }
}
