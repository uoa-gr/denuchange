import { useRef, useState } from "react"
import { useAuth } from "@/app/lib/auth"
import { api } from "@/app/lib/api"
import { supabase } from "@/lib/supabase"
import { LogOut, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"

const REG_TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  student: "Student / Early Career",
  virtual: "Virtual",
  speaker: "Speaker",
  organiser: "Organiser",
}

export function Profile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatarPath
      ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatarPath}`
      : null
  )
  const [signingOut, setSigningOut] = useState(false)

  if (!user) return null

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    setUploading(true)
    try {
      const { token, path, mimeType, avatarPublicUrl } = await api.getAvatarUploadUrl(ext)
      await supabase.storage.from("avatars").uploadToSignedUrl(path, token, file, {
        contentType: mimeType,
        upsert: true,
      })
      setAvatarUrl(avatarPublicUrl)
    } catch {
      // silently ignore — user can retry
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await api.logout()
    } finally {
      setUser(null)
      navigate("/app/auth/email", { replace: true })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Avatar section */}
      <div className="flex flex-col items-center py-8 px-4 bg-muted/20 border-b border-border">
        <div className="relative mb-4">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10 ring-4 ring-background shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{initials || "?"}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md disabled:opacity-60"
          >
            {uploading ? (
              <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="text-lg font-bold text-foreground">
          {user.firstName} {user.lastName}
        </p>
        {user.affiliation && (
          <p className="text-sm text-muted-foreground mt-0.5 text-center">{user.affiliation}</p>
        )}
        {user.isAdmin && (
          <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground tracking-wide">
            ADMIN
          </span>
        )}
      </div>

      {/* Info rows */}
      <div className="divide-y divide-border">
        <InfoRow label="Email" value={user.email} />
        <InfoRow
          label="Registration type"
          value={REG_TYPE_LABELS[user.registrationType] ?? user.registrationType}
        />
      </div>

      {/* Sign out */}
      <div className="mt-auto p-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}
