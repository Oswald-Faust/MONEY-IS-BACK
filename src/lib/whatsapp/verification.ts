import type { IWhatsAppLink } from '@/models/WhatsAppLink';

const DEFAULT_VERIFICATION_MINUTES = 30;

function normalizeDigits(value: string) {
  return value.replace(/[^\d]/g, '');
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getVerificationExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + DEFAULT_VERIFICATION_MINUTES);
  return expiresAt;
}

export function buildVerificationMessage({
  workspaceName,
  verificationCode,
}: {
  workspaceName: string;
  verificationCode: string;
}) {
  return `Bonjour, c'est Edwin.\n\nPour connecter ce numéro WhatsApp au workspace "${workspaceName}", répondez avec le code ${verificationCode}.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`;
}

export function buildVerificationConfirmedMessage(workspaceName: string) {
  return `Connexion WhatsApp confirmée pour le workspace "${workspaceName}". Vous pouvez maintenant demander à Edwin de créer des tâches, des objectifs et des notes directement ici.`;
}

export function buildVerificationReminderMessage({
  workspaceName,
  verificationCode,
  expired,
}: {
  workspaceName: string;
  verificationCode: string;
  expired?: boolean;
}) {
  if (expired) {
    return `Le code précédent a expiré pour le workspace "${workspaceName}". Un nouveau code vient d'être généré : ${verificationCode}. Répondez avec ce code pour terminer la connexion.`;
  }

  return `Ce numéro n'est pas encore confirmé pour le workspace "${workspaceName}". Répondez avec le code ${verificationCode} pour terminer la connexion.`;
}

export function doesMessageConfirmVerification(
  text: string,
  link: Pick<IWhatsAppLink, 'verificationCode'>
) {
  const code = normalizeDigits(link.verificationCode || '');
  const digits = normalizeDigits(text);

  if (code && digits.includes(code)) {
    return true;
  }

  const normalized = text.trim().toLowerCase();
  return normalized === 'confirmer' || normalized === 'confirme' || normalized === 'confirm';
}
