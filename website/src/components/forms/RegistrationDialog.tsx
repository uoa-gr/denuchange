import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2, Mail } from "lucide-react"
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
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email address"),
  affiliation: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  registration_type: z.enum(["regular_full", "student_full", "meeting_only", "accompanying"], {
    error: "Please select a registration type",
  }),
  abstract_intent: z.enum(["oral", "poster", "none"]),
  dietary: z.enum(["none", "vegetarian", "vegan", "kosher", "gluten_free", "other"]),
  dietary_other: z.string().optional(),
  special_requirements: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function RegistrationDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [emailVerifying, setEmailVerifying] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [duplicateMailto, setDuplicateMailto] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { abstract_intent: "none", dietary: "none" },
  })

  const dietary = watch("dietary")
  const emailValue = watch("email")

  const verifyEmail = async () => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return
    setEmailVerifying(true)
    setEmailVerified(false)
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "verify", email: emailValue }),
      })
      setEmailVerified(true)
    } catch {
      // silent
    } finally {
      setEmailVerifying(false)
    }
  }

  const SUPPORT_MAILTO = "mailto:denuchange.workshop.2026@gmail.com?subject=" + encodeURIComponent("DENUCHANGE Workshop \u2013 Change Request") + "&body=" + encodeURIComponent("Type of request: [ Registration Change / Abstract Change / Payment Issue / Other ]\n\nEmail used for registration:\n\nDescription of change or issue:\n\n")

  const onSubmit = async (data: FormData) => {
    setServerError(null)

    const normalizedEmail = data.email.trim().toLowerCase()
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle()

    if (existing) {
      setDuplicateMailto(SUPPORT_MAILTO)
      setServerError("duplicate")
      return
    }

    const { error } = await supabase.from("registrations").insert([{
      ...data,
      email: normalizedEmail,
      dietary_other: data.dietary === "other" ? (data.dietary_other ?? "") : null,
      special_requirements: data.special_requirements ?? "",
    }])

    if (error) {
      setServerError("Something went wrong. Please try again.")
      return
    }

    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "registration", ...data }),
    }).catch(() => {})

    setSuccess(true)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) { reset(); setSuccess(false); setServerError(null); setEmailVerified(false); setDuplicateMailto(null) }
    setOpen(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        {success ? (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <DialogTitle>Registration submitted!</DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you for registering. A confirmation email is on its way.
              Please complete your bank transfer and upload your payment receipt
              using the button below.
            </p>
            <Button onClick={() => handleOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Register for the Workshop</DialogTitle>
              <DialogDescription>
                IAG DENUCHANGE Workshop · 6–9 October 2026 · Naxos, Greece
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-first_name">First Name *</Label>
                  <Input id="reg-first_name" {...register("first_name")} aria-invalid={!!errors.first_name} />
                  {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-last_name">Last Name *</Label>
                  <Input id="reg-last_name" {...register("last_name")} aria-invalid={!!errors.last_name} />
                  {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email *</Label>
                <div className="flex gap-2">
                  <Input id="reg-email" type="email" className="flex-1" {...register("email")} aria-invalid={!!errors.email} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    disabled={emailVerifying || !emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)}
                    onClick={verifyEmail}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {emailVerifying ? "Sending…" : "Verify"}
                  </Button>
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                {emailVerified && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verification email sent — check your inbox to make sure you added the correct email.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-affiliation">Affiliation *</Label>
                <Input id="reg-affiliation" placeholder="University / Institution" {...register("affiliation")} aria-invalid={!!errors.affiliation} />
                {errors.affiliation && <p className="text-xs text-destructive">{errors.affiliation.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-country">Country *</Label>
                <Input id="reg-country" {...register("country")} aria-invalid={!!errors.country} />
                {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-registration_type">Registration Type *</Label>
                <Select id="reg-registration_type" {...register("registration_type")} aria-invalid={!!errors.registration_type}>
                  <option value="">Select…</option>
                  <option value="regular_full">Regular – Workshop + Field Trip — €450</option>
                  <option value="student_full">Student – Workshop + Field Trip — €300</option>
                  <option value="meeting_only">Meeting Only (Regular or Student) — €100</option>
                  <option value="accompanying">Accompanying Person – Field Trip Only — €300</option>
                </Select>
                {errors.registration_type && <p className="text-xs text-destructive">{errors.registration_type.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-abstract_intent">Abstract Submission</Label>
                <Select id="reg-abstract_intent" {...register("abstract_intent")}>
                  <option value="none">Not submitting an abstract</option>
                  <option value="oral">Oral presentation</option>
                  <option value="poster">Poster presentation</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-dietary">Dietary Requirements</Label>
                <Select id="reg-dietary" {...register("dietary")}>
                  <option value="none">None</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="kosher">Kosher</option>
                  <option value="gluten_free">Gluten-free</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              {dietary === "other" && (
                <div className="space-y-1.5">
                  <Label htmlFor="reg-dietary_other">Please specify *</Label>
                  <Input id="reg-dietary_other" {...register("dietary_other")} />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="reg-special">
                  Special Requirements{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="reg-special"
                  rows={2}
                  placeholder="Accessibility needs, etc."
                  {...register("special_requirements")}
                />
              </div>

              {serverError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {duplicateMailto ? (
                    <p>A registration with this email already exists. If you need to make changes, please{" "}
                      <a href={duplicateMailto} className="underline font-medium">contact us</a>.
                    </p>
                  ) : (
                    <p>{serverError}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit Registration"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
