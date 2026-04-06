// src/controllers/usuariosController.js
// Controller de Usuários
//
// RESPONSABILIDADE ATUAL (Serviço 1):
//   - Criação e listagem de usuários
//   - Sem autenticação JWT (será implementado no Serviço de Auth - futuro)
//
// PREPARADO PARA FUTURO:
//   - Senhas serão hashadas pelo Serviço de Auth antes de persistir aqui
//   - O campo `senha` neste serviço receberá o hash, não o texto puro
//   - Rotas de listagem serão protegidas por middleware JWT

import prisma from "../prismaClient.js";
import { createError } from "../middleware/errorHandler.js";

/**
 * POST /api/usuarios
 * Cria um novo usuário no sistema.
 *
 * AVISO: Em produção, a senha DEVE ser hasheada antes de persistir.
 * O Serviço de Auth será responsável por isso.
 */
export async function criarUsuario(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      throw createError(400, "Os campos 'nome', 'email' e 'senha' são obrigatórios.");
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha, // FUTURO: receberá hash do Serviço de Auth
      },
      // Nunca retornar a senha na resposta
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });

    return res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/usuarios
 * Lista todos os usuários (sem expor senhas).
 *
 * FUTURO: Rota protegida por JWT (apenas admin poderá acessar).
 */
export async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        // senha: NUNCA retornar
        _count: {
          select: { tarefas: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json(usuarios);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/usuarios/:id
 * Busca um usuário pelo ID.
 *
 * FUTURO: Rota protegida – usuário só poderá ver seus próprios dados.
 */
export async function buscarUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw createError(400, "ID inválido.");
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        _count: {
          select: { tarefas: true },
        },
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
