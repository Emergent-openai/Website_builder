const cloneValue = (value) => JSON.parse(JSON.stringify(value));


export const createClientId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};


export const slugify = (value) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `page-${createClientId().slice(0, 8)}`;
};


export const sectionCatalog = [
  {
    key: "header-signal",
    type: "header",
    category: "Header",
    name: "Signal Header",
    description: "Brand-led navigation with a sharp CTA.",
    content: {
      brand: "Northstar Studio",
      navItems: ["Services", "Work", "About", "Contact"],
      primaryCta: "Start a project",
    },
    styles: {
      background: "#0B1020",
      accent: "#6366F1",
      text: "#FAFAFA",
      align: "left",
      paddingY: 28,
      buttonStyle: "solid",
    },
  },
  {
    key: "hero-electric",
    type: "hero",
    category: "Hero",
    name: "Electric Hero",
    description: "High-impact headline with dual CTA and launch stats.",
    content: {
      eyebrow: "MULTI-PAGE BUILDER",
      title: "Build conversion-ready websites in a single creative flow.",
      description:
        "Drag in premium sections, switch pages instantly, and polish the final site from one focused workspace.",
      primaryCta: "Launch the build",
      secondaryCta: "See the layout",
      statLabels: ["Signal 1", "Signal 2", "Signal 3"],
      stats: ["12 section families", "Multi-page control", "Save in one click"],
    },
    styles: {
      background: "#09090B",
      accent: "#6366F1",
      text: "#FAFAFA",
      align: "left",
      paddingY: 112,
      buttonStyle: "solid",
    },
  },
  {
    key: "logos-press",
    type: "logos",
    category: "Social Proof",
    name: "Press Logos",
    description: "Simple trust bar to anchor the page.",
    content: {
      title: "Trusted by ambitious teams shipping fast.",
      logos: ["VANTA", "NOVA", "ARC", "METRIC", "PULSE"],
    },
    styles: {
      background: "#FFFFFF",
      accent: "#0F172A",
      text: "#111827",
      align: "center",
      paddingY: 64,
      buttonStyle: "outline",
    },
  },
  {
    key: "features-framework",
    type: "features",
    category: "Features",
    name: "Framework Features",
    description: "Three-column section for your process or benefits.",
    content: {
      eyebrow: "WHY IT WORKS",
      title: "Move from blank canvas to finished site faster.",
      description:
        "Each section is pre-structured so non-technical teams can swap content, styling, and hierarchy without friction.",
      items: [
        "Click any section card to add it instantly.",
        "Drag and reorder layouts directly on the live page.",
        "Edit content, color, spacing, and button styling in one place.",
      ],
    },
    styles: {
      background: "#F4F4F5",
      accent: "#0EA5E9",
      text: "#111827",
      align: "left",
      paddingY: 84,
      buttonStyle: "outline",
    },
  },
  {
    key: "testimonial-pulse",
    type: "testimonial",
    category: "Testimonials",
    name: "Pulse Quote",
    description: "Editorial testimonial with supporting proof points.",
    content: {
      eyebrow: "CLIENT RESULT",
      quote:
        "We assembled a polished three-page launch site in under an afternoon. The builder feels creative, not technical.",
      author: "Avery Quinn",
      role: "Founder, Pulse North",
      metrics: ["3 pages", "1 afternoon", "+42% more demo requests"],
    },
    styles: {
      background: "#0F172A",
      accent: "#D9F99D",
      text: "#F8FAFC",
      align: "left",
      paddingY: 88,
      buttonStyle: "ghost",
    },
  },
  {
    key: "blog-momentum",
    type: "blog",
    category: "Blog",
    name: "Momentum Stories",
    description: "Article grid for content and education sections.",
    content: {
      eyebrow: "LATEST NOTES",
      title: "Publish stories, updates, and resources with the same system.",
      description:
        "Use repeatable cards to turn simple updates into a clean editorial rhythm across the site.",
      cardLabels: ["Story 1", "Story 2", "Story 3"],
      items: [
        "How to build a sharper landing page in 30 minutes",
        "Design cues that make a no-code builder feel premium",
        "How small teams ship multi-page sites without bottlenecks",
      ],
      cardDescriptions: [
        "Editorial card ready for blog, resources, or launch notes.",
        "Editorial card ready for blog, resources, or launch notes.",
        "Editorial card ready for blog, resources, or launch notes.",
      ],
    },
    styles: {
      background: "#FFFFFF",
      accent: "#A855F7",
      text: "#111827",
      align: "left",
      paddingY: 80,
      buttonStyle: "outline",
    },
  },
  {
    key: "cta-convert",
    type: "cta",
    category: "Call To Action",
    name: "Convert CTA",
    description: "Focused conversion block with supporting bullets.",
    content: {
      eyebrow: "READY TO GO LIVE?",
      title: "Turn the builder session into a launch-ready website.",
      description:
        "Use this section to close the loop: show the next step, reinforce value, and keep momentum high.",
      primaryCta: "Book the kickoff",
      secondaryCta: "See more examples",
      items: ["Multi-page layouts", "Consistent brand styling", "Fast save workflow"],
    },
    styles: {
      background: "#111827",
      accent: "#06B6D4",
      text: "#F9FAFB",
      align: "center",
      paddingY: 96,
      buttonStyle: "solid",
    },
  },
  {
    key: "contact-studio",
    type: "contact",
    category: "Contact",
    name: "Studio Contact",
    description: "Contact section with clear ways to reach the team.",
    content: {
      eyebrow: "LET'S TALK",
      title: "Make it easy for the next client to say yes.",
      description:
        "Blend direct contact details with a confident final CTA so the page feels complete and human.",
      emailLabel: "Email",
      phoneLabel: "Phone",
      addressLabel: "Address",
      email: "hello@northstar.studio",
      phone: "+1 (415) 555-0128",
      address: "215 Howard Street, San Francisco, CA",
      formEyebrow: "Inquiry flow",
      formTitle: "Ready for your contact form or booking widget.",
      formFields: ["Name field", "Email field", "Project details"],
      primaryCta: "Send inquiry",
    },
    styles: {
      background: "#F4F4F5",
      accent: "#6366F1",
      text: "#111827",
      align: "left",
      paddingY: 88,
      buttonStyle: "solid",
    },
  },
  {
    key: "faq-spark",
    type: "faq",
    category: "FAQ",
    name: "Spark FAQ",
    description: "Concise Q&A block for objections and clarity.",
    content: {
      eyebrow: "COMMON QUESTIONS",
      title: "Answer the details before someone asks.",
      items: [
        "Can I build multiple pages? — Yes, each project can contain multiple saved pages.",
        "Can I change styles later? — Yes, you can edit color, spacing, alignment, and button treatment anytime.",
        "Do I need code? — No, the workflow is designed for fast visual assembly.",
      ],
    },
    styles: {
      background: "#FFFFFF",
      accent: "#0F172A",
      text: "#111827",
      align: "left",
      paddingY: 80,
      buttonStyle: "outline",
    },
  },
  {
    key: "footer-prism",
    type: "footer",
    category: "Footer",
    name: "Prism Footer",
    description: "Compact footer with links and brand sign-off.",
    content: {
      brand: "Northstar Studio",
      description: "A creative system for shipping websites without the usual friction.",
      links: ["Instagram", "LinkedIn", "X", "Privacy"],
      legal: "© 2026 Northstar Studio. All rights reserved.",
    },
    styles: {
      background: "#09090B",
      accent: "#6366F1",
      text: "#FAFAFA",
      align: "left",
      paddingY: 52,
      buttonStyle: "ghost",
    },
  },
];


