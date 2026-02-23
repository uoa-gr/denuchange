// Typed wrappers for all /api/app/* endpoints.
// All requests include credentials (session cookie).

export interface AppUser {
  email: string
  isAdmin: boolean
  firstName: string
  lastName: string
  affiliation: string
  registrationType: string
  avatarPath: string | null
}

export type EmailStatus = "not_registered" | "needs_password" | "has_password"

interface ApiError extends Error {
  status: number
  data: Record<string, unknown>
}

async function apiFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
  const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
  if (!res.ok) {
    const err = new Error((body as Record<string, string>).error ?? "Request failed") as ApiError
    err.status = res.status
    err.data = body as Record<string, unknown>
    throw err
  }
  return body
}

export interface SessionInput {
  id?: string
  date: string
  start_time: string
  end_time: string
  title: string
  description: string
  location: string
  session_type: string
}

export const api = {
  checkEmail: (email: string) =>
    apiFetch("/api/app/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }) as Promise<{ status: EmailStatus }>,

  sendSetupEmail: (email: string) =>
    apiFetch("/api/app/send-setup-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }) as Promise<{ sent: true }>,

  verifySetupToken: (token: string) =>
    apiFetch(`/api/app/verify-setup-token?token=${encodeURIComponent(token)}`) as Promise<{
      valid: boolean
      email?: string
      reason?: string
    }>,

  setPassword: (token: string, password: string) =>
    apiFetch("/api/app/set-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }) as Promise<{ ok: true }>,

  login: (email: string, password: string) =>
    apiFetch("/api/app/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }) as Promise<AppUser>,

  me: () => apiFetch("/api/app/me") as Promise<AppUser>,

  logout: () =>
    apiFetch("/api/app/logout", { method: "POST" }) as Promise<{ ok: true }>,

  getAvatarUploadUrl: (ext: string) =>
    apiFetch("/api/app/avatar-upload-url", {
      method: "POST",
      body: JSON.stringify({ ext }),
    }) as Promise<{ token: string; path: string; mimeType: string; avatarPublicUrl: string }>,

  adminPostNotification: (title: string, body: string) =>
    apiFetch("/api/app/admin/post-notification", {
      method: "POST",
      body: JSON.stringify({ title, body }),
    }) as Promise<{ ok: true }>,

  adminGetGalleryUploadUrl: (ext: string, caption: string) =>
    apiFetch("/api/app/admin/gallery-upload-url", {
      method: "POST",
      body: JSON.stringify({ ext, caption }),
    }) as Promise<{ token: string; path: string; imageId: string; mimeType: string }>,

  adminUpsertSession: (session: SessionInput) =>
    apiFetch("/api/app/admin/upsert-session", {
      method: "POST",
      body: JSON.stringify(session),
    }) as Promise<{ id: string }>,

  adminDeleteSession: (id: string) =>
    apiFetch("/api/app/admin/delete-session", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }) as Promise<{ ok: true }>,
}
