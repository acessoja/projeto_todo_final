// ============================================================
// EXEMPLO DE INTEGRAÇÃO DO SERVIÇO 1 COM O SERVIÇO 2
// Arquivo: src/services/logService.js (novo arquivo no Serviço 1)
// ============================================================

/**
 * logService.js
 *
 * Abstrai toda a comunicação com o Serviço 2 (Gerador de Logs).
 * O controller não sabe que existe uma chamada HTTP —
 * ele só chama funções daqui.
 *
 * Isolado em um arquivo próprio para:
 *  - Facilitar mocks nos testes
 *  - Trocar a URL sem alterar controllers
 *  - Centralizar retry, headers, autenticação futura
 */

const SERVICE2_URL = process.env.SERVICE2_URL || "http://localhost:8001";

/**
 * Envia um evento de log para o Serviço 2.
 * Falhas de log NÃO devem derrubar a operação principal.
 *
 * @param {"CRIACAO_TAREFA"|"CONCLUSAO_TAREFA"|"ERRO"} acao
 * @param {string} detalhe
 * @param {number|null} usuarioId
 */
async function emitirLog(acao, detalhe, usuarioId = null) {
  try {
    const response = await fetch(`${SERVICE2_URL}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao, detalhe, usuarioId }),
    });

    if (!response.ok) {
      console.warn(
        `[logService] Serviço 2 retornou ${response.status} ao registrar log de "${acao}"`
      );
    }
  } catch (err) {
    // Log falhou — registra no console mas não propaga o erro.
    // A operação principal (criar/concluir tarefa) já aconteceu com sucesso.
    console.error("[logService] Falha ao contatar Serviço 2:", err.message);
  }
}

export const logService = {
  async tarefaCriada(usuarioId, tituloTarefa) {
    await emitirLog(
      "CRIACAO_TAREFA",
      `Usuário ${usuarioId} criou a tarefa '${tituloTarefa}'`,
      usuarioId
    );
  },

  async tarefaConcluida(usuarioId, tarefaId, tituloTarefa) {
    await emitirLog(
      "CONCLUSAO_TAREFA",
      `Usuário ${usuarioId} concluiu a tarefa '${tituloTarefa}' (id: ${tarefaId})`,
      usuarioId
    );
  },

  async erro(mensagem, usuarioId = null) {
    await emitirLog("ERRO", mensagem, usuarioId);
  },
};


// ============================================================
// EXEMPLO: tarefasController.js ATUALIZADO (Serviço 1)
// Substituir o arquivo original por este após implementar o Serviço 2
// ============================================================

import prisma from "../prismaClient.js";
import { createError } from "../middleware/errorHandler.js";
import { logService } from "../services/logService.js"; // ← importar o serviço de log

/**
 * POST /api/tarefas
 * Cria tarefa + emite log no Serviço 2
 */
export async function criarTarefa(req, res, next) {
  try {
    const { titulo, usuarioId } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });

    if (!usuarioExiste) {
      // ── Log de erro: usuário não encontrado ──────────────────────────
      await logService.erro(
        `Tentativa de criar tarefa para usuário inexistente (id: ${usuarioId})`,
        null
      );
      throw createError(404, `Usuário com id ${usuarioId} não encontrado.`);
    }

    const tarefa = await prisma.tarefa.create({
      data: { titulo, usuarioId },
    });

    // ── Log de sucesso: tarefa criada ─────────────────────────────────
    await logService.tarefaCriada(usuarioId, titulo);

    return res.status(201).json(tarefa);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tarefas/:id/concluir
 * Conclui tarefa + emite log no Serviço 2
 */
export async function concluirTarefa(req, res, next) {
  try {
    const tarefaId = req.params.id;

    const tarefaExiste = await prisma.tarefa.findUnique({
      where: { id: tarefaId },
    });

    if (!tarefaExiste) {
      // ── Log de erro: tarefa não encontrada ───────────────────────────
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

    // ── Log de sucesso: tarefa concluída ──────────────────────────────
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
