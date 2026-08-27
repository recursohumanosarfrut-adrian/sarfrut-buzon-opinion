import { isAdminConfigured } from "@/lib/session"
import { isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  return Response.json({
    configured: isSupabaseConfigured(),
    adminConfigured: isAdminConfigured(),
  })
}
