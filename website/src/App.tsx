import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { KeyInfo } from "@/components/sections/KeyInfo"
import { About } from "@/components/sections/About"
import { Program } from "@/components/sections/Program"
import { FieldTrip } from "@/components/sections/FieldTrip"
import { Registration } from "@/components/sections/Registration"
import { Committees } from "@/components/sections/Committees"
import { Travel } from "@/components/sections/Travel"
import { Contact } from "@/components/sections/Contact"

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <KeyInfo />
        <About />
        <Program />
        <FieldTrip />
        <Registration />
        <Committees />
        <Travel />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
