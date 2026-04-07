import prisma from "../prismaClient.js";
import { createError } from "../middleware/errorHandler.js";
import { logService } from "../services/logService.js";

export async function criarTarefa(req, res, next) {
  try {
    const { titulo } = req.body;
    const usuarioId = req.user.id;

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        usuarioId,
      },
    });

    await logService.tarefaCriada(usuarioId, titulo);

    return res.status(201).json(tarefa);
  } catch (err) {
    next(err);
  }
}

export async function listarMinhasTarefas(req, res, next) {
  try {
    const usuarioId = req.user.id;

    const tarefas = await prisma.tarefa.findMany({
      where: { usuarioId },
      orderBy: [{ concluida: "asc" }, { id: "desc" }],
    });

    return res.status(200).json(tarefas);
  } catch (err) {
    next(err);
  }
}

export async function concluirTarefa(req, res, next) {
  try {
    const tarefaId = Number(req.params.id);
    const usuarioId = req.user.id;

    const tarefaExiste = await prisma.tarefa.findFirst({
      where: { id: tarefaId, usuarioId },
    });

    if (!tarefaExiste) {
      await logService.erro(
        `Usuário ${usuarioId} tentou concluir tarefa inexistente/sem acesso (id: ${tarefaId})`,
        usuarioId
      );
      throw createError(404, "Tarefa não encontrada para o usuário logado.");
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: tarefaId },
      data: { concluida: true },
    });

    await logService.tarefaConcluida(usuarioId, tarefa.id, tarefa.titulo);

    return res.status(200).json(tarefa);
  } catch (err) {
    next(err);
  }
}

export async function deletarTarefa(req, res, next) {
  try {
    const tarefaId = Number(req.params.id);
    const usuarioId = req.user.id;

    const tarefaExiste = await prisma.tarefa.findFirst({
      where: { id: tarefaId, usuarioId },
      select: { id: true },
    });

    if (!tarefaExiste) {
      throw createError(404, "Tarefa não encontrada para o usuário logado.");
    }

    await prisma.tarefa.delete({ where: { id: tarefaId } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function minhasEstatisticas(req, res, next) {
  try {
    const usuarioId = req.user.id;

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
