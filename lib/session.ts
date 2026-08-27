const COOKIE_NAME = "sarfrut_admin_session"
const EIGHT_HOURS = 8 * 60 * 60 * 1000

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function signature(value: string) {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) return null

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode(value))
  return bytesToBase64Url(new Uint8Array(result))
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let result = 0
  for (let index = 0; index < left.length; index++) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return result === 0
}

export async function createSessionToken() {
  const payload = `v1.${Date.now() + EIGHT_HOURS}`
  const signed = await signature(payload)
  if (!signed) throw new Error("SESSION_SECRET no está configurado correctamente")
  return `${payload}.${signed}`
}

export async function hasValidAdminSession(request: Request) {
  const cookie = request.headers.get("cookie") ?? ""
  const encoded = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1)

  if (!encoded) return false
  const token = decodeURIComponent(encoded)
  const parts = token.split(".")
  if (parts.length !== 3 || parts[0] !== "v1") return false

  const expires = Number(parts[1])
  if (!Number.isFinite(expires) || expires <= Date.now()) return false

  const payload = `${parts[0]}.${parts[1]}`
  const expected = await signature(payload)
  return Boolean(expected && safeEqual(expected, parts[2]))
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${EIGHT_HOURS / 1000}; HttpOnly; Secure; SameSite=Strict`
}

export function expiredSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 32,
  )
}

export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD ?? ""
  return Boolean(expected && safeEqual(candidate, expected))
}
