/**
 * Sessão simples de acesso único (1 usuário/senha via env), sem banco de dados.
 * Usa Web Crypto (HMAC-SHA256) — funciona tanto no middleware (Edge) quanto
 * nas API routes (Node), sem depender do módulo `crypto` do Node.
 */

const COOKIE_NAME = "mavi_session";
const SESSION_HOURS = 12;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Só pra não travar em dev sem .env configurado — troque em produção.
    return "dev-secret-troque-no-env-AUTH_SECRET";
  }
  return secret;
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(signature);
}

// Token = `${base64url(usuario|expiresAt)}.${assinatura}` — o payload vira
// base64url ANTES de juntar com ".", então caracteres como "@" ou "." dentro
// do usuário (ex.: e-mails) nunca quebram o split do token.
export async function createSessionToken(usuario: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `${usuario}|${expiresAt}`;
  const payloadB64 = stringToBase64Url(payload);
  const sig = await hmac(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const payloadB64 = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const expectedSig = await hmac(payloadB64);
  if (sig !== expectedSig) return false;

  try {
    const payload = base64UrlToString(payloadB64);
    const [, expiresAtStr] = payload.split("|");
    const expiresAt = Number(expiresAtStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  } catch {
    return false;
  }

  return true;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_HOURS * 60 * 60;
