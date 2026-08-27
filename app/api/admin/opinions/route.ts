import { DEMO_OPINIONS } from "@/lib/opinions"
import { hasValidAdminSession, isAdminConfigured } from "@/lib/session"
import {
  isSupabaseConfigured,
  listOpinions,
} from "@/lib/supabase"

export async function GET(request: Request) {
  const demo = !isSupabaseConfigured() || !isAdminConfigured()
  if (demo) {
    return Response.json(
      { opinions: DEMO_OPINIONS, demo: true },
      { headers: { "Cache-Control": "no-store" } },
    )
  }

  if (!(await hasValidAdminSession(request))) {
    return Response.json({ error: "Sesión no autorizada." }, { status: 401 })
  }

  try {
    const opinions = await listOpinions()
    return Response.json(
      { opinions, demo: false },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Admin opinions failed", error)
    return Response.json(
      { error: "No fue posible cargar las opiniones." },
      { status: 500 },
    )
  }
}
