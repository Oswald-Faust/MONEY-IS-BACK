export const PLAN_LIMITS = {
  starter: {
    maxProjects: 3,
    maxMembers: 3,
    storageGB: 2,
    maxIds: 5,
    support: 'Email (48h)',
  },
  pro: {
    maxProjects: Infinity,
    maxMembers: 5, // Then $10/user
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire',
  },
  business: {
    maxProjects: Infinity,
    maxMembers: 10, // Then $19/user
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire 24/7',
  },
  enterprise: {
    maxProjects: Infinity,
    maxMembers: Infinity,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Dédié',
  }
};

export type PlanName = keyof typeof PLAN_LIMITS;
