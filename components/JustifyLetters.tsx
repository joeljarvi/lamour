// A word (or words) split into its letters, spread across the full width
// (justify-between). A space becomes an empty slot of its own, so words stay
// apart. Read by screen readers as the whole text, not letter by letter
export default function JustifyLetters({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      aria-label={text}
      className={`flex w-full font-johnSans pt-1.5  pb-1 text-xs  justify-between ${className}`}
    >
      {/* Array.from splits by character, so letters like Ö stay whole */}
      {Array.from(text).map((letter, i) => (
        <span key={i} aria-hidden>
          {letter === " " ? " " : letter}
        </span>
      ))}
    </span>
  );
}
