import type { Oferta } from "./types";

type ResultadoEnvio = { ok: true } | { ok: false; erro: string };

function escaparHtml(valor: string) {
  return valor.replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[caractere] ?? caractere);
}

function linkOferta(oferta: Oferta) {
  const base = process.env.APP_URL || "https://mariadamavi.com.br";
  const params = new URLSearchParams({ categoria: oferta.categoria, q: oferta.modelo });
  return `${base}/buscador?${params.toString()}`;
}

export function emailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_FROM);
}

export function telegramConfigurado() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN
    && process.env.TELEGRAM_BOT_USERNAME
    && process.env.TELEGRAM_WEBHOOK_SECRET,
  );
}

export async function configurarWebhookTelegram(): Promise<ResultadoEnvio> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const appUrl = process.env.APP_URL;
  if (!token || !secret || !appUrl) return { ok: false, erro: "Webhook do Telegram não configurado." };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${appUrl.replace(/\/$/, "")}/api/integracoes/telegram/webhook`,
        secret_token: secret,
        allowed_updates: ["message"],
      }),
    });
    if (!response.ok) return { ok: false, erro: `Telegram respondeu ${response.status} ao configurar webhook.` };
    return { ok: true };
  } catch (error) {
    return { ok: false, erro: error instanceof Error ? error.message : "Falha ao configurar webhook." };
  }
}

export async function enviarEmailAlerta(destinatario: string, oferta: Oferta): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.ALERT_EMAIL_FROM;
  if (!apiKey || !remetente) return { ok: false, erro: "Canal de e-mail não configurado." };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: remetente,
        to: [destinatario],
        subject: `Alerta de preço: ${oferta.modelo} por ${oferta.valor}`,
        text: `${oferta.modelo} (${oferta.condicao}, ${oferta.cor}) apareceu por ${oferta.valor} em ${oferta.cidade}. Veja: ${linkOferta(oferta)}`,
        html: `<h2>${escaparHtml(oferta.modelo)}</h2><p>${escaparHtml(oferta.condicao)} · ${escaparHtml(oferta.cor)} · ${escaparHtml(oferta.cidade)}</p><p><strong>${escaparHtml(oferta.valor)}</strong></p><p><a href="${escaparHtml(linkOferta(oferta))}">Abrir no catálogo</a></p>`,
      }),
    });
    if (!response.ok) return { ok: false, erro: `Resend respondeu ${response.status}.` };
    return { ok: true };
  } catch (error) {
    return { ok: false, erro: error instanceof Error ? error.message : "Falha desconhecida no e-mail." };
  }
}

export async function enviarTelegram(chatId: string, texto: string): Promise<ResultadoEnvio> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, erro: "Canal do Telegram não configurado." };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: texto, disable_web_page_preview: true }),
    });
    if (!response.ok) return { ok: false, erro: `Telegram respondeu ${response.status}.` };
    return { ok: true };
  } catch (error) {
    return { ok: false, erro: error instanceof Error ? error.message : "Falha desconhecida no Telegram." };
  }
}

export function mensagemTelegramAlerta(oferta: Oferta) {
  return [
    "Alerta de preço MARIADAMAVI",
    "",
    oferta.modelo,
    `${oferta.condicao} · ${oferta.cor}`,
    `${oferta.valor} · ${oferta.cidade}`,
    "",
    linkOferta(oferta),
  ].join("\n");
}
