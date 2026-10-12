export default function Footer() {
  return (
    <footer className="flex items-center justify-center w-full h-dvh bg-foreground text-background">
      <span className="font-baskervilleSC lowercase text-lg tracking-widest">
        © {new Date().getFullYear()} L&apos;Amour — La Mort
      </span>
    </footer>
  );
}