export const getSectionPreset = (presetKey) =>
  sectionCatalog.find((preset) => preset.key === presetKey);


export const createSectionFromPreset = (presetKey) => {
  const preset = getSectionPreset(presetKey);

  if (!preset) {
    throw new Error(`Missing section preset for key: ${presetKey}`);
  }

  return {
    id: createClientId(),
    presetKey: preset.key,
    type: preset.type,
    category: preset.category,
    name: preset.name,
    description: preset.description,
    content: cloneValue(preset.content),
    styles: cloneValue(preset.styles),
  };
};


export const cloneSection = (section) => ({
  ...cloneValue(section),
  id: createClientId(),
  name: `${section.name} Copy`,
});


export const createBlankPage = (name = "New Page") => ({
  id: createClientId(),
  name,
  slug: slugify(name),
  seo_title: name,
  seo_description: `${name} built in Creative Studio.`,
  sections: [],
});


const buildStarterPage = (name, sectionKeys) => ({
  ...createBlankPage(name),
  sections: sectionKeys.map((key) => createSectionFromPreset(key)),
});


export const createStarterPages = () => [
  buildStarterPage("Home", [
    "header-signal",
    "hero-electric",
    "logos-press",
    "features-framework",
    "testimonial-pulse",
    "cta-convert",
    "footer-prism",
  ]),
  buildStarterPage("About", [
    "header-signal",
    "features-framework",
    "testimonial-pulse",
    "blog-momentum",
    "footer-prism",
  ]),
  buildStarterPage("Contact", [
    "header-signal",
    "contact-studio",
    "faq-spark",
    "footer-prism",
  ]),
];


export const createStarterProjectPayload = (name) => ({
  name: name.trim() || "New Studio Site",
  description: "Multi-page website assembled in Creative Studio.",
  status: "draft",
  pages: createStarterPages(),
});


export const formatTimestamp = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};