import { NextRequest, NextResponse } from "next/server";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function textFrom(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function eventList(payload: UnknownRecord): unknown[] {
  const data = asRecord(payload.data);
  const object = asRecord(payload.objeto);
  for (const candidate of [payload.eventos, payload.events, payload.historico, data.eventos, data.events, data.historico, object.eventos, object.events]) {
    if (Array.isArray(candidate)) return candidate;
  }
  const latest = payload.eventoMaisRecente ?? data.eventoMaisRecente;
  return latest ? [latest] : [];
}

function iconFor(description: string, index: number, total: number) {
  const value = description.toLowerCase();
  if (/entregue|finalizad/.test(value)) return "✓";
  if (/saiu.*entrega|rota de entrega/.test(value)) return "↗";
  if (/postado|coletado|recebid/.test(value)) return "✦";
  if (index === total - 1) return "●";
  return "→";
}

function normalize(payload: UnknownRecord, requestedCode: string) {
  const rawEvents = eventList(payload).map(asRecord);
  const chronological = rawEvents.sort((a, b) => {
    const aDate = Date.parse(textFrom(a, ["data", "dataHora", "date", "datetime", "createdAt", "created_at"]));
    const bDate = Date.parse(textFrom(b, ["data", "dataHora", "date", "datetime", "createdAt", "created_at"]));
    return (Number.isNaN(aDate) ? 0 : aDate) - (Number.isNaN(bDate) ? 0 : bDate);
  });

  const steps = chronological.map((event, index) => {
    const description = textFrom(event, ["descricao", "description", "status", "evento", "message"]) || `Atualização ${index + 1}`;
    const detail = textFrom(event, ["detalhe", "details", "detail", "observacao", "comment"]) || description;
    const rawDate = textFrom(event, ["data", "dataHora", "date", "datetime", "createdAt", "created_at"]);
    const parsed = rawDate ? new Date(rawDate) : null;
    const date = parsed && !Number.isNaN(parsed.getTime())
      ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(parsed).replace(".", "").toUpperCase()
      : rawDate || "ATUALIZAÇÃO";
    const locationRecord = asRecord(event.unidade ?? event.location);
    const city = textFrom(event, ["local", "location", "cidade", "city", "origem"]) || textFrom(locationRecord, ["nome", "cidade", "endereco"]) || "Em trânsito";
    return {
      place: index === 0 ? "Origem" : index === chronological.length - 1 ? "Agora" : `Etapa ${index + 1}`,
      city,
      label: description,
      date,
      detail,
      icon: iconFor(description, index, chronological.length),
    };
  });

  return {
    code: textFrom(payload, ["codigo", "code", "trackingCode"]) || requestedCode,
    carrier: textFrom(payload, ["carrierName", "transportadora", "carrier"]) || "Transportadora",
    status: textFrom(payload, ["status", "situacao"]) || "found",
    steps,
  };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo: rawCode } = await params;
  const codigo = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9-]{8,40}$/.test(codigo)) {
    return NextResponse.json({ error: "Código de rastreio inválido." }, { status: 400 });
  }

  const endpointTemplate = process.env.SITERASTREIO_API_URL?.trim();
  const apiKey = process.env.SITERASTREIO_API_KEY?.trim();
  if (!endpointTemplate || !apiKey) {
    return NextResponse.json({ error: "API de rastreio ainda não configurada.", code: "tracking_not_configured" }, { status: 503 });
  }

  const endpoint = endpointTemplate.includes("{codigo}")
    ? endpointTemplate.replace("{codigo}", encodeURIComponent(codigo))
    : `${endpointTemplate.replace(/\/$/, "")}/${encodeURIComponent(codigo)}`;
  const headerName = process.env.SITERASTREIO_AUTH_HEADER?.trim() || "Authorization";
  const prefix = process.env.SITERASTREIO_AUTH_PREFIX ?? "Bearer ";

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json", [headerName]: `${prefix}${apiKey}` },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10_000),
    });
    const payload = asRecord(await response.json().catch(() => ({})));
    if (!response.ok) {
      const message = textFrom(payload, ["message", "mensagem", "error"]) || "Não foi possível consultar este rastreio.";
      return NextResponse.json({ error: message }, { status: response.status });
    }
    const result = normalize(payload, codigo);
    if (!result.steps.length) return NextResponse.json({ error: "Nenhum evento encontrado para este código." }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "O serviço de rastreio está temporariamente indisponível." }, { status: 502 });
  }
}
