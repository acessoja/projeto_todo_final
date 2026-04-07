import prisma from "../prismaClient.js";
import { createError } from "../middleware/errorHandler.js";
import { gerarToken } from "../middleware/auth.js";
import { hashSenha, verificarSenha } from "../utils/security.js";

export async function cadastrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      throw createError(400, "Os campos 'nome', 'email' e 'senha' são obrigatórios.");
    }

    const emailNormalizado = email.trim().toLowerCase();
    const senhaHash = hashSenha(senha);

    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });

    const token = gerarToken({ sub: usuario.id, email: usuario.email, nome: usuario.nome });

    return res.status(201).json({ usuario, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw createError(400, "Os campos 'email' e 'senha' são obrigatórios.");
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (!usuario) {
      throw createError(401, "Credenciais inválidas.");
    }

    const senhaValida = verificarSenha(senha, usuario.senha);
    if (!senhaValida) {
      throw createError(401, "Credenciais inválidas.");
    }

    const token = gerarToken({ sub: usuario.id, email: usuario.email, nome: usuario.nome });

    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        _count: { select: { tarefas: true } },
      },
    });

    if (!usuario) {
      throw createError(404, "Usuário não encontrado.");
    }

    return res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
}
