export const PLAN_LIMITS = {
  starter: {
    maxProjects: 1,
    maxWorkspaces: 1,
    maxMembers: 3,
    storageGB: 2,
    maxIds: 5,
    support: 'Email (48h)',
  },
  pro: {
    maxProjects: Infinity,
    maxWorkspaces: 1,
    maxMembers: 5,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire',
  },
  team: { // This is the plan name used in Stripe metadata
    maxProjects: Infinity,
    maxWorkspaces: 4,
    maxMembers: 10,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire 24/7',
  },
  business: { // Alias for legacy/consistency
    maxProjects: Infinity,
    maxWorkspaces: 4,
    maxMembers: 10,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire 24/7',
  },
  enterprise: {
    maxProjects: Infinity,
    maxWorkspaces: Infinity,
    maxMembers: Infinity,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Dédié',
  }
};

export type PlanName = keyof typeof PLAN_LIMITS;
