<?php

namespace App\Providers;

use App\Domain\Log\Contracts\LogRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Repositories\EloquentLogRepository;
use Illuminate\Support\ServiceProvider;

/**
 * LogServiceProvider
 *
 * Responsável por fazer o bind da interface de domínio
 * com a implementação concreta de infraestrutura.
 *
 * É aqui que o Laravel "aprende" que quando alguém pedir
 * LogRepositoryInterface, deve receber EloquentLogRepository.
 *
 * Para trocar a implementação (ex: Redis, MongoDB, API externa),
 * basta alterar o bind aqui — nenhuma outra classe muda.
 *
 * Lembrete: registrar este provider em config/app.php ou bootstrap/providers.php
 */
class LogServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            LogRepositoryInterface::class,
            EloquentLogRepository::class,
        );
    }

    public function boot(): void
    {
        //
    }
}
