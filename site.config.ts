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
        label: "Blog",
        href: "/blog",
      },
      {
        label: "Pricing",
        href: "/pricing",
      },
      {
        label: "Docs",
        href: "/docs",
      },
    ],
    footer: [
      {
        title: "Company",
        links: [
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
    keywords: [],
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
    companyName: "",
    contactEmail: "",
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
    title: "Blog",
    description: "Notes, announcements and long reads.",
    postsPerPage: 12,
  },
  changelog: {
    title: "Changelog",
    description: "New features, improvements and fixes.",
  },
  faq: {
    title: "Frequently asked questions",
    description: "Quick answers to common questions.",
  },
  auth: {
    afterSignIn: "/dashboard",
    protectedPaths: ["/dashboard", "/settings", "/admin", "/onboarding"],
    requireEmailVerification: true,
    magicLink: true,
  },
  billing: {
    currency: "usd",
    trialDays: 14,
    plans: [
      {
        id: "free",
        name: "Free",
        description: "For trying things out.",
        price: {
          monthly: 0,
          yearly: 0,
        },
        features: ["1 project", "Community support"],
        limits: {
          projects: 1,
        },
      },
      {
        id: "pro",
        name: "Pro",
        description: "For professionals and small teams.",
        price: {
          monthly: 19,
          yearly: 190,
        },
        features: ["Unlimited projects", "Priority email support", "Advanced analytics"],
        limits: {
          projects: 1000,
        },
        highlighted: true,
        badge: "Most popular",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        description: "For organizations with custom needs.",
        price: {
          monthly: null,
        },
        features: ["Everything in Pro", "SSO and audit log", "Dedicated support"],
        contactHref: "/contact",
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
        title: "What best describes you?",
        options: ["Founder", "Engineer", "Designer", "Marketer", "Something else"],
      },
      {
        id: "teamSize",
        type: "choice",
        title: "How many people will use it?",
        options: ["Just me", "2–10", "11–50", "More than 50"],
      },
      {
        id: "goal",
        type: "text",
        title: "What do you want to get done first?",
        placeholder: "e.g. launch our beta by June",
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
    description: "Guides and reference.",
    editUrl: "",
  },
});