export async function getOpinionById(id: string): Promise<Opinion | null> {
  const params = new URLSearchParams({
    select: "id,type,message,created_at",
    id: `eq.${id}`,
    limit: "1",
  })

  const response = await supabaseRequest(`opinions?${params.toString()}`)

  if (!response.ok) {
    const detail = await response.text()
    console.error(
      "Supabase opinion lookup failed",
      response.status,
      detail.slice(0, 300)
    )
    throw new Error("No se pudo consultar la denuncia")
  }

  const opinions = (await response.json()) as Opinion[]
  return opinions[0] ?? null
}
