# Serviço 2 – Gerador de Logs

Serviço responsável por centralizar e registrar eventos do sistema de TODO List distribuído.

Desenvolvido em **Laravel** com **Eloquent ORM**, seguindo **Arquitetura Limpa** com código modularizado por camadas.

---

## Estrutura de Pastas

```
app/
├── Domain/
│   └── Log/
│       ├── Contracts/
│       │   └── LogRepositoryInterface.php   ← contrato do repositório
│       ├── DTOs/
│       │   └── CreateLogDTO.php             ← transferência de dados entre camadas
│       └── Entities/
│           └── LogEntry.php                 ← entidade de domínio (sem framework)
│
├── Application/
│   └── Log/
│       └── UseCases/
│           ├── CreateLogUseCase.php         ← orquestra a criação de log
│           ├── ListLogsUseCase.php          ← orquestra listagem com filtros
│           └── ListLogsByUserUseCase.php    ← orquestra listagem por usuário
│
├── Infrastructure/
│   └── Persistence/
│       └── Eloquent/
│           ├── Models/
│           │   └── Log.php                  ← model Eloquent (só persistência)
│           └── Repositories/
│               └── EloquentLogRepository.php ← implementação concreta do repositório
│
├── Http/
│   ├── Controllers/
│   │   └── LogController.php               ← recebe request, chama use case, retorna JSON
│   └── Requests/
│       └── CreateLogRequest.php            ← validação de entrada
│
└── Providers/
    └── LogServiceProvider.php              ← bind interface → implementação concreta

routes/
└── api.php                                 ← rotas da API

database/
└── migrations/
    └── 2026_03_29_000000_create_logs_table.php

docs/
└── integracao-servico1.js                  ← exemplo de integração com o Serviço 1
```

---

## Como rodar

### 1. Instalar dependências

```bash
composer install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
php artisan key:generate
```

Edite o `.env` com as configurações do banco de dados:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=service2_logs
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

### 3. Rodar a migration

```bash
php artisan migrate
```

### 4. Registrar o ServiceProvider

Em `bootstrap/providers.php` (Laravel 11+):

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\LogServiceProvider::class, // ← adicionar esta linha
];
```

Ou em `config/app.php` (Laravel 10):

```php
'providers' => [
    // ...
    App\Providers\LogServiceProvider::class,
],
```

### 5. Iniciar o servidor

```bash
php artisan serve --port=8001
```

---

## Rotas da API

| Método | Rota                        | Descrição                        |
|--------|-----------------------------|----------------------------------|
| POST   | `/api/logs`                 | Registra um novo evento de log   |
| GET    | `/api/logs`                 | Lista todos os logs (com filtros)|
| GET    | `/api/logs/usuario/{id}`    | Lista logs de um usuário         |

### Filtros disponíveis em `GET /api/logs`

```
GET /api/logs?acao=ERRO
GET /api/logs?usuarioId=1
GET /api/logs?dataInicio=2026-01-01&dataFim=2026-03-29
GET /api/logs?acao=CRIACAO_TAREFA&usuarioId=2
```

---

## Exemplos de Requisição

### POST /api/logs – Criação de tarefa

```json
{
  "acao": "CRIACAO_TAREFA",
  "detalhe": "Usuário 1 criou a tarefa 'Estudar Laravel'",
  "usuarioId": 1
}
```

Resposta `201`:

```json
{
  "id": 1,
  "acao": "CRIACAO_TAREFA",
  "detalhe": "Usuário 1 criou a tarefa 'Estudar Laravel'",
  "usuarioId": 1,
  "timestamp": "2026-03-29T16:00:00+00:00"
}
```

### POST /api/logs – Conclusão de tarefa

```json
{
  "acao": "CONCLUSAO_TAREFA",
  "detalhe": "Usuário 1 concluiu a tarefa 'Fazer trabalho de arquitetura'",
  "usuarioId": 1
}
```

### POST /api/logs – Erro do sistema

```json
{
  "acao": "ERRO",
  "detalhe": "Erro ao tentar concluir tarefa inexistente (id: 99)",
  "usuarioId": null
}
```

---

## Ações permitidas

| Valor              | Quando usar                                  |
|--------------------|----------------------------------------------|
| `CRIACAO_TAREFA`   | Toda vez que uma tarefa for criada           |
| `CONCLUSAO_TAREFA` | Toda vez que uma tarefa for concluída        |
| `ERRO`             | Erros relevantes do sistema                  |

---

## Integração com o Serviço 1

Veja o arquivo `docs/integracao-servico1.js` para o exemplo completo.

Em resumo, o Serviço 1 deve:
1. Criar um `logService.js` que abstrai as chamadas HTTP para este serviço
2. Chamar `logService.tarefaCriada()` após criar uma tarefa com sucesso
3. Chamar `logService.tarefaConcluida()` após concluir uma tarefa
4. Chamar `logService.erro()` em casos de erro relevante

Falhas na comunicação com o Serviço 2 **não devem derrubar** o Serviço 1 — o log é tratado como operação secundária.

---

## Arquitetura

```
HTTP Request
     │
     ▼
CreateLogRequest  ← valida os dados de entrada (422 se inválido)
     │
     ▼
LogController     ← recebe request, monta DTO, chama use case, retorna JSON
     │
     ▼
CreateLogDTO      ← transfere dados entre camadas de forma tipada
     │
     ▼
CreateLogUseCase  ← valida regras de domínio, orquestra operação
     │
     ▼
LogRepositoryInterface  ← contrato (interface pura do domínio)
     │
     ▼
EloquentLogRepository   ← implementação concreta (único ponto que conhece o banco)
     │
     ▼
Log (Model Eloquent)    ← representa a tabela `logs`
     │
     ▼
Banco de Dados (MySQL / SQLite)
```
