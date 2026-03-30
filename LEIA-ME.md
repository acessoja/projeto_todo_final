# TODO List Distribuído — Guia Completo de Execução

## Visão Geral da Arquitetura

```
Frontend (index.html — abrir com Live Server ou qualquer HTTP)
   │
   ├── POST/GET/PATCH/DELETE → Serviço 1 → http://localhost:3001
   │                               │
   │                               ├── Notifica → Serviço 2 → http://localhost:8001
   │                               │              (fire-and-forget, não bloqueia)
   │                               │
   │                               └── Lê/Escreve → prisma/dev.db (SQLite)
   │                                                        │
   └── GET /analytics/:id → Serviço 3 → http://localhost:8000
                            (lê o mesmo dev.db, somente leitura)
```

## Portas

| Serviço | Tecnologia | Porta |
|---|---|---|
| Serviço 1 | Node.js + Express + Prisma (SQLite) | **3001** |
| Serviço 2 | PHP + Laravel + Eloquent (MySQL) | **8001** |
| Serviço 3 | Python + FastAPI + SQLAlchemy (SQLite) | **8000** |

---

## Pré-requisitos

- **Node.js** 18+ e npm
- **PHP** 8.2+, **Composer** e extensões: pdo_mysql, mbstring, openssl
- **Python** 3.11+ e pip
- **MySQL** rodando localmente (para o Serviço 2)

---

## Passo a Passo

### ① Serviço 1 — API de Tarefas (Node.js + Prisma)

> **Inicie PRIMEIRO** — ele cria o banco SQLite usado pelo Serviço 3.

```bash
cd service1

# 1. Instalar dependências
npm install

# 2. Verificar o .env (já configurado):
#    DATABASE_URL="file:./prisma/dev.db"
#    PORT=3001
#    SERVICE2_URL=http://localhost:8001

# 3. Gerar o Prisma Client
npx prisma generate

# 4. Criar o banco e as tabelas
npx prisma migrate dev --name init

# 5. (Opcional) Popular com dados de exemplo
node prisma/seed.js

# 6. Iniciar o servidor
npm run dev
```

✅ **Verificação:** Abra http://localhost:3001/health — deve retornar `{"status":"ok",...}`

---

### ② Serviço 2 — Gerador de Logs (Laravel + Eloquent)

> Requer MySQL. O Serviço 1 não trava se o Serviço 2 estiver offline.

```bash
cd service2

# 1. Instalar dependências PHP
composer install

# 2. Configurar o .env
#    O arquivo .env já está incluído — edite a senha do MySQL:
#    DB_PASSWORD=sua_senha_aqui

# 3. Gerar a chave da aplicação
php artisan key:generate

# 4. Criar o banco (se não existir)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS service2_logs CHARACTER SET utf8mb4;"

# 5. Rodar as migrações
php artisan migrate

# 6. Registrar o ServiceProvider
#    Em bootstrap/providers.php (Laravel 11) adicione:
#    App\Providers\LogServiceProvider::class,

# 7. Iniciar o servidor
php artisan serve --port=8001
```

✅ **Verificação:**
```bash
curl -X POST http://localhost:8001/api/logs \
  -H "Content-Type: application/json" \
  -d '{"acao":"ERRO","detalhe":"teste de conexao","usuarioId":null}'
# Esperado: {"id":1,"acao":"ERRO",...}
```

---

### ③ Serviço 3 — Analisador de Tarefas (FastAPI + SQLAlchemy)

> Lê o mesmo arquivo `dev.db` do Serviço 1. Configure o caminho corretamente.

```bash
cd service3

# 1. Criar ambiente virtual
python -m venv venv

# 2. Ativar o ambiente
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar o .env — aponte para o dev.db do Serviço 1:

# Linux/Mac (exemplo):
echo "DATABASE_URL=sqlite:////caminho/completo/para/service1/prisma/dev.db" > .env

# Windows (exemplo):
# echo DATABASE_URL=sqlite:///C:\projetos\service1\prisma\dev.db > .env

# DICA: use caminho absoluto para evitar erros de path relativo

# 5. Iniciar o servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

✅ **Verificação:** Abra http://localhost:8000/health — deve retornar `{"status":"healthy"}`
✅ **Docs interativos:** http://localhost:8000/docs

---

### ④ Frontend

Abra o arquivo `frontend/index.html` com um servidor HTTP local:

**Opção A — VS Code Live Server:**
- Instale a extensão "Live Server"
- Clique com botão direito no `index.html` → "Open with Live Server"
- Abre em http://localhost:5500

**Opção B — Python:**
```bash
cd frontend
python -m http.server 5500
# Abrir: http://localhost:5500
```

**Opção C — Node.js:**
```bash
npx serve frontend -p 5500
```

---

## Testes de Integração (passo a passo)

Execute os comandos abaixo em ordem para validar que todos os serviços estão comunicando:

```bash
# ── Passo 1: Criar um usuário ────────────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@test.com","senha":"123456"}' | python -m json.tool

