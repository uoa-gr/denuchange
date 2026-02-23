import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = "denuchange_session"

export interface JwtPayload {
  email: string
  isAdmin: boolean
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function getSessionCookie(value: string): string {
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractJwt(req: any): JwtPayload | null {
  const cookieHeader: string = req.headers?.cookie ?? ""
  if (!cookieHeader) return null
  const cookie = cookieHeader
    .split(";")
    .map((c: string) => c.trim())
    .find((c: string) => c.startsWith(`${COOKIE_NAME}=`))
  if (!cookie) return null
  const token = cookie.slice(COOKIE_NAME.length + 1)
  return verifyJwt(token)
}
