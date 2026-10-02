import { useEffect, useId, useState, type ReactNode } from "react"
import { ArrowLeft, ArrowUpRight, BusFront, ChevronDown, Info, MapPin } from "lucide-react"
import {
  agendaTitle,
  agendaSubtitle,
  agendaLocationDate,
  organizingBodies,
  organizingCommittee,
  scientificCommittee,
  supportedBy,
  venueName,
  venueUrl,
  busStationUrl,
  transportParagraphs,
  days,
  type AgendaBlock,
  type AgendaEntry,
} from "./agenda-data"
import "./agenda.css"

const shortDays = [
  { weekday: "Monday", date: "5 October" },
  { weekday: "Tuesday", date: "6 October" },
  { weekday: "Wednesday", date: "7 October" },
]

const agendaOutline = [
  { id: "agenda-organizers", label: "Organizing bodies", children: [] },
  { id: "agenda-venue", label: "Venue & transport", children: [] },
  { id: "agenda-program", label: "Program", children: [] },
  ...days.map((day, dayIndex) => ({
    id: day.id,
    label: `${shortDays[dayIndex].weekday} · ${shortDays[dayIndex].date}`,
    children: day.blocks.flatMap((block, index) => block.title ? [{
      id: `${day.id}-block-${index + 1}`,
      label: block.title.startsWith("Session ") ? block.title.split(":")[0]
        : block.tutors ? "VFT Laboratory" : block.title,
    }] : []),
  })),
]

function revealAgendaSection(id: string) {
  let targetId: string
  try { targetId = decodeURIComponent(id) } catch { return null }
  const target = document.getElementById(targetId)
  if (!target) return null
  const ownDisclosure = target.querySelector<HTMLDetailsElement>(":scope > details.agenda-collapsible")
  if (ownDisclosure) ownDisclosure.open = true
  for (let parent = target.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement) parent.open = true
  }
  return target
}

function setAgendaSectionsOpen(open: boolean) {
  document.querySelectorAll<HTMLDetailsElement>("main .agenda-collapsible").forEach((section) => { section.open = open })
}

function AgendaDisclosure({ title, headingId, level = 2, summaryClass = "", children }: {
  title: ReactNode; headingId: string; level?: 2 | 3; summaryClass?: string; children: ReactNode;
}) {
  const Heading = level === 2 ? "h2" : "h3"
  return (
    <details className="agenda-collapsible" open>
      <summary className={`agenda-summary ${summaryClass}`}>
        <Heading id={headingId}>{title}</Heading>
        <ChevronDown className="agenda-chevron" size={20} aria-hidden="true" />
      </summary>
      <div className="agenda-disclosure-content">{children}</div>
    </details>
  )
}

function AgendaContents({ activeSection }: { activeSection: string }) {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)")
    const update = () => { setIsOpen(desktop.matches) }
    update()
    desktop.addEventListener("change", update)
    return () => { desktop.removeEventListener("change", update) }
  }, [])

  return (
    <aside className="agenda-sidebar">
      <nav aria-label="Agenda sections" onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (event.target instanceof Element && event.target.closest('a[href^="#"]') && !window.matchMedia("(min-width: 1100px)").matches) setIsOpen(false)
      }}>
        <details className="agenda-contents" open={isOpen} onToggle={(event) => { setIsOpen(event.currentTarget.open) }}>
          <summary className="agenda-summary"><span>On this page</span><ChevronDown className="agenda-chevron" size={18} aria-hidden="true" /></summary>
          <div className="agenda-section-controls">
            <button type="button" onClick={() => { setAgendaSectionsOpen(true) }}>Expand all</button>
            <button type="button" onClick={() => { setAgendaSectionsOpen(false) }}>Collapse all</button>
          </div>
          <ul>
            {agendaOutline.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} aria-current={activeSection === section.id ? "location" : undefined}>{section.label}</a>
                {section.children.length > 0 && <ul>{section.children.map((child) => (
                  <li key={child.id}><a href={`#${child.id}`} aria-current={activeSection === child.id ? "location" : undefined}>{child.label}</a></li>
                ))}</ul>}
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </aside>
  )
}

