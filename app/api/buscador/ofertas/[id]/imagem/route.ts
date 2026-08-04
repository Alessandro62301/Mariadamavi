import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });

  const oferta = await prisma.ofertaCache.findUnique({ where: { id }, select: { fotoUrl: true } });
  if (!oferta?.fotoUrl) return new NextResponse(null, { status: 404 });

  try {
    const origem = new URL(oferta.fotoUrl);
    if (origem.protocol !== "https:") return new NextResponse(null, { status: 400 });
    const response = await fetch(origem, { signal: AbortSignal.timeout(8_000) });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.startsWith("image/")) return new NextResponse(null, { status: 404 });

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=604800, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
