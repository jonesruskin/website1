"use client";

import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { BatonPill } from "@/components/baton/marketing/baton-pill";
import { Button } from "@/components/ui/button";
import type { NavLink as NavLinkType } from "@/lib/site";

import { NavLink } from "./nav-link";

/**
 * Mobile menu built on the native Popover API: focus handling, Esc and
 * light-dismiss come from the browser. JS only closes it after navigation
 * (including same-page anchors like /#how, which don't change the pathname).
 */
export function MobileNav({ links, label = "Menu" }: { links: NavLinkType[]; label?: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popover = ref.current;
    if (popover?.matches(":popover-open")) popover.hidePopover();
  }, [pathname]);

  if (links.length === 0) return null;

  return (
    <>
      <button
        type="button"
        popoverTarget="mobile-nav"
        className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
      >
        <MenuIcon aria-hidden className="size-5" />
        <span className="sr-only">{label}</span>
      </button>
      <div
        ref={ref}
        id="mobile-nav"
        popover="auto"
        className="inset-0 m-0 h-dvh w-full max-w-none bg-background bg-lanes p-0 text-foreground [--lane-gap:5rem] backdrop:bg-transparent"
      >
        <div className="container-page flex h-16 items-center justify-between pt-2">
          <span
            className="flex items-center gap-2.5 font-display text-[1.375rem] font-extrabold tracking-[-0.045em]"
            style={{ fontStretch: "112%" }}
          >
            <BatonPill className="h-2.5 w-6 -rotate-[28deg]" />
            Baton
          </span>
          <button
            type="button"
            popoverTarget="mobile-nav"
            popoverTargetAction="hide"
            className="inline-flex size-10 items-center justify-center rounded-full border hover:bg-accent"
          >
            <XIcon aria-hidden className="size-5" />
            <span className="sr-only">Close {label.toLowerCase()}</span>
          </button>
        </div>
        <nav
          aria-label={label}
          className="container-page mt-10"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) ref.current?.hidePopover();
          }}
        >
          <ul className="flex flex-col">
            {links.map((link, i) => (
              <li key={link.href} className="border-b first:border-t">
                <NavLink
                  href={link.href}
                  external={link.external}
                  className="flex items-baseline gap-4 py-5 font-display text-5xl leading-none font-extrabold tracking-[-0.045em] transition-colors hover:text-signal-ink"
                >
                  <span className="w-6 font-mono text-xs font-semibold tracking-widest text-signal-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full pr-4 pl-6 font-semibold">
              <Link href="/sign-up">
                Join the network
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
