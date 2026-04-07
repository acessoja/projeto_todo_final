import crypto from "crypto";

const TOKEN_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verificarSenha(senha, senhaHash) {
  const [salt, hashSalvo] = senhaHash.split(":");
  if (!salt || !hashSalvo) return false;

  const hashBuffer = Buffer.from(hashSalvo, "hex");
  const senhaTeste = crypto.scryptSync(senha, salt, 64);

  if (hashBuffer.length !== senhaTeste.length) return false;

  return crypto.timingSafeEqual(hashBuffer, senhaTeste);
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function parseExp(expiresIn) {
  if (expiresIn.endsWith("h")) return Number(expiresIn.slice(0, -1)) * 3600;
  if (expiresIn.endsWith("m")) return Number(expiresIn.slice(0, -1)) * 60;
  return Number(expiresIn);
}

export function gerarToken(payload, expiresIn = "12h") {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + parseExp(expiresIn);

  const payloadFinal = { ...payload, exp };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payloadFinal));

  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verificarToken(token) {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Token malformado");
  }

  const expectedSignature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (expectedSignature !== signature) {
    throw new Error("Assinatura inválida");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expirado");
  }

  return payload;
}
