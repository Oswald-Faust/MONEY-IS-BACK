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
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    tasks: 'Tasks',
    team: 'Team',
    progress: 'Progress',
    shareTask: 'Share in messaging',
    priority: {
      important: 'Important',
      lessImportant: 'Less important',
      waiting: 'Waiting',
    },
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

  // --- Dashboard Page ---
  dashboard: {
    welcome: 'Welcome,',
    ready: 'Everything is ready for a productive day.',
    manageEdwin: 'Manage the Edwin platform',
    openPanel: 'Open Panel',
    newTask: 'New Task',
    newProject: 'New Project',
    stats: {
      activeProjects: 'Active Projects',
      tasksInProgress: 'Tasks in progress',
      completedTasks: 'Completed Tasks',
      productivity: 'Productivity',
    },
    myBusiness: 'My Businesses',
    manageAll: 'Manage all',
    priorityTasks: 'Priority Tasks',
    crucial: 'Crucial',
    upcoming: 'Upcoming',
    noCrucialTasks: 'No crucial tasks',
    noUpcomingTasks: 'No upcoming tasks',
    addTask: 'Add a task',
    dailyRoutine: 'Daily Routine',
    weeklyFollowup: 'Weekly Follow-up',
    noProjects: 'No projects yet',
    createFirstProject: 'Create your first project to get started',
    createProject: 'Create a project',
    team: {
      title: 'My Team',
      invite: 'Invite',
      empty: 'Nobody in your team for now.',
    },
  },

  // --- Projects Page ---
  projectsPage: {
    title: 'My Projects',
    count: 'projects',
    newProject: 'New project',
    searchPlaceholder: 'Search for a project...',
    filters: {
      all: 'All',
      active: 'Active',
      paused: 'Paused',
      archived: 'Archived',
    },
    loading: 'Loading projects...',
    sections: {
      activeProjects: 'Active projects',
      pausedProjects: 'Paused',
      archivedProjects: 'Archived',
    },
    empty: {
      title: 'No project found',
      tryAnotherSearch: 'Try another search',
      createFirst: 'Create your first project to get started',
      createButton: 'Create a project',
    },
    confirmDelete: 'Are you sure you want to delete the project',
    toasts: {
      deleted: 'Project deleted!',
      deleteError: 'Error during deletion',
      connectionError: 'Connection error',
      loadError: 'Error loading projects',
      serverError: 'Server connection error',
    },
  },

  // --- Tasks Page (Global To Do) ---
  tasksPage: {
    title: 'Global To Do',
    titleWithProject: 'To Do',
    count: 'tasks',
    total: 'total',
    forThisProject: 'for this project',
    newTask: 'New task',
    searchPlaceholder: 'Search for a task...',
    filters: {
      allPriorities: 'All priorities',
      important: 'Important',
      lessImportant: 'Less important',
      waiting: 'Waiting',
    },
    columns: {
      important: 'Important',
      lessImportant: 'Less important',
      waiting: 'Waiting',
    },
    empty: {
      noImportantTasks: 'No important task',
      noTasks: 'No task',
      noWaitingTasks: 'No task waiting',
      noTasksFound: 'No task found',
    },
    toasts: {
      completed: 'Task completed!',
      restored: 'Task restored',
      updateError: 'Error during update',
      loadError: 'Error loading tasks',
    },
  },

  // --- Messages Page ---
  messagesPage: {
    title: 'Internal Messaging',
    subtitle: 'Select a conversation or start a new one to collaborate.',
    newDiscussion: 'New discussion',
    newGroup: 'New group',
    sendError: 'Error sending message',
    leftGroup: 'You left the group',
    leaveGroupError: 'Error leaving group',
    loadUserError: 'Unable to load user',
  },

  // --- Global Search ---
  globalSearch: {
    placeholder: 'Search for projects, tasks, objectives...',
    title: 'Global Search',
    description: 'Type at least 2 characters to search across your entire workspace.',
    tags: {
      projects: 'Projects',
      tasks: 'Tasks',
      objectives: 'Objectives',
      ideas: 'Ideas',
    },
    open: 'Open',
    noResults: 'No results',
    noResultsFor: 'We found nothing for',
    shortcuts: {
      navigate: 'Navigate',
      select: 'Select',
      close: 'Close',
    },
  },

  // --- Modals ---
  modals: {
    // Project Modal
    project: {
      titleCreate: 'New project',
      titleEdit: 'Edit project',
      nameLabel: 'Project name *',
      namePlaceholder: 'Ex: FINEA, BUISPACE...',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe your project...',
      colorLabel: 'Project color',
      colors: {
        green: 'Green',
        orange: 'Orange',
        red: 'Red',
        blue: 'Blue',
        purple: 'Purple',
        pink: 'Pink',
        cyan: 'Cyan',
        yellow: 'Yellow',
        indigo: 'Indigo',
        gray: 'Gray',
      },
      cancel: 'Cancel',
      create: 'Create project',
      save: 'Save',
      toasts: {
        nameRequired: 'Project name is required',
        updated: 'Project updated!',
        updateError: 'Error updating project',
        mustBeConnected: 'You must be logged in',
        workspaceNotFound: 'Workspace not found',
        created: 'Project created successfully!',
        createError: 'Error creating project',
      },
    },

    // Task Modal
    task: {
      titleCreate: 'New task',
      titleEdit: 'Edit task',
      taskTitleLabel: 'Task title *',
      taskTitlePlaceholder: 'Ex: Create landing page...',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe the task in detail...',
      projectLabel: 'Project *',
      priorityLabel: 'Priority',
      priorities: {
        important: 'Important',
        lessImportant: 'Less important',
        waiting: 'Waiting',
      },
      dueDateLabel: 'Due date',
      tagsLabel: 'Tags (comma separated)',
      tagsPlaceholder: 'Ex: urgent, design, frontend',
      cancel: 'Cancel',
      create: 'Create task',
      save: 'Save',
      toasts: {
        titleRequired: 'Task title is required',
        projectRequired: 'Please select a project',
        mustBeConnected: 'You must be logged in',
        created: 'Task created successfully!',
        updated: 'Task updated!',
        createError: 'Error creating task',
        updateError: 'Error updating task',
      },
    },

    // Chat Modals
    chat: {
      newDiscussion: 'New discussion',
      searchPlaceholder: 'Search for a user...',
      noUserFound: 'No user found for',
      noUsersAvailable: 'No other users available.',
      close: 'Close',
    },

    // Group Modal
    group: {
      title: 'New group',
      nameStep: 'Group name',
      searchPlaceholder: 'Search for members...',
      membersSelected: 'member(s) selected',
      noUserFound: 'No user found',
      next: 'Next',
      groupNameLabel: 'Group name',
      groupNamePlaceholder: 'Ex: Marketing Team',
      membersCount: 'members (including you)',
      create: 'Create group',
    },

    // Objective Modal
    objective: {
      titleCreate: 'New objective',
      titleEdit: 'Edit objective',
      objectiveTitleLabel: 'Objective title *',
      descriptionLabel: 'Description',
      projectLabel: 'Project *',
      priorityLabel: 'Priority',
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
      checkpointsLabel: 'Checkpoints',
      addCheckpoint: 'Add checkpoint',
      targetDateLabel: 'Target date',
      cancel: 'Cancel',
      create: 'Create objective',
      save: 'Save',
    },

    // Idea Modal
    idea: {
      titleCreate: 'New idea',
      titleEdit: 'Edit idea',
      ideaTitleLabel: 'Idea title *',
      contentLabel: 'Content',
      projectLabel: 'Project',
      statusLabel: 'Status',
      statuses: {
        raw: 'Raw',
        standby: 'Standby',
        inProgress: 'In progress',
        implemented: 'Implemented',
        archived: 'Archived',
      },
      tagsLabel: 'Tags',
      addTag: 'Add tag',
      attachmentsLabel: 'Attachments',
      addAttachment: 'Add attachment',
      cancel: 'Cancel',
      create: 'Create idea',
      save: 'Save',
      toasts: {
        titleRequired: 'Title is required',
        mustBeConnected: 'You must be logged in',
      },
    },

    // Common
    common: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      create: 'Create',
      delete: 'Delete',
      loading: 'Loading...',
    },
  },
} as const;

export default en;
