// src/middleware/validate.js
// Middleware de validação de entrada de dados
// Mantém os controllers limpos e centraliza a lógica de validação

import { createError } from "./errorHandler.js";

/**
 * Valida o corpo da requisição para criação de tarefa.
 * Regras de negócio:
 *  - titulo é obrigatório e não pode ser vazio
 *  - usuarioId é obrigatório e deve ser um número inteiro positivo
 */
export function validarCriarTarefa(req, res, next) {
  const { titulo, usuarioId } = req.body;

  if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
    return next(createError(400, "O campo 'titulo' é obrigatório e não pode ser vazio."));
  }

  if (titulo.trim().length > 255) {
    return next(createError(400, "O campo 'titulo' deve ter no máximo 255 caracteres."));
  }

  if (usuarioId === undefined || usuarioId === null) {
    return next(createError(400, "O campo 'usuarioId' é obrigatório."));
  }

  const idNumerico = Number(usuarioId);
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return next(createError(400, "O campo 'usuarioId' deve ser um número inteiro positivo."));
  }

  // Normaliza os valores no body para uso no controller
  req.body.titulo = titulo.trim();
  req.body.usuarioId = idNumerico;

  next();
}

/**
 * Valida o parâmetro :id da rota (id da tarefa).
 */
export function validarIdTarefa(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(createError(400, "O parâmetro 'id' deve ser um número inteiro positivo."));
  }

  req.params.id = id;
  next();
}

/**
 * Valida o parâmetro :id da rota (id do usuário).
 */
export function validarIdUsuario(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(createError(400, "O parâmetro 'id' deve ser um número inteiro positivo."));
  }

  req.params.id = id;
  next();
}
