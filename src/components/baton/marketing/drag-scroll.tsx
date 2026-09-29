"use client";

import { useRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * A horizontally scrolling, scroll-snapping lane you can also drag with a mouse.
 * Touch and trackpads use native scrolling; keyboard users tab through the links.
 */
export function DragScroll({ className, children, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-grab snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain pb-6 active:cursor-grabbing [&::-webkit-scrollbar]:hidden",
        className,
      )}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        drag.current = {
          active: true,
          startX: e.clientX,
          startLeft: ref.current?.scrollLeft ?? 0,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active || !ref.current) return;
        const dx = e.clientX - d.startX;
        if (Math.abs(dx) > 4) d.moved = true;
        if (d.moved) {
          ref.current.style.scrollSnapType = "none";
          ref.current.scrollLeft = d.startLeft - dx;
        }
      }}
      onPointerUp={() => {
        drag.current.active = false;
        if (ref.current) ref.current.style.scrollSnapType = "";
      }}
      onPointerLeave={() => {
        drag.current.active = false;
        if (ref.current) ref.current.style.scrollSnapType = "";
      }}
      onClickCapture={(e) => {
        // A drag must not follow the link it ended on.
        if (drag.current.moved) {
          e.preventDefault();
          e.stopPropagation();
          drag.current.moved = false;
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}
