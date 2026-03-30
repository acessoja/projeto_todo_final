// src/routes/tarefasRoutes.js
// Rotas do recurso Tarefa
//
// FUTURO: Adicionar middleware de autenticação JWT em todas as rotas
// Exemplo: router.use(authMiddleware)  ← será importado do Serviço de Auth

import { Router } from "express";
import {
  criarTarefa,
  listarTarefasPorUsuario,
  concluirTarefa,
  deletarTarefa,
  estatisticasPorUsuario,
} from "../controllers/tarefasController.js";
import {
  validarCriarTarefa,
  validarIdTarefa,
  validarIdUsuario,
} from "../middleware/validate.js";

const router = Router();

// POST /api/tarefas → Criar tarefa
router.post("/", validarCriarTarefa, criarTarefa);

// GET /api/tarefas/usuario/:id → Listar tarefas por usuário
// IMPORTANTE: rota específica ANTES de /:id para evitar conflito de parâmetros
router.get("/usuario/:id", validarIdUsuario, listarTarefasPorUsuario);

// GET /api/tarefas/usuario/:id/stats → Estatísticas do usuário (para Serviço de Stats futuro)
router.get("/usuario/:id/stats", validarIdUsuario, estatisticasPorUsuario);

// PATCH /api/tarefas/:id/concluir → Marcar como concluída
router.patch("/:id/concluir", validarIdTarefa, concluirTarefa);

// DELETE /api/tarefas/:id → Excluir tarefa
router.delete("/:id", validarIdTarefa, deletarTarefa);

export default router;
