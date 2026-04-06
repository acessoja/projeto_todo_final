// src/middleware/errorHandler.js
// Middleware central de tratamento de erros
// Estruturado para suportar futura integração com Serviço de Logs

/**
 * Middleware de tratamento de erros global.
 * Captura todos os erros passados via next(err) e retorna resposta padronizada.
 *
 * PREPARADO PARA FUTURO:
 * - Aqui será o ponto de integração com o Serviço de Logs
 * - Emitir evento de log sempre que um erro ocorrer
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERRO] ${err.message}`, {
    path: req.path,
    method: req.method,
    // Aqui: futuramente emitir evento para Serviço de Logs
  });

  // Erros do Prisma (validação, constraint, etc.)
  if (err.code) {
    if (err.code === "P2002") {
      return res.status(409).json({
        erro: "Registro duplicado",
        detalhe: "Já existe um registro com esses dados únicos.",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        erro: "Registro não encontrado",
        detalhe: err.meta?.cause || "O recurso solicitado não existe.",
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        erro: "Referência inválida",
        detalhe: "O usuário informado não existe.",
      });
    }
  }

  // Erros de validação manuais (lançados com status)
  if (err.status) {
    return res.status(err.status).json({
      erro: err.message,
    });
  }

  // Erro genérico
  return res.status(500).json({
    erro: "Erro interno do servidor",
    detalhe:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

/**
 * Helper para criar erros com status HTTP.
 * Uso: throw createError(400, "Título é obrigatório")
 */
export function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
