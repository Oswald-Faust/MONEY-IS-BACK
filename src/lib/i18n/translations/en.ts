import type { TranslationType } from './fr';

const en: TranslationType = {
  // --- Global / Common ---
  common: {
    getStarted: 'Get Started',
    getStartedFree: 'GET STARTED FOR FREE',
    login: 'Sign In',
    logout: 'Sign Out',
    dashboard: 'Dashboard',
    goToDashboard: 'Go to Dashboard',
    viewDemo: 'Watch Demo',
    search: 'Search...',
    quickSearch: 'Quick search',
    settings: 'Settings',
    upgrade: 'Upgrade',
    workspace: 'Workspace',
    yourWorkspaces: 'Your Workspaces',
    createWorkspace: 'Create workspace',
    requiredTeamPlan: 'REQUIRED: TEAM PLAN',
    projects: 'Projects',
    tools: 'Tools',
    creatorMode: 'Creator Mode',
    exploreFeature: 'Explore Feature',
    madeWithLove: 'Made with ❤️ in Paris',
    allRightsReserved: '© 2026 MONEY IS BACK Inc. All rights reserved.',
    monthly: 'Monthly',
    yearly: 'Yearly (-25%)',
    perMonth: '/mo',
    perUserMonth: '/user/mo',
    free: 'Free',
    onQuote: 'Custom pricing',
    contactSupport: 'Contact Support',
    services: 'Services',
  },

  // --- Landing Navbar ---
  navbar: {
    product: 'Product',
    about: 'About',
    blog: 'Blog',
    pricing: 'Pricing',
    contact: 'Contact',
  },

  // --- Hero Section ---
  hero: {
    badgeText: 'V2.0 Mainnet Live',
    title: 'One single app',
    animatedWords: ['replace.', 'control.', 'create.'],
    animatedPrefix: 'to',
    subtitle: 'Find your Tasks, Docs, Chat, Goals, and much more on a single unified platform. The OS for your success.',
  },

  // --- Replace All Section ---
  replaceAll: {
    title: 'Replace them all',
    subtitle: 'Never lose context between your tools again.',
  },

  // --- Bento Grid / Features ---
  features: {
    sectionTitle: 'Everything you need.',
    sectionSubtitle: 'We deconstructed the chaos of modern work into a smooth, integrated system.',
    driveLabel: 'DRIVE',
    driveTitle: 'Secure Storage & Sharing',
    driveDesc: 'A centralized space for all your files. Share documents with secure links and manage access permissions.',
    dashboardTitle: 'Dynamic Dashboards',
    dashboardDesc: "Visualize your project progress, track your budgets and analyze your team's performance at a glance.",
    collaborationTitle: 'Real-Time Collaboration',
    collaborationDesc: 'Work together on the same documents and tasks without conflict.',
    messagingTitle: 'Built-in Messaging',
    messagingDesc: 'Chat with your team directly in the context of your projects.',
    taskTitle: 'Advanced Task Management',
    taskDesc: 'Organize your work with lists, kanban boards and calendars.',
    securityTitle: 'Secure Access Control',
    securityDesc: 'Define precisely who can see and edit what. Protect your sensitive information with granular roles and permissions.',
  },

  // --- Services / Tab Content ---
  tabContent: {
    documents: {
      title: 'Documents',
      desc: 'Create beautiful documents, wikis and knowledge bases connected to your tasks.',
    },
    dashboards: {
      title: 'Dashboards',
      desc: 'Get a complete overview with real-time charts and customizable reports.',
    },
    chat: {
      title: 'Chat',
      desc: 'Communicate in real-time with your team, share files and stay connected.',
    },
    goals: {
      title: 'Goals',
      desc: 'Set strategic goals, track progress and align your team.',
    },
    routines: {
      title: 'Routines',
      desc: 'Automate your recurring processes and maintain consistency in your operations.',
    },
  },

  // --- Pricing ---
  pricing: {
    title: 'Simple Pricing',
    plans: {
      free: {
        name: 'Free',
        features: [
          '1 User maximum',
          '1 Project maximum',
          '1 GB Drive storage',
          '7 Tasks max per project',
          'Limited Routines',
        ],
      },
      pro: {
        name: 'Pro',
        features: [
          '3 Users included',
          '€6.99/extra user',
          '3 Projects included',
          '€4.99/extra project',
          '10 GB Drive storage',
          'Unlimited Tasks & Routines',
        ],
      },
      team: {
        name: 'Team',
        features: [
          '10 Users included',
          '€4.99/extra user',
          '5 Projects included',
          '€4.99/extra project',
          'Unlimited storage',
          'Custom dashboards',
          'Mindmaps & Timelines',
        ],
      },
      enterprise: {
        name: 'Enterprise',
        features: [
          'Unlimited users',
          'Full White Label',
          'Audit Logs & Security',
          'SAML SSO / Okta',
          'Unlimited API',
          'Dedicated Success Manager',
        ],
      },
    },
  },

  // --- FAQ ---
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about the platform to boost your productivity.',
    items: [
      {
        question: 'What is MONEY IS BACK?',
        answer: "MONEY IS BACK is a revolutionary project management platform that centralizes your tasks, documents, drive storage, goals and team communication in a single, lightning-fast interface.",
      },
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use end-to-end bank-grade encryption (AES-256) for all your files and databases. Your sensitive documents are protected by granular access protocols and secure infrastructure.',
      },
      {
        question: 'Can I invite my team?',
        answer: 'Yes, the platform is designed for collaboration. Depending on your plan, you can invite a variable number of collaborators with specific roles and permissions (Admin, Member, Guest).',
      },
      {
        question: 'Is Drive storage unlimited?',
        answer: 'Storage depends on your subscription. The Free plan includes 1 GB, the Pro plan 10 GB, and the Team plan offers unlimited storage to support your business growth without constraints.',
      },
      {
        question: 'How does the transition to MONEY IS BACK work?',
        answer: 'We offer smooth import tools for Trello, Asana and Notion. You can migrate your tasks and history in just a few clicks so you never lose your progress.',
      },
      {
        question: 'Can I cancel my subscription at any time?',
        answer: "Yes, our monthly subscriptions are commitment-free. You can switch between plans or cancel directly from your settings with no hidden fees.",
      },
    ],
    noAnswer: "Didn't find your answer?",
    teamAvailable: 'Our team is available 24/7 to help you.',
  },

  // --- Footer ---
  footer: {
    description: 'The all-in-one platform to manage your projects, teams and growth. Built for builders.',
    productTitle: 'Product',
    features: 'Features',
    security: 'Security',
    changelog: 'Changelog',
    integrations: 'Integrations',
    companyTitle: 'Company',
    about: 'About',
    careers: 'Careers',
    blog: 'Blog',
    contact: 'Contact',
    partners: 'Partners',
    resourcesTitle: 'Resources',
    documentation: 'Documentation',
    community: 'Community',
    helpCenter: 'Help Center',
    status: 'Status',
    api: 'API',
    legalTitle: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    cookies: 'Cookies',
    licenses: 'Licenses',
  },

  // --- Sidebar ---
  sidebar: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    globalTodo: 'Global To Do',
    calendar: 'Calendar',
    routines: 'Routines',
    messaging: 'Messages',
    objectives: 'Objectives',
    ideas: 'Ideas',
    secureIds: 'Secure IDs',
    drive: 'Drive',
    invite: 'Invite',
    upgrade: 'Upgrade',
    tools: 'Tools',
    creatorMode: 'Creator Mode',
  },

  // --- Dashboard Mockup ---
  mockup: {
    taskCompleted: 'Task completed',
    timeAgo: '2 min ago',
  },
} as const;

export default en;