function LinkedText({ text }: { text: string }) {
  return text.split(/(https:\/\/[^\s)]+)/g).map((part, index) =>
    part.startsWith("https://") ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
    ) : part,
  )
}

function VenueMapButton() {
  return (
    <a className="agenda-map-action" href={venueUrl} target="_blank" rel="noopener noreferrer">
      Open venue map<ArrowUpRight size={17} aria-hidden="true" />
    </a>
  )
}

function EntryDetail({ text }: { text: string }) {
  if (text.includes(venueUrl)) {
    return (
      <div className="agenda-detail agenda-entry-venue">
        <p>{text.replace(` — ${venueUrl}`, "")}</p>
        <VenueMapButton />
      </div>
    )
  }
  return <p className="agenda-detail"><LinkedText text={text} /></p>
}

function VenueAndTransport() {
  const [beforeIceTime, afterIceTime] = transportParagraphs[0].split("18:45")
  const departures = transportParagraphs[2].replace("Departures: ", "").split(" · ")

  return (
    <section className="agenda-information agenda-travel" id="agenda-venue" aria-labelledby="agenda-venue-heading" tabIndex={-1}>
      <AgendaDisclosure title="Workshop Venue" headingId="agenda-venue-heading">
      <div className="agenda-venue-band">
        <span className="agenda-venue-icon"><MapPin size={24} aria-hidden="true" /></span>
        <div className="agenda-venue-name">
          <p>{venueName}</p>
        </div>
        <VenueMapButton />
      </div>

      <div className="agenda-transport">
        <h3><BusFront size={20} aria-hidden="true" />Transport</h3>
        <div className="agenda-transport-grid">
          <div className="agenda-transfer-details">
            <h4>Ice breaker</h4>
            <p>{beforeIceTime}<time className="agenda-transfer-time" dateTime="2026-10-05T18:45">18:45</time>{afterIceTime}</p>
            <h4>Workshop transfers</h4>
            <p>{transportParagraphs[1].replace(` (${busStationUrl})`, "")}</p>
            <a className="agenda-station-map" href={busStationUrl} target="_blank" rel="noopener noreferrer">
              View bus station map<ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="agenda-departures">
            <span className="agenda-departures-label">Departures:</span>
            {departures.map((departure, index) => {
              const [date, time] = departure.split(" at ")
              return (
                <span className="agenda-departure-item" key={departure}>
                  {index > 0 && <span className="agenda-departure-divider" aria-hidden="true"> · </span>}
                  <span className="agenda-departure-row">
                    <span>{date} at</span>
                    <time dateTime={`${days[index + 1].date}T${time}`}>{time}</time>
                  </span>
                </span>
              )
            })}
          </p>
        </div>
        <div className="agenda-transport-note"><Info size={18} aria-hidden="true" /><p>{transportParagraphs[3]}</p></div>
      </div>
      </AgendaDisclosure>
    </section>
  )
}

function isAffiliatedPerson(text: string) {
  return /^(?:Prof\.|Dr\.)\s/.test(text) || text.startsWith("Vasilis Flerianos, ")
}

function PersonText({ text }: { text: string }) {
  const comma = text.indexOf(",")
  if (!isAffiliatedPerson(text) || comma < 0) return text

  return <><strong className="agenda-person-name">{text.slice(0, comma)}</strong>{text.slice(comma)}</>
}

function Speaker({ text }: { text: string }) {
  return <p className={isAffiliatedPerson(text) ? "agenda-person" : "agenda-speaker"}><PersonText text={text} /></p>
}

function SpeakerGroup({ title, speakers }: { title: string; speakers: string[] }) {
  const headingId = useId()
  return (
    <section className="agenda-speaker-group" aria-labelledby={headingId}>
      <h4 className="agenda-entry-title" id={headingId}>{title}</h4>
      {speakers.map((speaker) => <Speaker text={speaker} key={speaker} />)}
    </section>
  )
}

