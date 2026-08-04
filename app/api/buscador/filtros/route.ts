import { NextResponse } from "next/server";
import axios from "axios";
import { buscarFiltrosDisponiveis } from "@/lib/upstream";

export async function GET() {
  try {
    const filtros = await buscarFiltrosDisponiveis();
    return NextResponse.json(filtros);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[buscador/filtros]", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
    } else {
      console.error("[buscador/filtros]", error instanceof Error ? error.message : "Erro desconhecido");
    }
    return NextResponse.json({ error: "Falha ao carregar os filtros." }, { status: 502 });
  }
}
