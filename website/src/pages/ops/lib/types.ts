export interface Registration {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  affiliation: string
  country: string
  registration_type: string
  abstract_intent: string
  dietary: string
  dietary_other: string | null
  special_requirements: string
  payment_confirmed: boolean
}

export interface Abstract {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  affiliation: string
  title: string
  co_authors: string
  abstract_text: string | null
  file_path: string | null
  presentation_type: "oral" | "poster"
}

export interface PaymentReceipt {
  id: string
  created_at: string
  email: string
  file_path: string
  notes: string
}

export interface OpsData {
  registrations: Registration[]
  abstracts: Abstract[]
  payment_receipts: PaymentReceipt[]
}
