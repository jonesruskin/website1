"use client";

import { useTransform, type MotionValue } from "motion/react";

type Widen<T> = T extends number ? number : string;

/**
 * `useTransform` for scroll progress, with the input range padded out to 0 and 1.
 * Scroll-linked values can run natively on the browser's scroll timeline, and a
 * range that stops short of 1 would let the tail drift back to the element's base
 * style instead of holding the last value.
 */
export function useRange<T extends number | string>(
  progress: MotionValue<number>,
  input: number[],
  output: T[],
): MotionValue<Widen<T>> {
  const from = input[0]!;
  const to = input[input.length - 1]!;
  const inputs = [...(from > 0 ? [0] : []), ...input, ...(to < 1 ? [1] : [])];
  const outputs = [
    ...(from > 0 ? [output[0]!] : []),
    ...output,
    ...(to < 1 ? [output[output.length - 1]!] : []),
  ];
  return useTransform(progress, inputs, outputs) as unknown as MotionValue<Widen<T>>;
}