function Entry({ entry, hasBlockHeading }: { entry: AgendaEntry; hasBlockHeading: boolean }) {
  const Heading = hasBlockHeading ? "h4" : "h3"
  const isKeynote = entry.paragraphs?.includes("Invited keynote lecture")
  const openingIndex = entry.paragraphs?.indexOf("Event Opening") ?? -1
  const paragraphs = openingIndex >= 0 ? entry.paragraphs?.slice(0, openingIndex) : entry.paragraphs
  return (
    <li className={`agenda-entry${entry.kind ? ` agenda-entry--${entry.kind}` : ""}`}>
      <p className="agenda-time">{entry.time}</p>
      <div className="agenda-entry-content">
        {isKeynote && <p className="agenda-keynote-label">Invited keynote lecture</p>}
        {openingIndex >= 0 ? (
          <>
            <SpeakerGroup title={entry.title} speakers={entry.speakers ?? []} />
            <SpeakerGroup title="Event Opening" speakers={entry.paragraphs?.slice(openingIndex + 1) ?? []} />
          </>
        ) : (
          <>
            <Heading className="agenda-entry-title">{entry.title}</Heading>
            {entry.speakers?.map((speaker) => <Speaker text={speaker} key={speaker} />)}
          </>
        )}
        {paragraphs?.filter((paragraph) => paragraph !== "Invited keynote lecture").map((paragraph) => <EntryDetail text={paragraph} key={paragraph} />)}
      </div>
    </li>
  )
}

