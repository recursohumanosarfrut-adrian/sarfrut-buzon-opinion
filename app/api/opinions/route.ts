import type { OpinionType } from "@/lib/opinions"
import {
  insertOpinion,
  SupabaseConfigurationError,
} from "@/lib/supabase"

const allowedTypes = new Set<OpinionType>([
  "sugerencia",
  "reconocimiento",
  "denuncia",
])

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: OpinionType
      message?: string
      website?: string
    }

    if (body.website) {
      return Response.json({ ok: true }, { status: 201 })
    }

    const message = body.message?.trim() ?? ""
    if (!body.type || !allowedTypes.has(body.type)) {
      return Response.json({ error: "Selecciona un tipo de opinión." }, { status: 400 })
    }
    if (message.length < 15 || message.length > 2000) {
      return Response.json(
        { error: "El mensaje debe tener entre 15 y 2000 caracteres." },
        { status: 400 },
      )
    }

    await insertOpinion(body.type, message)
    return Response.json({ ok: true }, { status: 201 })
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return Response.json(
        { error: "La conexión de almacenamiento aún no está activa.", code: "not_configured" },
        { status: 503 },
      )
    }

    console.error("Opinion submission failed", error)
    return Response.json(
      { error: "No pudimos registrar tu opinión. Inténtalo nuevamente." },
      { status: 500 },
    )
  }
}
