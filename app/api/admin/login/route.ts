import {
  createSessionToken,
  isAdminConfigured,
  passwordMatches,
  sessionCookie,
} from "@/lib/session"

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json(
      { error: "El acceso interno aún no está configurado.", code: "not_configured" },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string }
  if (!body.password || !passwordMatches(body.password)) {
    return Response.json({ error: "Contraseña incorrecta." }, { status: 401 })
  }

  const token = await createSessionToken()
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } },
  )
}