function Block({ block, id }: { block: AgendaBlock; id?: string }) {
  const tone = block.title?.startsWith("Session 1") ? "sediment"
    : block.title?.startsWith("Session 2") ? "landscape"
    : block.title?.startsWith("Session 3") ? "climate"
    : block.title?.startsWith("Session 4") ? "coastal"
    : block.posters ? "posters"
    : block.tutors ? "laboratory"
    : block.title === "Opening" ? "opening" : "neutral"

  const contents = <>
      {block.title && (block.chairs || block.subtitle || block.description || block.tutors) && (
        <div className="agenda-block-context">
          {block.chairs && <p className="agenda-chairs">{block.chairs}</p>}
          {block.subtitle && <p className="agenda-block-subtitle">{block.subtitle}</p>}
          {block.description && <p className="agenda-block-description">{block.description}</p>}
          {block.tutors && <p className="agenda-tutors">{block.tutors}</p>}
        </div>
      )}
      <ol className="agenda-entries">
        {block.entries.map((entry, index) => <Entry entry={entry} hasBlockHeading={Boolean(block.title)} key={`${entry.time}-${index}`} />)}
      </ol>
      {block.posters && (
        <ul className="agenda-posters" aria-label="Poster presentations">
          {block.posters.map((poster) => (
            <li key={poster.number}>
              <span className="agenda-poster-number">{poster.number}.</span>
              <div>
                <h4>{poster.title}</h4>
                <p className="agenda-speaker">{poster.authors}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>

  return (
    <section className={`agenda-block agenda-block--${tone}`} id={id} aria-label={block.title} tabIndex={id ? -1 : undefined}>
      {block.title && id ? (
        <AgendaDisclosure title={block.title} headingId={`${id}-heading`} level={3} summaryClass="agenda-block-heading">
          {contents}
        </AgendaDisclosure>
      ) : contents}
    </section>
  )
}

export function AgendaPage() {
  const [activeSection, setActiveSection] = useState("agenda-organizers")

  useEffect(() => {
    const previousTitle = document.title
    document.title = "Agenda | IAG DENUCHANGE Workshop 2026"
    const followHash = () => {
      const target = revealAgendaSection(window.location.hash.slice(1))
      // Lazy routes mount after the browser's initial fragment scroll attempt.
      if (target) target.scrollIntoView({ block: "start" })
    }
    followHash()
    window.addEventListener("hashchange", followHash)
    return () => {
      document.title = previousTitle
      window.removeEventListener("hashchange", followHash)
    }
  }, [])

  useEffect(() => {
    const sections = agendaOutline.flatMap((section) => [section, ...section.children])
      .map((section) => document.getElementById(section.id)).filter((section) => section !== null)
    let frame = 0
    const update = () => {
      frame = 0
      const visible = sections.filter((section) => section.getClientRects().length > 0 && !section.closest("details:not([open])"))
      const current = visible.filter((section) => section.getBoundingClientRect().top <= 64).at(-1) ?? visible[0]
      if (current) setActiveSection(current.id)
    }
    const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    document.addEventListener("toggle", scheduleUpdate, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      document.removeEventListener("toggle", scheduleUpdate, true)
    }
  }, [])

  useEffect(() => {
    let closedSections: HTMLDetailsElement[] | null = null
    const beforePrint = () => {
      if (closedSections !== null) return
      closedSections = [...document.querySelectorAll<HTMLDetailsElement>("main .agenda-collapsible:not([open])")]
      setAgendaSectionsOpen(true)
    }
    const afterPrint = () => { closedSections?.forEach((section) => { section.open = false }); closedSections = null }
    window.addEventListener("beforeprint", beforePrint)
    window.addEventListener("afterprint", afterPrint)
    return () => {
      window.removeEventListener("beforeprint", beforePrint)
      window.removeEventListener("afterprint", afterPrint)
    }
  }, [])

  return (
    <div className="agenda-page" onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const target = revealAgendaSection(link.hash.slice(1))
      const focusTarget = target?.querySelector<HTMLElement>(":scope > details > summary") ?? target
      focusTarget?.focus({ preventScroll: true })
    }}>
      <a className="agenda-skip" href="#agenda-program">Skip to program</a>
      <header className="agenda-hero">
        <div className="agenda-wrap">
          <div className="agenda-brand-row">
            <a href={import.meta.env.BASE_URL} className="agenda-home"><ArrowLeft size={16} aria-hidden="true" />Workshop website</a>
          </div>
          <h1>{agendaTitle}</h1>
          <p className="agenda-subtitle">{agendaSubtitle}</p>
          <p className="agenda-location">{agendaLocationDate}</p>
        </div>
      </header>

      <div className="agenda-layout">
      <AgendaContents activeSection={activeSection} />
      <main className="agenda-content">
        <section className="agenda-information agenda-organizers" id="agenda-organizers" aria-labelledby="agenda-organizers-heading" tabIndex={-1}>
          <AgendaDisclosure title="Organizing bodies" headingId="agenda-organizers-heading">
          <ul className="agenda-organizing-bodies">
            {organizingBodies.map((body) => (
              <li key={body.name}>
                <div className="agenda-organization-logo"><img src={`${import.meta.env.BASE_URL}${body.image.replace(/^\//, "")}`} alt="" width="240" height="112" loading="lazy" /></div>
                <span>{body.name}</span>
              </li>
            ))}
          </ul>
          <div className="agenda-supporter">
            <div className="agenda-supporter-logo"><img src={`${import.meta.env.BASE_URL}${supportedBy.image.replace(/^\//, "")}`} alt="" width="180" height="144" loading="lazy" /></div>
            <div><h3>Supported by</h3><p>{supportedBy.name}</p></div>
          </div>
          <div className="agenda-committees">
            <section aria-labelledby="agenda-organizing-committee-heading">
              <h3 id="agenda-organizing-committee-heading">Organizing Committee</h3>
              <ul>{organizingCommittee.map((member) => <li key={member}><PersonText text={member} /></li>)}</ul>
            </section>
            <section aria-labelledby="agenda-scientific-committee-heading">
              <h3 id="agenda-scientific-committee-heading">Scientific Committee</h3>
              <ul>{scientificCommittee.map((member) => <li key={member}><PersonText text={member} /></li>)}</ul>
            </section>
          </div>
          </AgendaDisclosure>
        </section>

        <VenueAndTransport />

        <div className="agenda-program" id="agenda-program" tabIndex={-1}>
        {days.map((day) => (
          <section className="agenda-day" id={day.id} key={day.id} aria-labelledby={`${day.id}-heading`} tabIndex={-1}>
            <AgendaDisclosure title={<time dateTime={day.date}>{day.label}</time>} headingId={`${day.id}-heading`} summaryClass="agenda-day-heading">
              {day.blocks.map((block, index) => <Block key={index} block={block} id={block.title ? `${day.id}-block-${index + 1}` : undefined} />)}
            </AgendaDisclosure>
          </section>
        ))}
        </div>
      </main>
      </div>
      <footer className="agenda-footer"><div className="agenda-wrap"><span>{agendaTitle}</span><a href="#agenda-program">Back to program</a></div></footer>
    </div>
  )
}
