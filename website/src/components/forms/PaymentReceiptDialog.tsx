import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2, UploadCloud, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function PaymentReceiptDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const handleFile = (f: File | undefined) => {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setFileError("Accepted formats: PDF, JPEG, PNG")
      return
    }
    if (f.size > MAX_SIZE) {
      setFileError("File must be under 10 MB")
      return
    }
    setFileError(null)
    setFile(f)
  }

  const onSubmit = async (data: FormData) => {
    setServerError(null)

    if (!file) {
      setFileError("Please upload your payment receipt.")
      return
    }

    const ext = file.name.split(".").pop()
    const path = `${Date.now()}-${data.email.replace(/[@.]/g, "_")}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from("payment-receipts")
      .upload(path, file)

    if (uploadErr) {
      setServerError("File upload failed. Please try again.")
      return
    }

    const { error } = await supabase.from("payment_receipts").insert([{
      email: data.email,
      file_path: path,
      notes: data.notes ?? "",
    }])

    if (error) {
      setServerError("Something went wrong. Please try again.")
      return
    }

    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "payment", email: data.email }),
    }).catch(() => {})

    setSuccess(true)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) { reset(); setSuccess(false); setServerError(null); setFile(null); setFileError(null) }
    setOpen(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <DialogTitle>Receipt received!</DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your payment receipt (Αποδεικτικό Πληρωμής) has been uploaded successfully.
              We will confirm your payment within a few business days.
            </p>
            <Button onClick={() => handleOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Upload Payment Receipt</DialogTitle>
              <DialogDescription>
                Αποδεικτικό Πληρωμής · PDF or image · max 10 MB
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
              <div className="space-y-1.5">
                <Label htmlFor="pay-email">Registration Email *</Label>
                <Input
                  id="pay-email"
                  type="email"
                  placeholder="Use the email you registered with"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Payment Receipt *</Label>
                {file ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md text-sm">
                    <span className="flex-1 truncate text-foreground">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setFileError(null); if (fileRef.current) fileRef.current.value = "" }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <UploadCloud className="h-6 w-6" />
                    <span>Click to select file</span>
                    <span className="text-xs">PDF, JPEG, PNG — max 10 MB</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="sr-only"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </label>
                )}
                {fileError && <p className="text-xs text-destructive">{fileError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-notes">
                  Notes{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="pay-notes"
                  rows={2}
                  placeholder="e.g. transfer reference number"
                  {...register("notes")}
                />
              </div>

              {serverError && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Uploading…" : "Upload Receipt"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
