export const PLAN_LIMITS = {
  starter: {
    maxProjects: 1,
    maxWorkspaces: 1,
    maxMembers: 3,
    storageGB: 2,
    maxIds: 5,
    support: 'Email (48h)',
    // IA : -1 = illimité, sinon tokens/mois
    aiTokensPerMonth: 150_000,
    aiWhatsapp: false,
  },
  pro: {
    maxProjects: Infinity,
    maxWorkspaces: 1,
    maxMembers: 5,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire',
    aiTokensPerMonth: 500_000,
    aiWhatsapp: true,
  },
  team: { // This is the plan name used in Stripe metadata
    maxProjects: Infinity,
    maxWorkspaces: 4,
    maxMembers: 10,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire 24/7',
    aiTokensPerMonth: 2_000_000,
    aiWhatsapp: true,
  },
  business: { // Alias for legacy/consistency
    maxProjects: Infinity,
    maxWorkspaces: 4,
    maxMembers: 10,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Prioritaire 24/7',
    aiTokensPerMonth: 8_000_000,
    aiWhatsapp: true,
  },
  enterprise: {
    maxProjects: Infinity,
    maxWorkspaces: Infinity,
    maxMembers: Infinity,
    storageGB: Infinity,
    maxIds: Infinity,
    support: 'Dédié',
    aiTokensPerMonth: -1, // illimité
    aiWhatsapp: true,
  }
};

export type PlanName = keyof typeof PLAN_LIMITS;