# Esperado:
# { "id": 1, "nome": "João Silva", "email": "joao@test.com" }

# ── Passo 2: Criar uma tarefa (dispara log no Serviço 2) ─────────────────────
curl -s -X POST http://localhost:3001/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Estudar arquitetura distribuída","usuarioId":1}' | python -m json.tool

# Esperado:
# { "id": 1, "titulo": "Estudar arquitetura distribuída", "concluida": false, "usuarioId": 1 }

# ── Passo 3: Verificar log no Serviço 2 ──────────────────────────────────────
curl -s http://localhost:8001/api/logs | python -m json.tool

# Esperado: array com 1 log de CRIACAO_TAREFA

# ── Passo 4: Listar tarefas do usuário ───────────────────────────────────────
curl -s http://localhost:3001/api/tarefas/usuario/1 | python -m json.tool

# ── Passo 5: Verificar estatísticas no Serviço 3 ─────────────────────────────
curl -s http://localhost:8000/analytics/1 | python -m json.tool

# Esperado:
# { "usuarioId": 1, "total": 1, "concluidas": 0, "pendentes": 1 }

# ── Passo 6: Concluir a tarefa ────────────────────────────────────────────────
curl -s -X PATCH http://localhost:3001/api/tarefas/1/concluir | python -m json.tool

# Esperado: { "id": 1, "concluida": true, ... }

# ── Passo 7: Verificar logs após conclusão ────────────────────────────────────
curl -s http://localhost:8001/api/logs | python -m json.tool

# Esperado: 2 logs — CRIACAO_TAREFA e CONCLUSAO_TAREFA

# ── Passo 8: Verificar estatísticas atualizadas ───────────────────────────────
curl -s http://localhost:8000/analytics/1 | python -m json.tool

# Esperado:
# { "usuarioId": 1, "total": 1, "concluidas": 1, "pendentes": 0 }

# ── Passo 9: Deletar a tarefa ─────────────────────────────────────────────────
curl -s -X DELETE http://localhost:3001/api/tarefas/1
# Esperado: HTTP 204 (sem body)

# ── Passo 10: Ver logs por usuário ────────────────────────────────────────────
curl -s http://localhost:8001/api/logs/usuario/1 | python -m json.tool
```

---

## Rotas finais de cada serviço

### Serviço 1 — http://localhost:3001
| Método | Rota | Descrição |
|---|---|---|
| GET | /health | Health check |
| POST | /api/usuarios | Criar usuário |
| GET | /api/usuarios | Listar usuários |
| GET | /api/usuarios/:id | Buscar usuário |
| POST | /api/tarefas | Criar tarefa |
| GET | /api/tarefas/usuario/:id | Listar tarefas do usuário |
| PATCH | /api/tarefas/:id/concluir | Concluir tarefa |
| DELETE | /api/tarefas/:id | Excluir tarefa |
| GET | /api/tarefas/usuario/:id/stats | Stats internos |

### Serviço 2 — http://localhost:8001
| Método | Rota | Descrição |
|---|---|---|
| POST | /api/logs | Registrar log |
| GET | /api/logs | Listar todos os logs |
| GET | /api/logs/usuario/:id | Logs por usuário |

### Serviço 3 — http://localhost:8000
| Método | Rota | Descrição |
|---|---|---|
| GET | /health | Health check |
| GET | /analytics/:user_id | Estatísticas do usuário |
| GET | /docs | Documentação interativa (Swagger) |

---

## Problemas comuns

| Problema | Solução |
|---|---|
| Serviço 1 não inicia | Rode `npx prisma generate` antes de `npm run dev` |
| Erro "Table not found" no Serviço 3 | Verifique se o `DATABASE_URL` aponta para o `dev.db` correto do Serviço 1 |
| Logs não chegam no Serviço 2 | O Serviço 1 continua funcionando mesmo sem o Serviço 2. Verifique se o Serviço 2 está rodando na porta 8001 e se `SERVICE2_URL` está correto no `.env` do Serviço 1 |
| CORS no frontend | O Serviço 1 já tem CORS `*` habilitado. Se houver erro, verifique se o servidor está na porta 3001 |
| MySQL recusando conexão | Verifique se o MySQL está rodando e se `DB_PASSWORD` no `.env` do Serviço 2 está correto |
