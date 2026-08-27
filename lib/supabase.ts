import type { Opinion, OpinionType } from "@/lib/opinions"

export class SupabaseConfigurationError extends Error {}

function getConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "")
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new SupabaseConfigurationError("Supabase no está configurado")
  }

  return { url, key }
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key } = getConfig()
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY)
}

export async function insertOpinion(type: OpinionType, message: string) {
  const response = await supabaseRequest("opinions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ type, message }),
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error("Supabase insert failed", response.status, detail.slice(0, 300))
    throw new Error("No se pudo almacenar la opinión")
  }
}

export async function listOpinions(): Promise<Opinion[]> {
  const params = new URLSearchParams({
    select: "id,type,message,created_at",
    order: "created_at.desc",
    limit: "2000",
  })
  const response = await supabaseRequest(`opinions?${params.toString()}`)

  if (!response.ok) {
    const detail = await response.text()
    console.error("Supabase read failed", response.status, detail.slice(0, 300))
    throw new Error("No se pudieron consultar las opiniones")
  }

  return (await response.json()) as Opinion[]
}
