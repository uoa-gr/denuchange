export function LinkedText({ text }: { text: string }) {
  return <>{text.split(/(https:\/\/[^\s)]+)/g).map((part, index) =>
    part.startsWith("https://") ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 break-all"
      >
        {part}
      </a>
    ) : part
  )}</>
}
