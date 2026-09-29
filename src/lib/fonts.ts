import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

/**
 * Fonts are self-hosted by next/font (no layout shift, no runtime requests).
 * Archivo is variable on weight AND width: display type stretches and condenses
 * (font-stretch 62%–125%) as part of the motion language. Instrument Serif
 * italic marks the one word per headline that carries the emotion.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [archivo.variable, instrumentSerif.variable, jetbrainsMono.variable].join(" ");
