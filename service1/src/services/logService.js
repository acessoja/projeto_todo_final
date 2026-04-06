// src/services/logService.js
// Abstrai toda a comunicação com o Serviço 2 (Gerador de Logs).
// O controller não sabe que existe uma chamada HTTP —
// ele só chama funções daqui.

const SERVICE2_URL = process.env.SERVICE2_URL || "http://localhost:8001";

/**
 * Envia um evento de log para o Serviço 2.
 * Falhas de log NÃO devem derrubar a operação principal.
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
    // Log falhou — registra no console mas NÃO propaga o erro.
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
