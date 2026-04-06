import type { OpsData } from "./types"

const BASE = "/api/app/admin"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchMe(): Promise<{ email: string; isAdmin: boolean } | null> {
  const res = await fetch("/api/app/auth?action=me", { credentials: "include" })
  if (!res.ok) return null
  return res.json()
}

export async function login(email: string, password: string): Promise<{ isAdmin: boolean }> {
  return request("/api/app/auth?action=login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function logout(): Promise<void> {
  await fetch("/api/app/auth?action=logout", { method: "POST", credentials: "include" })
}

export async function fetchOpsData(): Promise<OpsData> {
  return request(`${BASE}?action=ops-data`, { method: "GET" })
}

export async function signFileUrl(bucket: "abstracts" | "payment-receipts", path: string): Promise<string> {
  const { url } = await request<{ url: string }>(`${BASE}?action=ops-file-url`, {
    method: "POST",
    body: JSON.stringify({ bucket, path }),
  })
  return url
}

export async function confirmPayment(registration_id: string, confirmed: boolean): Promise<void> {
  await request(`${BASE}?action=ops-confirm-payment`, {
    method: "POST",
    body: JSON.stringify({ registration_id, confirmed }),
  })
}

export function bulkZipUrl(): string {
  return `${BASE}?action=ops-bulk-zip`
}
