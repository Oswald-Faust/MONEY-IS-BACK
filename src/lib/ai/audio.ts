export async function transcribeAudioBuffer({
  buffer,
  filename,
  mimeType,
  language = 'fr',
}: {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  language?: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY manquant');
  }

  const model = process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe';
  const formData = new FormData();
  const fileBytes = new Uint8Array(buffer.length);
  fileBytes.set(buffer);
  formData.append(
    'file',
    new Blob([fileBytes.buffer], { type: mimeType || 'audio/ogg' }),
    filename
  );
  formData.append('model', model);
  formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur de transcription audio OpenAI');
  }

  const text = typeof data?.text === 'string' ? data.text.trim() : '';
  if (!text) {
    throw new Error('Transcription audio vide');
  }

  return {
    text,
    provider: 'openai' as const,
    model,
  };
}
