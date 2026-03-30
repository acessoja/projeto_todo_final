// src/controllers/tarefasController.js
// Controller de Tarefas — versão integrada com Serviço 2 (Logs) e Serviço 3 (Stats)
//
// MUDANÇAS EM RELAÇÃO AO ORIGINAL:
//   - Import e uso real do logService (antes estava comentado)
//   - Todos os IDs normalizados para Number antes de ir ao Prisma
//   - concluirTarefa agora busca usuario para passar ao log
//   - deletarTarefa registra log de erro quando não encontrado

import prisma from "../prismaClient.js";
import { createError } from "../middleware/errorHandler.js";
import { logService } from "../services/logService.js";

/**
 * POST /api/tarefas
 * Body: { titulo: string, usuarioId: number }
 */
export async function criarTarefa(req, res, next) {
  try {
    const { titulo, usuarioId } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: Number(usuarioId) },
      select: { id: true },
    });

    if (!usuarioExiste) {
      await logService.erro(
        `Tentativa de criar tarefa para usuário inexistente (id: ${usuarioId})`,
        null
      );
      throw createError(404, `Usuário com id ${usuarioId} não encontrado.`);
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        usuarioId: Number(usuarioId),
      },
    });

    // Notifica Serviço 2 — sem bloquear a resposta
    await logService.tarefaCriada(usuarioId, titulo);

    return res.status(201).json(tarefa);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tarefas/usuario/:id
 * Lista tarefas de um usuário (filtradas por usuarioId — nunca mistura usuários)
 */
export async function listarTarefasPorUsuario(req, res, next) {
  try {
    const usuarioId = Number(req.params.id);

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });

    if (!usuarioExiste) {
      throw createError(404, `Usuário com id ${usuarioId} não encontrado.`);
    }

    const tarefas = await prisma.tarefa.findMany({
      where: { usuarioId },
      orderBy: [
        { concluida: "asc" },  // pendentes primeiro
        { id: "desc" },
      ],
    });

    return res.status(200).json(tarefas);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tarefas/:id/concluir
 * Marca como concluída e notifica Serviço 2
 */
export async function concluirTarefa(req, res, next) {
  try {
    const tarefaId = Number(req.params.id);

    const tarefaExiste = await prisma.tarefa.findUnique({
      where: { id: tarefaId },
    });

    if (!tarefaExiste) {
      await logService.erro(
        `Erro ao tentar concluir tarefa inexistente (id: ${tarefaId})`,
        null
      );
      throw createError(404, `Tarefa com id ${tarefaId} não encontrada.`);
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: tarefaId },
      data: { concluida: true },
    });

    await logService.tarefaConcluida(
      tarefa.usuarioId,
      tarefa.id,
      tarefa.titulo
    );

    return res.status(200).json(tarefa);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tarefas/:id
 */
export async function deletarTarefa(req, res, next) {
  try {
    const tarefaId = Number(req.params.id);

    const tarefaExiste = await prisma.tarefa.findUnique({
      where: { id: tarefaId },
    });

    if (!tarefaExiste) {
      throw createError(404, `Tarefa com id ${tarefaId} não encontrada.`);
    }

    await prisma.tarefa.delete({ where: { id: tarefaId } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tarefas/usuario/:id/stats
 * Retorna estatísticas filtradas por usuário
 * (Serviço 3 também fornece esse endpoint, mas este serve como fallback interno)
 */
export async function estatisticasPorUsuario(req, res, next) {
  try {
    const usuarioId = Number(req.params.id);

    const [total, concluidas] = await Promise.all([
      prisma.tarefa.count({ where: { usuarioId } }),
      prisma.tarefa.count({ where: { usuarioId, concluida: true } }),
    ]);

    return res.status(200).json({
      usuarioId,
      total,
      concluidas,
      pendentes: total - concluidas,
    });
  } catch (err) {
    next(err);
  }
}
