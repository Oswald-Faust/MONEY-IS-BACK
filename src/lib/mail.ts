import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import EmailCampaign, { type EmailAudienceType } from '@/models/EmailCampaign';
import EmailConfig from '@/models/EmailConfig';
import EmailSendLog, { type EmailLogCategory } from '@/models/EmailSendLog';
import EmailTemplate from '@/models/EmailTemplate';
import User from '@/models/User';
import type { IEmailConfig } from '@/models/EmailConfig';

type EmailAutomationKey = 'welcome' | 'payment' | 'workspace_action' | 'invitation' | 'workspace_welcome';

type EmailTemplateSeed = {
  name: string;
  subject: string;
  body: string;
  type: 'automation' | 'campaign' | 'system';
  automationKey?: EmailAutomationKey;
  variables: string[];
};

type RenderVariables = Record<string, unknown>;

type ResolvedRecipient = {
  email: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  category?: EmailLogCategory;
  templateId?: string;
  templateName?: string;
  automationKey?: string;
  campaignId?: string;
  campaignName?: string;
  userId?: string;
  variables?: RenderVariables;
  metadata?: Record<string, unknown>;
  configOverride?: IEmailConfig | null;
};

type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: unknown;
  status?: 'sent' | 'failed' | 'skipped';
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const DEFAULT_EMAIL_TEMPLATES: EmailTemplateSeed[] = [
  {
    name: 'Bienvenue - Nouvel Utilisateur',
    subject: 'Bienvenue chez Edwin, {{firstName}} !',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 14px; background:#fff;">
        <h1 style="color:#6366f1; margin-top:0;">Bienvenue {{firstName}} !</h1>
        <p>Votre compte Edwin est prêt.</p>
        <p>Commencez par finaliser votre onboarding puis créez votre premier workspace.</p>
        <div style="margin: 28px 0;">
          <a href="{{{onboardingLink}}}" style="display:inline-block; background:#6366f1; color:#fff; padding:12px 18px; border-radius:8px; text-decoration:none; font-weight:600;">Accéder à mon espace</a>
        </div>
        <p style="color:#777; font-size:13px;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</p>
      </div>
    `,
    type: 'automation',
    automationKey: 'welcome',
    variables: ['firstName', 'onboardingLink'],
  },
  {
    name: 'Facture / Nouvel abonnement',
    subject: 'Confirmation de votre abonnement {{planName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 14px; background:#fff;">
        <h1 style="color:#10b981; margin-top:0;">Paiement confirmé</h1>
        <p>Merci pour votre confiance.</p>
        <p>Plan: <strong>{{planName}}</strong></p>
        <p>Montant: <strong>{{amount}}</strong></p>
        <p><a href="{{{invoiceUrl}}}">Voir la facture</a></p>
        <div style="margin: 28px 0;">
          <a href="{{{dashboardUrl}}}" style="display:inline-block; background:#10b981; color:#fff; padding:12px 18px; border-radius:8px; text-decoration:none; font-weight:600;">Retour au dashboard</a>
        </div>
      </div>
    `,
    type: 'automation',
    automationKey: 'payment',
    variables: ['planName', 'amount', 'invoiceUrl', 'dashboardUrl'],
  },
  {
    name: 'Notification Action Workspace',
    subject: 'Edwin : Nouvelle activité dans {{workspaceName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 14px; background:#fff;">
        <h2 style="margin-top:0;">Nouvelle activité</h2>
        <p><strong>{{actorName}}</strong> {{actionDesc}} dans <strong>{{workspaceName}}</strong>.</p>
        <div style="margin: 28px 0;">
          <a href="{{{dashboardUrl}}}" style="display:inline-block; background:#111827; color:#fff; padding:12px 18px; border-radius:8px; text-decoration:none; font-weight:600;">Voir l'activité</a>
        </div>
      </div>
    `,
    type: 'automation',
    automationKey: 'workspace_action',
    variables: ['actorName', 'actionDesc', 'workspaceName', 'dashboardUrl'],
  },
  {
    name: 'Invitation Workspace',
    subject: 'Invitation à rejoindre {{workspaceName}} sur Edwin',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 14px; background:#fff;">
        <h2 style="margin-top:0; color:#6366f1;">Vous avez été invité</h2>
        <p><strong>{{inviterName}}</strong> vous invite à rejoindre <strong>{{workspaceName}}</strong>.</p>
        <div style="margin: 28px 0;">
          <a href="{{{joinUrl}}}" style="display:inline-block; background:#6366f1; color:#fff; padding:12px 18px; border-radius:8px; text-decoration:none; font-weight:600;">Accepter l'invitation</a>
        </div>
        <p style="color:#777; font-size:13px;">Le lien expire dans 7 jours.</p>
      </div>
    `,
    type: 'automation',
    automationKey: 'invitation',
    variables: ['inviterName', 'workspaceName', 'joinUrl'],
  },
  {
    name: 'Ajout à un workspace',
    subject: 'Vous avez été ajouté à {{workspaceName}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 14px; background:#fff;">
        <h2 style="margin-top:0;">Bienvenue dans {{workspaceName}}</h2>
        <p><strong>{{inviterName}}</strong> vous a ajouté au workspace <strong>{{workspaceName}}</strong>.</p>
        <div style="margin: 28px 0;">
          <a href="{{{dashboardUrl}}}" style="display:inline-block; background:#6366f1; color:#fff; padding:12px 18px; border-radius:8px; text-decoration:none; font-weight:600;">Ouvrir le dashboard</a>
        </div>
      </div>
    `,
    type: 'automation',
    automationKey: 'workspace_welcome',
    variables: ['inviterName', 'workspaceName', 'dashboardUrl'],
  },
];

const AUTOMATION_TO_CONFIG_FLAG: Partial<Record<EmailAutomationKey, keyof IEmailConfig['automations']>> = {
  welcome: 'onRegister',
  payment: 'onPayment',
  workspace_action: 'onWorkspaceAction',
  invitation: 'onInvitation',
  workspace_welcome: 'onWorkspaceWelcome',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function toTemplateString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function normalizeEmail(email: string): string | null {
  const value = String(email || '').trim().toLowerCase();
  if (!value) return null;
  const isValid = /^\S+@\S+\.\S+$/.test(value);
  return isValid ? value : null;
}

export function extractTemplateVariables(...parts: string[]): string[] {
  const found = new Set<string>();
  const regex = /{{{?\s*([a-zA-Z0-9_.-]+)\s*}?}}/g;

  for (const part of parts) {
    if (!part) continue;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(part)) !== null) {
      found.add(match[1]);
    }
    regex.lastIndex = 0;
  }

  return [...found];
}

export function renderTemplate(template: string, variables: RenderVariables = {}): string {
  if (!template) return '';

  let rendered = template.replace(/{{{\s*([a-zA-Z0-9_.-]+)\s*}}}/g, (_, key: string) => {
    return toTemplateString(getByPath(variables, key));
  });

  rendered = rendered.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_, key: string) => {
    return escapeHtml(toTemplateString(getByPath(variables, key)));
  });

  return rendered;
}

export async function seedDefaultEmailTemplates(): Promise<void> {
  await connectDB();

  for (const seed of DEFAULT_EMAIL_TEMPLATES) {
    if (!seed.automationKey) continue;

    await EmailTemplate.findOneAndUpdate(
      { automationKey: seed.automationKey },
      {
        $setOnInsert: {
          ...seed,
          variables: seed.variables,
        },
      },
      { upsert: true, new: true }
    );
  }
}

async function getEmailConfig(): Promise<IEmailConfig | null> {
  await connectDB();
  let config = await EmailConfig.findOne();
  if (!config) {
    config = await EmailConfig.create({});
  }
  return config;
}

function smtpConfigured(config: IEmailConfig | null): boolean {
  return Boolean(config?.smtp?.host && config?.smtp?.port && config?.smtp?.user && config?.smtp?.pass && config?.smtp?.from);
}

async function writeEmailLog(log: {
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  category?: EmailLogCategory;
  templateId?: string;
  templateName?: string;
  automationKey?: string;
  campaignId?: string;
  campaignName?: string;
  userId?: string;
  providerMessageId?: string;
  variables?: RenderVariables;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  sentAt?: Date;
}) {
  try {
    await connectDB();
    await EmailSendLog.create({
      to: log.to,
      subject: log.subject,
      status: log.status,
      category: log.category || 'system',
      templateId: log.templateId && mongoose.Types.ObjectId.isValid(log.templateId)
        ? new mongoose.Types.ObjectId(log.templateId)
        : undefined,
      templateName: log.templateName,
      automationKey: log.automationKey,
      campaignId: log.campaignId && mongoose.Types.ObjectId.isValid(log.campaignId)
        ? new mongoose.Types.ObjectId(log.campaignId)
        : undefined,
      campaignName: log.campaignName,
      userId: log.userId && mongoose.Types.ObjectId.isValid(log.userId)
        ? new mongoose.Types.ObjectId(log.userId)
        : undefined,
      providerMessageId: log.providerMessageId,
      variables: log.variables,
      metadata: log.metadata,
      errorMessage: log.errorMessage,
      sentAt: log.sentAt,
    });
  } catch (error) {
    console.error('Failed to persist email log:', error);
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  category = 'system',
  templateId,
  templateName,
  automationKey,
  campaignId,
  campaignName,
  userId,
  variables,
  metadata,
  configOverride,
}: SendEmailInput): Promise<SendEmailResult> {
  const normalizedTo = normalizeEmail(to);

  if (!normalizedTo) {
    await writeEmailLog({
      to: to || '',
      subject,
      status: 'failed',
      category,
      templateId,
      templateName,
      automationKey,
      campaignId,
      campaignName,
      userId,
      variables,
      metadata,
      errorMessage: 'Adresse e-mail invalide',
    });

    return { success: false, status: 'failed', error: 'Invalid email' };
  }

  try {
    const config = configOverride || (await getEmailConfig());

    if (!config || !smtpConfigured(config)) {
      await writeEmailLog({
        to: normalizedTo,
        subject,
        status: 'skipped',
        category,
        templateId,
        templateName,
        automationKey,
        campaignId,
        campaignName,
        userId,
        variables,
        metadata,
        errorMessage: 'Configuration SMTP incomplète',
      });

      return { success: false, status: 'skipped', error: 'SMTP config missing' };
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: Boolean(config.smtp.secure),
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    const info = await transporter.sendMail({
      from: config.smtp.from,
      to: normalizedTo,
      subject,
      text,
      html,
    });

    await writeEmailLog({
      to: normalizedTo,
      subject,
      status: 'sent',
      category,
      templateId,
      templateName,
      automationKey,
      campaignId,
      campaignName,
      userId,
      variables,
      metadata,
      providerMessageId: info.messageId,
      sentAt: new Date(),
    });

    return { success: true, status: 'sent', messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    await writeEmailLog({
      to: normalizedTo,
      subject,
      status: 'failed',
      category,
      templateId,
      templateName,
      automationKey,
      campaignId,
      campaignName,
      userId,
      variables,
      metadata,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return { success: false, status: 'failed', error };
  }
}

async function resolveTemplateByAutomationKey(automationKey: EmailAutomationKey) {
  const dbTemplate = await EmailTemplate.findOne({ automationKey });
  if (dbTemplate) {
    return {
      id: dbTemplate._id.toString(),
      name: dbTemplate.name,
      subject: dbTemplate.subject,
      body: dbTemplate.body,
    };
  }

  const fallback = DEFAULT_EMAIL_TEMPLATES.find((tpl) => tpl.automationKey === automationKey);
  if (!fallback) return null;

  return {
    id: undefined,
    name: fallback.name,
    subject: fallback.subject,
    body: fallback.body,
  };
}

function automationEnabled(config: IEmailConfig | null, automationKey?: EmailAutomationKey): boolean {
  if (!automationKey) return true;
  const flag = AUTOMATION_TO_CONFIG_FLAG[automationKey];
  if (!flag) return true;
  const value = config?.automations?.[flag];
  return value !== false;
}

export async function sendTemplatedEmail({
  to,
  variables = {},
  templateId,
  templateName,
  automationKey,
  category = 'automation',
  campaignId,
  campaignName,
  userId,
  metadata,
  subjectOverride,
  bodyOverride,
}: {
  to: string;
  variables?: RenderVariables;
  templateId?: string;
  templateName?: string;
  automationKey?: EmailAutomationKey;
  category?: EmailLogCategory;
  campaignId?: string;
  campaignName?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  subjectOverride?: string;
  bodyOverride?: string;
}): Promise<SendEmailResult> {
  const config = await getEmailConfig();

  if (automationKey && !automationEnabled(config, automationKey)) {
    const subjectForLog = subjectOverride || (await resolveTemplateByAutomationKey(automationKey))?.subject || templateName || 'Automation disabled';
    await writeEmailLog({
      to,
      subject: subjectForLog,
      status: 'skipped',
      category,
      templateId,
      templateName,
      automationKey,
      campaignId,
      campaignName,
      userId,
      variables,
      metadata,
      errorMessage: 'Automatisation désactivée',
    });
    return { success: false, status: 'skipped', error: 'Automation disabled' };
  }

  let resolvedTemplate: { id?: string; name?: string; subject: string; body: string } | null = null;

  if (subjectOverride && bodyOverride) {
    resolvedTemplate = {
      id: templateId,
      name: templateName,
      subject: subjectOverride,
      body: bodyOverride,
    };
  } else if (templateId) {
    const dbTemplate = await EmailTemplate.findById(templateId);
    if (dbTemplate) {
      resolvedTemplate = {
        id: dbTemplate._id.toString(),
        name: dbTemplate.name,
        subject: dbTemplate.subject,
        body: dbTemplate.body,
      };
    }
  } else if (automationKey) {
    resolvedTemplate = await resolveTemplateByAutomationKey(automationKey);
  }

  if (!resolvedTemplate) {
    await writeEmailLog({
      to,
      subject: subjectOverride || 'Template introuvable',
      status: 'failed',
      category,
      templateId,
      templateName,
      automationKey,
      campaignId,
      campaignName,
      userId,
      variables,
      metadata,
      errorMessage: 'Template e-mail introuvable',
    });
    return { success: false, status: 'failed', error: 'Template not found' };
  }

  const renderedSubject = renderTemplate(resolvedTemplate.subject, variables);
  const renderedHtml = renderTemplate(resolvedTemplate.body, variables);

  return sendEmail({
    to,
    subject: renderedSubject,
    html: renderedHtml,
    category,
    templateId: resolvedTemplate.id,
    templateName: resolvedTemplate.name || templateName,
    automationKey,
    campaignId,
    campaignName,
    userId,
    variables,
    metadata,
    configOverride: config,
  });
}

function parseCustomEmailInput(customEmails?: string[]): string[] {
  if (!Array.isArray(customEmails)) return [];
  const set = new Set<string>();

  for (const item of customEmails) {
    const normalized = normalizeEmail(item);
    if (normalized) set.add(normalized);
  }

  return [...set];
}

export async function resolveCampaignRecipients(audience: {
  type: EmailAudienceType;
  customEmails?: string[];
  daysSinceSignup?: number;
}): Promise<ResolvedRecipient[]> {
  await connectDB();

  if (audience.type === 'custom_emails') {
    return parseCustomEmailInput(audience.customEmails).map((email) => ({ email }));
  }

  const query: Record<string, unknown> = {};

  if (audience.type === 'admins') {
    query.role = 'admin';
  }

  if (audience.type === 'notifications_enabled') {
    query['preferences.notifications'] = true;
  }

  if (audience.type === 'recent_users') {
    const days = Number.isFinite(audience.daysSinceSignup) ? Math.max(1, Number(audience.daysSinceSignup)) : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    query.createdAt = { $gte: since };
  }

  type AudienceUser = {
    _id: mongoose.Types.ObjectId;
    email: string;
    firstName?: string;
    lastName?: string;
  };

  const users = await User.find(query)
    .select('_id email firstName lastName')
    .sort({ createdAt: -1 })
    .lean<AudienceUser[]>();

  const seen = new Set<string>();
  const recipients: ResolvedRecipient[] = [];

  for (const user of users) {
    const normalized = normalizeEmail(user.email);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    recipients.push({
      email: normalized,
      userId: user._id?.toString?.(),
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  return recipients;
}

function buildRecipientVariables(recipient: ResolvedRecipient): RenderVariables {
  const fullName = [recipient.firstName, recipient.lastName].filter(Boolean).join(' ').trim();
  return {
    email: recipient.email,
    firstName: recipient.firstName || 'Bonjour',
    lastName: recipient.lastName || '',
    fullName,
    dashboardUrl: `${APP_URL}/dashboard`,
    appUrl: APP_URL,
  };
}

export async function dispatchEmailCampaign(campaignId: string, initiatedByUserId?: string) {
  await connectDB();

  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) {
    return { success: false, error: 'Campagne introuvable' };
  }

  const recipients = await resolveCampaignRecipients(campaign.audience);
  campaign.audience.lastResolvedCount = recipients.length;
  campaign.recipientsSnapshot = recipients.map((recipient) => ({
    email: recipient.email,
    userId: recipient.userId && mongoose.Types.ObjectId.isValid(recipient.userId)
      ? new mongoose.Types.ObjectId(recipient.userId)
      : undefined,
    firstName: recipient.firstName,
    lastName: recipient.lastName,
  }));

  if (!recipients.length) {
    campaign.status = 'failed';
    campaign.lastError = 'Aucun destinataire résolu pour cette audience';
    campaign.stats = { total: 0, sent: 0, failed: 0, skipped: 0 };
    await campaign.save();
    return { success: false, error: campaign.lastError };
  }

  campaign.status = 'sending';
  campaign.lastError = undefined;
  campaign.stats = { total: recipients.length, sent: 0, failed: 0, skipped: 0 };
  await campaign.save();

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let lastError: string | undefined;

  for (const recipient of recipients) {
    const result = await sendTemplatedEmail({
      to: recipient.email,
      category: 'campaign',
      templateId: campaign.templateId?.toString(),
      templateName: campaign.name,
      campaignId: campaign._id.toString(),
      campaignName: campaign.name,
      userId: recipient.userId,
      variables: buildRecipientVariables(recipient),
      metadata: {
        initiatedByUserId,
        audienceType: campaign.audience.type,
      },
      subjectOverride: campaign.subject,
      bodyOverride: campaign.body,
    });

    if (result.status === 'sent') sent += 1;
    else if (result.status === 'skipped') skipped += 1;
    else {
      failed += 1;
      if (result.error) {
        lastError = result.error instanceof Error ? result.error.message : String(result.error);
      }
    }
  }

  campaign.stats = { total: recipients.length, sent, failed, skipped };
  campaign.sentAt = new Date();
  campaign.status = sent > 0 ? 'sent' : 'failed';
  campaign.lastError = lastError;
  await campaign.save();

  return {
    success: sent > 0,
    campaign,
    stats: campaign.stats,
  };
}

export async function sendWelcomeEmail(userEmail: string, firstName: string) {
  return sendTemplatedEmail({
    to: userEmail,
    automationKey: 'welcome',
    category: 'automation',
    variables: {
      firstName,
      onboardingLink: `${APP_URL}/onboarding`,
      dashboardUrl: `${APP_URL}/dashboard`,
      appUrl: APP_URL,
    },
  });
}

export async function sendPaymentNotification(userEmail: string, planName: string, amount: string, invoiceUrl?: string | null) {
  return sendTemplatedEmail({
    to: userEmail,
    automationKey: 'payment',
    category: 'automation',
    variables: {
      planName,
      amount,
      invoiceUrl: invoiceUrl || `${APP_URL}/dashboard`,
      dashboardUrl: `${APP_URL}/dashboard`,
      appUrl: APP_URL,
    },
  });
}

export async function sendActionNotification(adminEmail: string, actorName: string, actionDesc: string, workspaceName: string) {
  return sendTemplatedEmail({
    to: adminEmail,
    automationKey: 'workspace_action',
    category: 'automation',
    variables: {
      actorName,
      actionDesc,
      workspaceName,
      dashboardUrl: `${APP_URL}/dashboard`,
      appUrl: APP_URL,
    },
  });
}

export async function sendInvitationEmail(email: string, token: string, workspaceName: string, inviterName: string) {
  return sendTemplatedEmail({
    to: email,
    automationKey: 'invitation',
    category: 'automation',
    variables: {
      inviterName,
      workspaceName,
      joinUrl: `${APP_URL}/join/${token}`,
      appUrl: APP_URL,
    },
  });
}

export async function sendWorkspaceWelcomeEmail(email: string, workspaceName: string, inviterName: string) {
  return sendTemplatedEmail({
    to: email,
    automationKey: 'workspace_welcome',
    category: 'automation',
    variables: {
      inviterName,
      workspaceName,
      dashboardUrl: `${APP_URL}/dashboard`,
      appUrl: APP_URL,
    },
  });
}
