import { createError } from "./errorHandler.js";

export function validarCriarTarefa(req, res, next) {
  const { titulo } = req.body;

  if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
    return next(createError(400, "O campo 'titulo' é obrigatório e não pode ser vazio."));
  }

  if (titulo.trim().length > 255) {
    return next(createError(400, "O campo 'titulo' deve ter no máximo 255 caracteres."));
  }

  req.body.titulo = titulo.trim();

  next();
}

export function validarIdTarefa(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(createError(400, "O parâmetro 'id' deve ser um número inteiro positivo."));
  }

  req.params.id = id;
  next();
}
