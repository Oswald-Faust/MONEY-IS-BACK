import Workspace from '@/models/Workspace';
import AIUsage, { AIFeature } from '@/models/AIUsage';
import { PLAN_LIMITS, PlanName } from '@/lib/limits';

/** Format "YYYY-MM" pour le mois en cours */
function currentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export interface AIQuotaInfo {
  allowed: boolean;
  /** Tokens consommés ce mois-ci */
  tokensUsed: number;
  /** Limite mensuelle du plan (-1 = illimité) */
  tokensLimit: number;
  /** Tokens bonus achetés (non périodiques) */
  bonusTokens: number;
  /** Capacité totale = tokensLimit + bonusTokens (-1 si plan illimité) */
  totalLimit: number;
  /** Tokens restants (-1 = illimité) */
  tokensRemaining: number;
  plan: PlanName;
  month: string;
}

/**
 * Vérifie si le workspace a encore du quota IA disponible ce mois-ci.
 * Tient compte des tokens bonus achetés à l'unité.
 */
export async function checkAIQuota(workspaceId: string): Promise<AIQuotaInfo> {
  const workspace = await Workspace.findById(workspaceId)
    .select('subscriptionPlan bonusTokens')
    .lean();

  const plan = (workspace?.subscriptionPlan as PlanName) || 'starter';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
  const tokensLimit = limits.aiTokensPerMonth;
  const bonusTokens = workspace?.bonusTokens ?? 0;
  const month = currentMonth();

  // Plan illimité — toujours autorisé
  if (tokensLimit === -1) {
    return {
      allowed: true,
      tokensUsed: 0,
      tokensLimit: -1,
      bonusTokens,
      totalLimit: -1,
      tokensRemaining: -1,
      plan,
      month,
    };
  }

  const usage = await AIUsage.findOne({ workspace: workspaceId, month }).lean();
  const tokensUsed = usage?.tokensUsed ?? 0;

  // Capacité totale = quota plan + tokens bonus
  const totalLimit = tokensLimit + bonusTokens;
  const tokensRemaining = Math.max(0, totalLimit - tokensUsed);

  return {
    allowed: tokensUsed < totalLimit,
    tokensUsed,
    tokensLimit,
    bonusTokens,
    totalLimit,
    tokensRemaining,
    plan,
    month,
  };
}

/**
 * Incrémente le compteur de tokens d'un workspace pour le mois en cours.
 * Si des tokens bonus sont disponibles après épuisement du quota plan,
 * ils sont déduits du workspace de façon atomique.
 * Utilise upsert atomique pour éviter les race conditions.
 */
export async function incrementAIUsage(
  workspaceId: string,
  tokens: number,
  feature: AIFeature
): Promise<void> {
  if (!tokens || tokens <= 0) return;

  const month = currentMonth();

  // Incrémenter le compteur mensuel
  const usage = await AIUsage.findOneAndUpdate(
    { workspace: workspaceId, month },
    {
      $inc: {
        tokensUsed: tokens,
        [`breakdown.${feature}`]: tokens,
      },
    },
    { upsert: true, new: true }
  );

  // Vérifier si les tokens bonus sont utilisés (tokensUsed > plan limit)
  const workspace = await Workspace.findById(workspaceId)
    .select('subscriptionPlan bonusTokens')
    .lean();

  if (!workspace || workspace.bonusTokens <= 0) return;

  const plan = (workspace.subscriptionPlan as PlanName) || 'starter';
  const planLimit = PLAN_LIMITS[plan]?.aiTokensPerMonth ?? 0;
  if (planLimit === -1) return; // illimité, pas de déduction bonus

  const totalUsed = usage.tokensUsed;
  if (totalUsed > planLimit) {
    // Les tokens au-delà de la limite plan = tokens bonus consommés
    const bonusConsumed = Math.min(tokens, totalUsed - planLimit);
    if (bonusConsumed > 0) {
      await Workspace.findByIdAndUpdate(workspaceId, {
        $inc: { bonusTokens: -bonusConsumed },
      });
      // Empêcher bonusTokens < 0
      await Workspace.findByIdAndUpdate(
        { _id: workspaceId, bonusTokens: { $lt: 0 } },
        { $set: { bonusTokens: 0 } }
      );
    }
  }
}

/**
 * Retourne le détail de consommation d'un workspace pour un mois donné.
 * Utilisé par la route /api/ai/usage.
 */
export async function getAIUsage(
  workspaceId: string,
  month?: string
): Promise<AIQuotaInfo & { breakdown: Record<AIFeature, number> }> {
  const workspace = await Workspace.findById(workspaceId)
    .select('subscriptionPlan bonusTokens')
    .lean();

  const plan = (workspace?.subscriptionPlan as PlanName) || 'starter';
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
  const tokensLimit = limits.aiTokensPerMonth;
  const bonusTokens = workspace?.bonusTokens ?? 0;
  const targetMonth = month ?? currentMonth();

  const usage = await AIUsage.findOne({ workspace: workspaceId, month: targetMonth }).lean();
  const tokensUsed = usage?.tokensUsed ?? 0;

  const totalLimit = tokensLimit === -1 ? -1 : tokensLimit + bonusTokens;
  const tokensRemaining = totalLimit === -1 ? -1 : Math.max(0, totalLimit - tokensUsed);

  return {
    allowed: totalLimit === -1 || tokensUsed < totalLimit,
    tokensUsed,
    tokensLimit,
    bonusTokens,
    totalLimit,
    tokensRemaining,
    plan,
    month: targetMonth,
    breakdown: {
      assistant:  usage?.breakdown?.assistant  ?? 0,
      search:     usage?.breakdown?.search     ?? 0,
      objectives: usage?.breakdown?.objectives ?? 0,
      whatsapp:   usage?.breakdown?.whatsapp   ?? 0,
    },
  };
}
