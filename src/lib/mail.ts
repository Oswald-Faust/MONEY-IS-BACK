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

function buildEmailLayout({
  accent = '#6366f1',
  accentSoft = '#eef2ff',
  preheader,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaUrl,
  secondaryLabel,
  secondaryUrl,
  contentHtml,
}: {
  accent?: string;
  accentSoft?: string;
  preheader: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  contentHtml: string;
}) {
  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f5fb;margin:0;padding:24px 12px;font-family:Arial,sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;">
            <tr>
              <td style="padding:0 0 10px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="font-size:12px;color:#667085;padding:0 4px;">
                      Edwin
                    </td>
                    <td align="right" style="font-size:12px;color:#98a2b3;padding:0 4px;">
                      Notification automatique
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#ffffff;border:1px solid #e6e8f0;border-radius:22px;overflow:hidden;box-shadow:0 12px 32px rgba(16,24,40,.08);">
            <tr>
              <td style="padding:0;">
                <div style="height:6px;background:linear-gradient(90deg, ${accent} 0%, #ffffff 140%);"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 18px 28px;background:linear-gradient(180deg, ${accentSoft} 0%, rgba(255,255,255,0) 100%);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="top">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding-right:12px;" valign="middle">
                            <div style="width:38px;height:38px;border-radius:12px;background:${accent};color:#fff;text-align:center;line-height:38px;font-weight:700;font-size:18px;">E</div>
                          </td>
                          <td valign="middle">
                            <div style="display:inline-block;background:#ffffff;color:${accent};border:1px solid ${accent}22;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
                              ${eyebrow || 'Edwin'}
                            </div>
                          </td>
                        </tr>
                      </table>
                      <h1 style="margin:16px 0 8px 0;font-size:30px;line-height:1.15;color:#101828;letter-spacing:-0.02em;">${title}</h1>
                      ${subtitle ? `<p style="margin:0;color:#475467;font-size:15px;line-height:1.6;">${subtitle}</p>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px 8px 28px;color:#344054;font-size:14px;line-height:1.7;">
                ${contentHtml}
              </td>
            </tr>
            ${(ctaLabel && ctaUrl) ? `
              <tr>
                <td style="padding:10px 28px 8px 28px;">
                  <a href="${ctaUrl}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;font-size:14px;">
                    ${ctaLabel}
                  </a>
                  ${(secondaryLabel && secondaryUrl) ? `
                    <a href="${secondaryUrl}" style="display:inline-block;margin-left:8px;color:${accent};text-decoration:none;font-weight:600;padding:12px 10px;font-size:14px;">
                      ${secondaryLabel}
                    </a>
                  ` : ''}
                </td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding:8px 28px 0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecf0;border-radius:14px;background:#fcfcfd;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0 0 6px 0;color:#101828;font-size:13px;font-weight:700;">Besoin d’aide ?</p>
                      <p style="margin:0;color:#667085;font-size:12px;line-height:1.6;">
                        Répondez à cet e-mail ou contactez-nous depuis votre dashboard. Nous vous aidons à configurer votre espace rapidement.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 22px 28px;">
                <div style="border-top:1px solid #eaecf0;margin-bottom:14px;"></div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color:#667085;font-size:12px;line-height:1.6;">
                      Cet e-mail a été envoyé automatiquement par <strong style="color:#344054;">Edwin</strong>.<br/>
                      Si vous n&apos;êtes pas concerné(e), vous pouvez l&apos;ignorer.
                    </td>
                    <td align="right" valign="top" style="color:#98a2b3;font-size:11px;">
                      <a href="${APP_URL}" style="color:#667085;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, '')}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

const DEFAULT_EMAIL_TEMPLATES: EmailTemplateSeed[] = [
  {
    name: 'Bienvenue - Nouvel Utilisateur',
    subject: 'Bienvenue chez Edwin, {{firstName}} !',
    body: buildEmailLayout({
      accent: '#6366f1',
      accentSoft: '#eef2ff',
      preheader: 'Votre compte Edwin est prêt. Finalisez votre onboarding et démarrez rapidement.',
      eyebrow: 'Compte créé',
      title: 'Bienvenue {{firstName}}',
      subtitle: 'Votre compte Edwin est prêt. On vous aide à démarrer en quelques étapes simples.',
      ctaLabel: 'Finaliser mon onboarding',
      ctaUrl: '{{{onboardingLink}}}',
      secondaryLabel: 'Ouvrir le dashboard',
      secondaryUrl: '{{{dashboardUrl}}}',
      contentHtml: `
        <p style="margin:0 0 12px 0;">Merci d&apos;avoir rejoint Edwin. Votre espace est prêt pour organiser vos projets, vos membres et vos automatisations.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;background:#f8faff;border:1px solid #e5e7ff;border-radius:14px;">
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6366f1;">Prochaines étapes</p>
              <p style="margin:0;color:#344054;">
                1. Finalisez votre onboarding<br/>
                2. Créez votre workspace<br/>
                3. Invitez votre équipe et lancez votre premier projet
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px 0;">
          <tr>
            <td width="50%" style="padding-right:6px;">
              <div style="border:1px solid #eaecf0;border-radius:12px;padding:12px;background:#fff;">
                <p style="margin:0 0 4px 0;font-size:11px;color:#667085;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Rapide</p>
                <p style="margin:0;font-size:13px;color:#344054;">Onboarding guidé en quelques minutes.</p>
              </div>
            </td>
            <td width="50%" style="padding-left:6px;">
              <div style="border:1px solid #eaecf0;border-radius:12px;padding:12px;background:#fff;">
                <p style="margin:0 0 4px 0;font-size:11px;color:#667085;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Collaboratif</p>
                <p style="margin:0;font-size:13px;color:#344054;">Invitez votre équipe quand vous êtes prêt.</p>
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:0;">Si cette inscription ne vient pas de vous, ignorez simplement cet e-mail.</p>
      `,
    }),
    type: 'automation',
    automationKey: 'welcome',
    variables: ['firstName', 'onboardingLink'],
  },
  {
    name: 'Facture / Nouvel abonnement',
    subject: 'Confirmation de votre abonnement {{planName}}',
    body: buildEmailLayout({
      accent: '#10b981',
      accentSoft: '#ecfdf3',
      preheader: 'Paiement confirmé et abonnement activé sur Edwin.',
      eyebrow: 'Paiement reçu',
      title: 'Abonnement confirmé',
      subtitle: 'Votre paiement a été validé et votre plan est maintenant actif.',
      ctaLabel: 'Voir la facture',
      ctaUrl: '{{{invoiceUrl}}}',
      secondaryLabel: 'Retour au dashboard',
      secondaryUrl: '{{{dashboardUrl}}}',
      contentHtml: `
        <p style="margin:0 0 12px 0;">Merci pour votre confiance. Voici le récapitulatif de votre abonnement :</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8f5ef;background:#f7fffb;border-radius:14px;">
          <tr>
            <td style="padding:16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#667085;font-size:13px;padding:0 0 10px 0;">Plan</td>
                  <td align="right" style="color:#101828;font-size:14px;font-weight:700;padding:0 0 10px 0;">{{planName}}</td>
                </tr>
                <tr>
                  <td style="color:#667085;font-size:13px;">Montant</td>
                  <td align="right" style="color:#101828;font-size:18px;font-weight:800;">{{amount}}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0 0;">
          <tr>
            <td width="33%" style="padding-right:6px;">
              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;">
                <p style="margin:0;color:#667085;font-size:11px;">Statut</p>
                <p style="margin:4px 0 0 0;color:#10b981;font-size:13px;font-weight:700;">Confirmé</p>
              </div>
            </td>
            <td width="33%" style="padding:0 3px;">
              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;">
                <p style="margin:0;color:#667085;font-size:11px;">Accès</p>
                <p style="margin:4px 0 0 0;color:#101828;font-size:13px;font-weight:700;">Activé</p>
              </div>
            </td>
            <td width="33%" style="padding-left:6px;">
              <div style="border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;">
                <p style="margin:0;color:#667085;font-size:11px;">Facture</p>
                <p style="margin:4px 0 0 0;color:#101828;font-size:13px;font-weight:700;">Disponible</p>
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:12px 0 0 0;">Conservez cet e-mail pour votre suivi. Vous pouvez retrouver vos informations depuis votre espace Edwin.</p>
      `,
    }),
    type: 'automation',
    automationKey: 'payment',
    variables: ['planName', 'amount', 'invoiceUrl', 'dashboardUrl'],
  },
  {
    name: 'Notification Action Workspace',
    subject: 'Edwin : Nouvelle activité dans {{workspaceName}}',
    body: buildEmailLayout({
      accent: '#111827',
      accentSoft: '#f2f4f7',
      preheader: 'Nouvelle activité dans votre workspace Edwin.',
      eyebrow: 'Activité workspace',
      title: 'Nouvelle activité détectée',
      subtitle: 'Une action importante a été effectuée dans votre espace de travail.',
      ctaLabel: 'Voir l’activité',
      ctaUrl: '{{{dashboardUrl}}}',
      contentHtml: `
        <p style="margin:0;"> <strong>{{actorName}}</strong> {{actionDesc}} dans <strong>{{workspaceName}}</strong>.</p>
      `,
    }),
    type: 'automation',
    automationKey: 'workspace_action',
    variables: ['actorName', 'actionDesc', 'workspaceName', 'dashboardUrl'],
  },
  {
    name: 'Invitation Workspace',
    subject: 'Invitation à rejoindre {{workspaceName}} sur Edwin',
    body: buildEmailLayout({
      accent: '#6366f1',
      accentSoft: '#eef2ff',
      preheader: 'Vous avez reçu une invitation à rejoindre un workspace Edwin.',
      eyebrow: 'Invitation',
      title: 'Vous avez été invité',
      subtitle: '<strong>{{inviterName}}</strong> vous invite à rejoindre <strong>{{workspaceName}}</strong> sur Edwin.',
      ctaLabel: 'Accepter l’invitation',
      ctaUrl: '{{{joinUrl}}}',
      secondaryLabel: 'Ouvrir Edwin',
      secondaryUrl: '{{{appUrl}}}',
      contentHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7ff;background:#f8faff;border-radius:14px;margin:4px 0 12px 0;">
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0 0 6px 0;color:#667085;font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Workspace</p>
              <p style="margin:0;color:#101828;font-size:16px;font-weight:700;">{{workspaceName}}</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px 0;">
          <tr>
            <td style="border:1px solid #eaecf0;border-radius:12px;padding:12px;background:#fff;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#101828;font-weight:700;">Ce que vous pourrez faire après acceptation</p>
              <p style="margin:0;color:#475467;font-size:13px;line-height:1.6;">
                • Accéder au workspace et aux projets autorisés<br/>
                • Collaborer avec votre équipe<br/>
                • Recevoir les mises à jour liées au travail
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 8px 0;">Le lien d’invitation expire dans <strong>7 jours</strong>.</p>
        <p style="margin:0;color:#667085;font-size:13px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
        <p style="margin:8px 0 0 0;word-break:break-all;color:#6366f1;font-size:12px;">{{{joinUrl}}}</p>
      `,
    }),
    type: 'automation',
    automationKey: 'invitation',
    variables: ['inviterName', 'workspaceName', 'joinUrl'],
  },
  {
    name: 'Ajout à un workspace',
    subject: 'Vous avez été ajouté à {{workspaceName}}',
    body: buildEmailLayout({
      accent: '#8b5cf6',
      accentSoft: '#f5f3ff',
      preheader: 'Vous avez été ajouté à un workspace Edwin.',
      eyebrow: 'Workspace',
      title: 'Bienvenue dans {{workspaceName}}',
      subtitle: '<strong>{{inviterName}}</strong> vous a ajouté à ce workspace.',
      ctaLabel: 'Ouvrir le dashboard',
      ctaUrl: '{{{dashboardUrl}}}',
      contentHtml: `
        <p style="margin:0 0 12px 0;">Votre accès est maintenant actif. Vous pouvez commencer à collaborer immédiatement.</p>
        <ul style="margin:0;padding-left:18px;color:#344054;">
          <li>Consultez vos projets</li>
          <li>Vérifiez vos accès</li>
          <li>Commencez à collaborer avec l’équipe</li>
        </ul>
      `,
    }),
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

export async function seedDefaultEmailTemplates(options?: { forceUpdate?: boolean }): Promise<void> {
  await connectDB();
  const forceUpdate = options?.forceUpdate === true;

  for (const seed of DEFAULT_EMAIL_TEMPLATES) {
    if (!seed.automationKey) continue;

    if (forceUpdate) {
      await EmailTemplate.findOneAndUpdate(
        { automationKey: seed.automationKey },
        {
          $set: {
            name: seed.name,
            subject: seed.subject,
            body: seed.body,
            type: seed.type,
            variables: seed.variables,
          },
          $setOnInsert: {
            automationKey: seed.automationKey,
          },
        },
        { upsert: true, new: true }
      );
      continue;
    }

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
