import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { FadeIn } from "@/components/ui/fade-in"
import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Program } from "@/components/sections/Program"
import { FieldTrip } from "@/components/sections/FieldTrip"
import { Labs } from "@/components/sections/Labs"
import { Registration } from "@/components/sections/Registration"
import { AttendeeApp } from "@/components/sections/AttendeeApp"
import { Committees } from "@/components/sections/Committees"
import { Travel } from "@/components/sections/Travel"
import { Contact } from "@/components/sections/Contact"
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Analytics />
      <Navigation />
      <main className="flex-1">
        <Hero />
        <FadeIn delay={100}><About /></FadeIn>
        <FadeIn direction="right"><Program /></FadeIn>
        <FadeIn direction="left"><Labs /></FadeIn>
        <FadeIn direction="right"><FieldTrip /></FadeIn>
        <FadeIn><Registration /></FadeIn>
        <FadeIn><AttendeeApp /></FadeIn>
        <FadeIn direction="left"><Committees /></FadeIn>
        <FadeIn direction="right"><Travel /></FadeIn>
        <FadeIn><Contact /></FadeIn>
      </main>
      <Footer />
    </div>
  )
}

export default App
