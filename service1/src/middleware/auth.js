import { createError } from "./errorHandler.js";
import { gerarToken, verificarToken } from "../utils/security.js";

export { gerarToken };

export function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(401, "Token não informado.");
    }

    const token = authHeader.slice(7);
    const payload = verificarToken(token);

    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      nome: payload.nome,
    };

    next();
  } catch {
    next(createError(401, "Token inválido ou expirado."));
  }
}
