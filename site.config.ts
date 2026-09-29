import { installedModules } from "@/generated/modules";
import { defineSite } from "@/lib/site";

/**
 * Single source of truth for this site. Modules read their own blocks from here
 * (e.g. `billing`, `contact`) and the site CLI adds nav entries when installing.
 */
export default defineSite({
  name: "Baton",
  description: "The recommendation network for the moment your tool finishes its job.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://baton.run",
  locale: "en",
  author: {
    name: "Baton",
  },
  socials: [],
  nav: {
    header: [
      {
        label: "How it works",
        href: "/#how",
      },
      {
        label: "Trails",
        href: "/trails",
      },
      {
        label: "Docs",
        href: "/docs",
      },
      {
        label: "Pricing",
        href: "/pricing",
      },
    ],
    footer: [
      {
        title: "Company",
        links: [
          {
            label: "Blog",
            href: "/blog",
          },
          {
            label: "Contact",
            href: "/contact",
          },
        ],
      },
      {
        title: "Product",
        links: [
          {
            label: "For makers",
            href: "/makers",
          },
          {
            label: "Trails",
            href: "/trails",
          },
          {
            label: "Docs",
            href: "/docs",
          },
          {
            label: "Changelog",
            href: "/changelog",
          },
          {
            label: "Dashboard",
            href: "/dashboard",
          },
        ],
      },
      {
        title: "Support",
        links: [
          {
            label: "FAQ",
            href: "/faq",
          },
        ],
      },
    ],
    legal: [
      {
        label: "Cookie settings",
        href: "#cookie-settings",
      },
      {
        label: "Privacy",
        href: "/legal/privacy",
      },
      {
        label: "Terms",
        href: "/legal/terms",
      },
      {
        label: "Cookies",
        href: "/legal/cookies",
      },
    ],
    dashboard: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: "layout-dashboard",
      },
      {
        label: "Tools",
        href: "/tools",
        icon: "box",
      },
      {
        label: "Network",
        href: "/network",
        icon: "users",
      },
      {
        label: "Credits",
        href: "/credits",
        icon: "activity",
      },
    ],
    settings: [
      {
        label: "Profile",
        href: "/settings",
        icon: "user",
      },
      {
        label: "Security",
        href: "/settings/security",
        icon: "shield",
      },
      {
        label: "Account",
        href: "/settings/account",
        icon: "settings",
      },
      {
        label: "Billing",
        href: "/settings/billing",
        icon: "credit-card",
      },
      {
        label: "Team",
        href: "/settings/team",
        icon: "users",
      },
      {
        label: "API keys",
        href: "/settings/api-keys",
        icon: "key-round",
      },
    ],
    admin: [
      {
        label: "Overview",
        href: "/admin",
        icon: "shield",
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: "users",
      },
    ],
  },
  modules: installedModules,
  features: {},
  seo: {
    titleTemplate: "%s · Baton",
    keywords: [
      "distribution",
      "cross-promotion",
      "recommendation network",
      "indie makers",
      "user acquisition",
      "tool directory",
    ],
  },
  analytics: {
    consent: "cookieless-exempt",
  },
  cookieConsent: {
    title: "Cookies",
    description:
      "We use essential cookies to run this site, and optional ones to understand usage and improve it. You choose.",
    policyHref: "/legal/cookies",
    categories: {
      analytics: "Analytics: anonymous usage statistics",
      marketing: "Marketing: campaign measurement",
    },
  },
  legal: {
    companyName: "Baton",
    contactEmail: "hello@baton.run",
    jurisdiction: "",
    address: "",
  },
  contact: {
    title: "Get in touch",
    description: "Questions, ideas or feedback. We read every message and reply by email.",
    successMessage: "Thanks! Your message is on its way. We'll get back to you by email.",
    subjectPrefix: "[Contact]",
  },
  blog: {
    title: "Field notes",
    description: "Essays on distribution, attention and the craft of passing people on.",
    postsPerPage: 12,
  },
  changelog: {
    title: "Changelog",
    description: "Every change to the network, the embed and the dashboard.",
  },
  faq: {
    title: "Questions, answered",
    description: "How the exchange works, what users see, and why it stays fair.",
  },
  auth: {
    afterSignIn: "/dashboard",
    protectedPaths: [
      "/dashboard",
      "/tools",
      "/network",
      "/credits",
      "/settings",
      "/admin",
      "/onboarding",
    ],
    requireEmailVerification: true,
    magicLink: true,
  },
  billing: {
    currency: "usd",
    trialDays: 14,
    plans: [
      {
        id: "free",
        name: "Relay",
        description: "Everything you need to join the network. Free, for good.",
        price: {
          monthly: 0,
          yearly: 0,
        },
        features: [
          "1 tool on the network",
          "1:1 credit exchange",
          "10 starter credits",
          "7-day stats",
        ],
        limits: {
          tools: 1,
          handshakes: 0,
          statsDays: 7,
        },
      },
      {
        id: "pro",
        name: "Anchor",
        description: "For makers with a few tools and partners they trust.",
        price: {
          monthly: 12,
          yearly: 120,
        },
        features: [
          "5 tools",
          "Handshakes: direct pairings that rank first",
          "90-day stats and journey breakdowns",
          "Hide the Baton mark",
        ],
        limits: {
          tools: 5,
          handshakes: 25,
          statsDays: 90,
        },
        highlighted: true,
        badge: "For serious makers",
      },
      {
        id: "enterprise",
        name: "Studio",
        description: "For studios and teams running a portfolio of tools.",
        price: {
          monthly: 39,
          yearly: 390,
        },
        features: [
          "Unlimited tools",
          "Unlimited handshakes",
          "Team seats and roles",
          "Stats API and CSV export",
          "Priority review for new tools",
        ],
        limits: {
          tools: 1000,
          handshakes: 1000,
          statsDays: 365,
        },
      },
    ],
  },
  teams: {
    membershipLimit: 50,
    invitationExpiresInDays: 7,
  },
  onboarding: {
    redirectNewUsers: true,
    questions: [
      {
        id: "role",
        type: "choice",
        title: "What are you bringing to the network?",
        options: [
          "A tool I built myself",
          "Tools for a studio or team",
          "A free utility or side project",
          "I'm just exploring",
        ],
      },
      {
        id: "stage",
        type: "choice",
        title: "How many people use it each month?",
        options: ["Just launched", "Under 1,000", "1,000 to 50,000", "More than 50,000"],
      },
      {
        id: "successMoment",
        type: "text",
        title: "What does a user have in their hands when your tool is done?",
        placeholder: "e.g. a compressed PDF, a transcript, a logo",
      },
    ],
  },
  api: {
    keyPrefix: "sk",
    scopes: {
      read: "Read your account data",
      write: "Create and change data",
    },
    rateLimit: {
      limit: 60,
      window: "1 m",
    },
  },
  docs: {
    title: "Documentation",
    description: "Install the embed, call pass(), and understand the exchange.",
    editUrl: "https://github.com/jonesruskin/website1/edit/main/",
  },
});