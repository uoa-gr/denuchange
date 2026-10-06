export interface PasswordlessUserInfo {
  firstName: string
  lastName: string
  affiliation?: string
  country?: string
  registrationType?: string
}

// Server-only access policy. Guest profiles never grant administrative access.
export const PASSWORDLESS_USERS: Readonly<Record<string, PasswordlessUserInfo>> = {
  "ch.koromilas@prv.ypeka.gr": {
    firstName: "Χρήστος",
    lastName: "Κορομηλάς",
    affiliation: "Υπουργείο Περιβάλλοντος και Ενέργειας (ΥΠΕΝ / YPEKA)",
    country: "Greece",
    registrationType: "regular_full",
  },
  "mpouzasd@prv.ypeka.gr": {
    firstName: "Δημήτριος",
    lastName: "Μπούζας",
    affiliation: "Υπουργείο Περιβάλλοντος και Ενέργειας (ΥΠΕΝ / YPEKA)",
    country: "Greece",
    registrationType: "regular_full",
  },
  "apittaras@icloud.com": {
    firstName: "Antonis",
    lastName: "Pittaras",
    affiliation: "Laguna Coast Resort",
    country: "Greece",
  },
  "office@lagunacoast.org": {
    firstName: "Laguna Coast",
    lastName: "Office",
    affiliation: "Laguna Coast",
    country: "Greece",
  },
  "operations@lagunacoastresort.com": {
    firstName: "Eleni",
    lastName: "Alachmaneti",
  },
  "kkefalea@gmail.com": {
    firstName: "Kirki",
    lastName: "Kefalea",
  },
  "noamgr@geo.haifa.ac.il": {
    firstName: "Noam",
    lastName: "Greenbaum",
  },
}

export function getPasswordlessUser(email: string): PasswordlessUserInfo | undefined {
  const normalized = email.trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(PASSWORDLESS_USERS, normalized)
    ? PASSWORDLESS_USERS[normalized]
    : undefined
}
