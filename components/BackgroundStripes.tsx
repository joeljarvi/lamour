// The site's background: twelve full-height columns, fixed behind
// everything, alternating white and neutral-100 (white first)
export default function BackgroundStripes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 grid h-screen grid-cols-12"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={i % 2 === 0 ? "bg-white" : "bg-neutral-100"} />
      ))}
    </div>
  );
}
