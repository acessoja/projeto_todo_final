<?php

use App\Http\Controllers\LogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes – Serviço 2: Gerador de Logs
|--------------------------------------------------------------------------
|
| Todas as rotas têm prefixo /api (definido no bootstrap/app.php ou RouteServiceProvider).
|
| Rotas disponíveis:
|
|  POST   /api/logs               → Registra um novo evento de log
|  GET    /api/logs               → Lista logs (suporta filtros via query params)
|  GET    /api/logs/usuario/{id}  → Lista logs de um usuário específico
|
| Filtros suportados em GET /api/logs:
|  ?acao=ERRO
|  ?usuarioId=1
|  ?dataInicio=2026-01-01
|  ?dataFim=2026-03-29
|
*/

Route::prefix('logs')->group(function () {
    // Registrar novo log (chamado pelo Serviço 1)
    Route::post('/', [LogController::class, 'store']);

    // Listar todos os logs com filtros opcionais
    Route::get('/', [LogController::class, 'index']);

    // Listar logs por usuário — rota específica ANTES do {id} genérico
    Route::get('/usuario/{usuarioId}', [LogController::class, 'indexByUser'])
        ->whereNumber('usuarioId');
});
