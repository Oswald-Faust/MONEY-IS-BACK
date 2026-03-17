export function normalizePhoneNumber(input: string) {
  const digits = input.replace(/[^\d+]/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('+')) {
    return digits;
  }

  return `+${digits}`;
}

export function normalizeWhatsAppUserId(input: string) {
  return input.replace(/[^\d]/g, '');
}

export function trimToUndefined(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
