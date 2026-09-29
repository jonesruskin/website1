import { BatonPill } from "./baton-pill";

const journeys = [
  ["PDF", "E-signature"],
  ["Audio", "Transcription"],
  ["Image", "Background remover"],
  ["Transcript", "Summary"],
  ["Video", "Captions"],
  ["Logo", "Landing page"],
  ["CSV", "Chart"],
  ["Link", "QR code"],
] as const;

/** A slow ticker of matched journeys: output on the left, what it hands off to on the right. */
export function JourneyTicker() {
  const row = (suffix: string) =>
    journeys.map(([from, to]) => (
      <li key={`${suffix}-${from}`} className="flex items-center gap-6 pr-6">
        <span className="flex items-center gap-3">
          <span>{from}</span>
          <span aria-hidden className="text-signal-ink">
            →
          </span>
          <span className="text-muted-foreground">{to}</span>
        </span>
        <BatonPill className="h-2 w-6" />
      </li>
    ));

  return (
    <div aria-hidden className="overflow-hidden border-y py-4">
      <ul className="flex w-max animate-marquee font-mono text-sm tracking-widest whitespace-nowrap uppercase [--marquee-duration:60s]">
        {row("a")}
        {row("b")}
      </ul>
    </div>
  );
}
