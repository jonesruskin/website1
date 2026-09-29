import { Wordmark } from "@/components/baton/marketing/wordmark";
import { headerActions } from "@/generated/header-actions";
import siteConfig from "@/site.config";

import { HeaderFrame } from "./header-frame";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

/**
 * A bar that sits flat on the page, then detaches into a floating pill once you scroll
 * (see HeaderFrame). Nav links, header actions and the theme toggle come from config.
 *
 * The pill's box never changes size, so scrolling causes no layout shift: at the top its
 * two halves are simply pushed out to the page gutters with a transform (measured with
 * container-query units), and its surface is invisible. Scrolled, the halves glide back in
 * and the surface fades up.
 */
export function SiteHeader() {
  const links = siteConfig.nav.header;
  const slide =
    "transition-[translate] duration-500 ease-(--motion-ease) motion-reduce:transition-none";
  const settled = "group-data-[scrolled=true]/header:translate-x-0";

  return (
    <HeaderFrame>
      <div className="[container-type:inline-size] container-page h-full pt-2">
        <div className="pointer-events-auto relative mx-auto flex h-12 max-w-4xl items-center justify-between gap-2 px-3 [--d:calc((100cqw-min(100cqw,56rem))/2+0.75rem)]">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full border bg-background/90 opacity-0 shadow-md backdrop-blur-xl transition-opacity duration-500 group-data-[scrolled=true]/header:opacity-100 motion-reduce:transition-none"
          />
          <div className={`flex min-w-0 -translate-x-(--d) items-center gap-2 ${slide} ${settled}`}>
            <Wordmark name={siteConfig.name} />
            {links.length > 0 && (
              <nav aria-label="Main" className="hidden lg:ml-6 lg:block">
                <ul className="flex items-center gap-0.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <NavLink
                        href={link.href}
                        external={link.external}
                        className="rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
          <div
            className={`flex translate-x-(--d) items-center gap-1 ${slide} ${settled} [&_[data-slot=button]]:rounded-full`}
          >
            {headerActions.map((Action, index) => (
              <Action key={index} />
            ))}
            <ThemeToggle className="rounded-full" />
            <MobileNav links={links} />
          </div>
        </div>
      </div>
    </HeaderFrame>
  );
}
