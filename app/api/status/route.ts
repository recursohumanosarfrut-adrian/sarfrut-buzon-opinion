export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const supabaseUrl = Boolean(process.env.SUPABASE_URL)
  const supabaseKey = Boolean(process.env.SUPABASE_SECRET_KEY)
  const adminPassword = Boolean(process.env.ADMIN_PASSWORD)
  const sessionSecret = Boolean(
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32
  )

  return Response.json(
    {
      configured: supabaseUrl && supabaseKey,
      adminConfigured: adminPassword && sessionSecret,
      diagnostics: {
        supabaseUrl,
        supabaseKey,
        adminPassword,
        sessionSecret,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  )
}
