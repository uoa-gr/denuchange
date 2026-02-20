import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { FadeIn } from "@/components/ui/fade-in"
import { Hero } from "@/components/sections/Hero"
import { KeyInfo } from "@/components/sections/KeyInfo"
import { About } from "@/components/sections/About"
import { Program } from "@/components/sections/Program"
import { FieldTrip } from "@/components/sections/FieldTrip"
import { Labs } from "@/components/sections/Labs"
import { Registration } from "@/components/sections/Registration"
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
        <FadeIn delay={100}><KeyInfo /></FadeIn>
        <FadeIn delay={200}><About /></FadeIn>
        <FadeIn><Program /></FadeIn>
        <FadeIn><Labs /></FadeIn>
        <FadeIn><FieldTrip /></FadeIn>
        <FadeIn><Registration /></FadeIn>
        <FadeIn><Committees /></FadeIn>
        <FadeIn><Travel /></FadeIn>
        <FadeIn><Contact /></FadeIn>
      </main>
      <Footer />
    </div>
  )
}

export default App
