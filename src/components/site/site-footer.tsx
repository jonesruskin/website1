import { BatonPill } from "@/components/baton/marketing/baton-pill";
import siteConfig from "@/site.config";

import { NavLink } from "./nav-link";

export function SiteFooter() {
  const { footer, legal } = siteConfig.nav;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t">
      <div className="container-page pt-16 pb-10 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="max-w-[16ch] font-display text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] text-balance sm:text-5xl">
              Make yours a <span className="accent-serif text-[1.12em] font-normal">doorway.</span>
            </p>
            <p className="mt-6 flex items-center gap-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
              <BatonPill className="h-2 w-6" />
              One script tag · 1:1 credits · Free
            </p>
          </div>
          {footer.length > 0 && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              {footer.map((group) => (
                <nav key={group.title} aria-label={group.title}>
                  <h2 className="mb-4 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    {group.title}
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <NavLink
                          href={link.href}
                          external={link.external}
                          className="text-[0.9375rem] font-medium underline-offset-4 transition-colors hover:text-signal-ink hover:underline"
                        >
                          {link.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}
          </p>
          {(legal.length > 0 || siteConfig.socials.length > 0) && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legal.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {siteConfig.socials.map((social) => (
                <li key={social.href}>
                  <NavLink
                    href={social.href}
                    external
                    className="capitalize transition-colors hover:text-foreground"
                  >
                    {social.label ?? social.platform}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* The wordmark runs edge to edge: the SVG stretches the glyphs to the full width. */}
      <div aria-hidden className="bg-lanes select-none [--lane-gap:3rem]">
        <svg
          viewBox="19 3 962 219"
          className="block h-auto w-full text-foreground"
          role="presentation"
        >
          <text
            x="0"
            y="222"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fill="currentColor"
            className="font-display"
            style={{ fontSize: 314, fontWeight: 800, fontStretch: "125%" }}
          >
            BATON
          </text>
        </svg>
      </div>
    </footer>
  );
}
