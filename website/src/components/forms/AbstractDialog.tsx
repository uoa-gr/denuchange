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
import { Select } from "@/components/ui/select"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  title: z.string().min(3, "Please enter the abstract title"),
  co_authors: z.string().optional(),
  presentation_type: z.enum(["oral", "poster"], { error: "Please select a presentation type" }),
  abstract_text: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

export function AbstractDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [duplicateMailto, setDuplicateMailto] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { presentation_type: "oral", abstract_text: "" },
  })

  const abstractText = watch("abstract_text") ?? ""
  const words = wordCount(abstractText)
  const overLimit = words > 500

  const onSubmit = async (data: FormData) => {
    setServerError(null)

    // Check if user is registered
    const normalizedEmail = data.email.trim().toLowerCase()
    const { data: reg, error: regError } = await supabase
      .from("registrations")
      .select("first_name, last_name, affiliation")
      .ilike("email", normalizedEmail)
      .maybeSingle()

    if (regError) {
      console.error("Registration lookup error:", regError)
      setServerError(`Database error: ${regError.message}. Please contact the organizers.`)
      return
    }

    if (!reg) {
      setServerError("This email is not registered. Please register first before submitting an abstract.")
      return
    }

    // Check for existing abstract submission
    const { data: existingAbstract } = await supabase
      .from("abstracts")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle()

    if (existingAbstract) {
      const mailto = "mailto:denuchange.workshop.2026@gmail.com?subject=" + encodeURIComponent("DENUCHANGE Workshop \u2013 Change Request") + "&body=" + encodeURIComponent("Type of request: [ Registration Change / Abstract Change / Payment Issue / Other ]\n\nEmail used for registration:\n\nDescription of change or issue:\n\n")
      setDuplicateMailto(mailto)
      setServerError("duplicate")
      return
    }

    const hasText = data.abstract_text && data.abstract_text.trim().length > 0
    if (!hasText && !file) {
      setServerError("Please provide abstract text or upload a file.")
      return
    }

    let file_path: string | null = null

    if (file) {
      const ext = file.name.split(".").pop()
      const path = `${Date.now()}-${reg.last_name}_${reg.first_name}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from("abstracts")
        .upload(path, file)
      if (uploadErr) {
        setServerError("File upload failed. Please try again.")
        return
      }
      file_path = path
    }

    const { error } = await supabase.from("abstracts").insert([{
      first_name: reg.first_name,
      last_name: reg.last_name,
      email: normalizedEmail,
      affiliation: reg.affiliation,
      title: data.title,
      co_authors: data.co_authors ?? "",
      presentation_type: data.presentation_type,
      abstract_text: data.abstract_text?.trim() || null,
      file_path,
    }])

    if (error) {
      setServerError("Something went wrong. Please try again.")
      return
    }

    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "abstract",
        first_name: reg.first_name,
        last_name: reg.last_name,
        affiliation: reg.affiliation,
        ...data,
      }),
    }).catch(() => {})

    setSuccess(true)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) { reset(); setSuccess(false); setServerError(null); setDuplicateMailto(null); setFile(null) }
    setOpen(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        {success ? (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <DialogTitle>Abstract submitted!</DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you. Your abstract has been received and a confirmation email is on its way.
              Author notifications will be sent by <strong>June 15, 2026</strong>.
            </p>
            <Button onClick={() => handleOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Submit Your Abstract</DialogTitle>
              <DialogDescription>
                Max 500 words · English · Deadline: May 30, 2026
              </DialogDescription>
            </DialogHeader>

            <div className="mb-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground leading-relaxed">
              Type your abstract below <strong>or</strong> upload a file (.docx preferred).
              If uploading, rename your file: <code className="font-mono bg-muted px-1 rounded">Surname_Name_Topic.docx</code>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="abs-email">Registration Email *</Label>
                <Input id="abs-email" type="email" placeholder="Use the email you registered with" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abs-title">Abstract Title *</Label>
                <Input id="abs-title" {...register("title")} aria-invalid={!!errors.title} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abs-co_authors">
                  Co-authors{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input id="abs-co_authors" placeholder="e.g. Smith J., Doe A." {...register("co_authors")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abs-presentation_type">Presentation Type *</Label>
                <Select id="abs-presentation_type" {...register("presentation_type")} aria-invalid={!!errors.presentation_type}>
                  <option value="oral">Oral presentation</option>
                  <option value="poster">Poster presentation</option>
                </Select>
                {errors.presentation_type && <p className="text-xs text-destructive">{errors.presentation_type.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="abs-text">Abstract Text</Label>
                  <span className={`text-xs ${overLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {words} / 500 words
                  </span>
                </div>
                <Textarea
                  id="abs-text"
                  rows={7}
                  placeholder="Paste or type your abstract here (max 500 words)…"
                  {...register("abstract_text")}
                  aria-invalid={!!errors.abstract_text || overLimit}
                />
                {errors.abstract_text && <p className="text-xs text-destructive">{errors.abstract_text.message}</p>}
                {overLimit && <p className="text-xs text-destructive">Abstract exceeds 500 words.</p>}
              </div>

              {/* File upload */}
              <div className="space-y-1.5">
                <Label>
                  Or Upload File{" "}
                  <span className="text-muted-foreground font-normal">(.docx / .pdf, max 10 MB)</span>
                </Label>
                {file ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md text-sm">
                    <span className="flex-1 truncate text-foreground">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = "" }}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-5 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <UploadCloud className="h-6 w-6" />
                    <span>Click to select file</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".docx,.doc,.pdf"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>

              {serverError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {duplicateMailto ? (
                    <p>An abstract has already been submitted with this email. If you need to make changes, please{" "}
                      <a href={duplicateMailto} className="underline font-medium">contact us</a>.
                    </p>
                  ) : (
                    <p>{serverError}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || overLimit}>
                {isSubmitting ? "Submitting…" : "Submit Abstract"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
