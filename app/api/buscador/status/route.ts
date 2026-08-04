import { NextResponse } from "next/server";
import { buscarStatus } from "@/lib/upstream";

export async function GET() {
  try {
    const status = await buscarStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: "Falha ao buscar status." }, { status: 502 });
  }
}
