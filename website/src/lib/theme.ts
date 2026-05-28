// DENUCHANGE Workshop Theme Configuration
// Blue & White color scheme based on the event branding

export const theme = {
  colors: {
    // Primary Blue Palette
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    // Accent - Deep Ocean Blue (from circular document)
    accent: {
      DEFAULT: "#074f6a",
      light: "#0a6b8f",
      dark: "#053d52",
    },
    // Neutral/White Palette
    white: "#ffffff",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  // Event-specific information
  event: {
    name: "IAG DENUCHANGE Workshop",
    dates: {
      workshop: "6-7 October 2026",
      fieldTrip: "8-9 October 2026",
      full: "6-9 October 2026",
    },
    location: "Naxos, Greece",
    deadlines: {
      abstractSubmission: "13 June 2026",
      authorNotifications: "15 June 2026",
      registration: "15 July 2026",
    },
  },
} as const;

export type Theme = typeof theme;

