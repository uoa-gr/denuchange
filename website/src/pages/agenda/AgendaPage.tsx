import { useEffect, useId, useState } from "react"
import { ArrowLeft, MapPin, Printer } from "lucide-react"
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
  transportParagraphs,
  programPreface,
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

function LinkedText({ text }: { text: string }) {
  return text.split(/(https:\/\/[^\s)]+)/g).map((part, index) =>
    part.startsWith("https://") ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
    ) : part,
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
        {paragraphs?.filter((paragraph) => paragraph !== "Invited keynote lecture").map((paragraph) => <p className="agenda-detail" key={paragraph}><LinkedText text={paragraph} /></p>)}
      </div>
    </li>
  )
}

function Block({ block }: { block: AgendaBlock }) {
  const tone = block.title?.startsWith("Session 1") ? "sediment"
    : block.title?.startsWith("Session 2") ? "landscape"
    : block.title?.startsWith("Session 3") ? "climate"
    : block.title?.startsWith("Session 4") ? "coastal"
    : block.posters ? "posters"
    : block.tutors ? "laboratory"
    : block.title === "Opening" ? "opening" : "neutral"

  return (
    <section className={`agenda-block agenda-block--${tone}`} aria-label={block.title}>
      {block.title && (
        <header className="agenda-block-heading">
          {block.chairs && <p className="agenda-chairs">{block.chairs}</p>}
          <h3>{block.title}</h3>
          {block.subtitle && <p className="agenda-block-subtitle">{block.subtitle}</p>}
          {block.description && <p className="agenda-block-description">{block.description}</p>}
          {block.tutors && <p className="agenda-tutors">{block.tutors}</p>}
        </header>
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
    </section>
  )
}

export function AgendaPage() {
  const [activeDay, setActiveDay] = useState(days[0].id)

  useEffect(() => {
    const previousTitle = document.title
    document.title = "Agenda | IAG DENUCHANGE Workshop 2026"
    // Lazy routes mount after the browser's initial fragment scroll attempt.
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    const sections = days.map((day) => document.getElementById(day.id)).filter((section) => section !== null)
    const observer = new IntersectionObserver(() => {
      // Two days can intersect together; choose the one at the reading position.
      const current = sections.find((section) => section.getBoundingClientRect().bottom > 160) ?? sections.at(-1)
      if (current) setActiveDay(current.id)
    }, { rootMargin: "-160px 0px -10px 0px" })
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="agenda-page">
      <a className="agenda-skip" href="#agenda-program">Skip to program</a>
      <header className="agenda-hero">
        <div className="agenda-wrap">
          <div className="agenda-brand-row">
            <a href={import.meta.env.BASE_URL} className="agenda-home"><ArrowLeft size={16} aria-hidden="true" />Workshop website</a>
            <div className="agenda-brand-logos" aria-label="Workshop organizers">
              <img src={`${import.meta.env.BASE_URL}images/logo-denuchange.jpg`} alt="DENUCHANGE" width="48" height="48" />
              <img src={`${import.meta.env.BASE_URL}images/logo-iag.jpg`} alt="International Association of Geomorphologists" width="56" height="48" />
              <img src={`${import.meta.env.BASE_URL}images/logo-nkua.jpg`} alt="National and Kapodistrian University of Athens" width="48" height="48" />
            </div>
          </div>
          <h1>{agendaTitle}</h1>
          <p className="agenda-subtitle">{agendaSubtitle}</p>
          <p className="agenda-location">{agendaLocationDate}</p>
          <div className="agenda-actions">
            <a href="#agenda-venue"><MapPin size={16} aria-hidden="true" />Venue &amp; transport</a>
            <a href="#agenda-organizers">Organizers</a>
            <button type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Print program</button>
          </div>
        </div>
      </header>

      <nav className="agenda-day-nav" aria-label="Agenda days">
        <div className="agenda-wrap">
          {days.map((day, index) => (
            <a href={`#${day.id}`} key={day.id} aria-current={activeDay === day.id ? "location" : undefined}>
              <span>{shortDays[index].weekday}</span>
              <strong>{shortDays[index].date}</strong>
            </a>
          ))}
        </div>
      </nav>

      <main className="agenda-wrap" id="agenda-program" tabIndex={-1}>
        <div className="agenda-program-intro">
          <h2>Program</h2>
          <p><a href="#monday">{programPreface}</a></p>
        </div>
        {days.map((day) => (
          <section className="agenda-day" id={day.id} key={day.id} aria-labelledby={`${day.id}-heading`}>
            <h2 id={`${day.id}-heading`} className="agenda-day-heading"><time dateTime={day.date}>{day.label}</time></h2>
            {day.blocks.map((block, index) => <Block key={index} block={block} />)}
          </section>
        ))}

        <section className="agenda-information" id="agenda-venue" aria-labelledby="agenda-venue-heading">
          <h2 id="agenda-venue-heading">Workshop Venue</h2>
          <p className="agenda-venue-link"><a href={venueUrl} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" />{venueName}</a></p>
          <h3>Transport</h3>
          {transportParagraphs.map((paragraph) => <p key={paragraph}><LinkedText text={paragraph} /></p>)}
        </section>

        <section className="agenda-information" id="agenda-organizers" aria-labelledby="agenda-organizers-heading">
          <h2 id="agenda-organizers-heading">Organizing bodies</h2>
          <ul className="agenda-organizing-bodies">
            {organizingBodies.map((body) => (
              <li key={body.name}><img src={`${import.meta.env.BASE_URL}${body.image.replace(/^\//, "")}`} alt="" width="72" height="64" loading="lazy" /><span>{body.name}</span></li>
            ))}
          </ul>
          <h3>Supported by</h3>
          <div className="agenda-supporter"><img src={`${import.meta.env.BASE_URL}${supportedBy.image.replace(/^\//, "")}`} alt="" width="72" height="64" loading="lazy" /><p>{supportedBy.name}</p></div>
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
        </section>
      </main>
      <footer className="agenda-footer"><div className="agenda-wrap"><span>{agendaTitle}</span><a href="#agenda-program">Back to program</a></div></footer>
    </div>
  )
}
