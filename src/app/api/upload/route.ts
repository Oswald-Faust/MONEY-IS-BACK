import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { put } from '@vercel/blob';
import { verifyAuth } from '@/lib/auth';
import { User } from '@/models';
import GlobalSettings from '@/models/GlobalSettings';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  // ── Client-side upload (JSON body) — contourne la limite 4.5MB de Vercel ──
  if (contentType.includes('application/json')) {
    const body = (await request.json()) as HandleUploadBody;

    try {
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (_pathname, clientPayload) => {
          // Vérification auth via le header Authorization envoyé par upload()
          const auth = await verifyAuth(request);
          if (!auth.success) throw new Error(auth.error || 'Non autorisé');

          await connectToDatabase();
          const [settings, userObj] = await Promise.all([
            GlobalSettings.findOne(),
            User.findById(auth.userId).select('driveAccess role'),
          ]);

          const payload = JSON.parse(clientPayload || '{}');
          const skipChecks = ['avatar', 'workspace-icon'].includes(payload.uploadType || '');

          if (!skipChecks && userObj?.role !== 'admin') {
            if (settings?.permissions?.driveAccess === false || userObj?.driveAccess === false) {
              throw new Error('Accès Drive restreint par un administrateur');
            }
          }

          return {
            maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
          };
        },
        onUploadCompleted: async () => {
          // L'entrée DriveFile est créée côté client via /api/upload/complete
        },
      });

      return NextResponse.json(jsonResponse);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erreur upload' },
        { status: 400 }
      );
    }
  }

  // ── Server-side upload (multipart/form-data) — avatars & icônes seulement ──
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();

    const [settings, userObj] = await Promise.all([
      GlobalSettings.findOne(),
      User.findById(auth.userId).select('driveAccess role'),
    ]);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get('type');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const originalName = file.name;
    const skipChecks = ['avatar', 'workspace-icon'].includes(uploadType || '');

    if (!skipChecks && userObj?.role !== 'admin') {
      const isGlobalDriveDisabled = settings?.permissions?.driveAccess === false;
      const isUserDriveDisabled = userObj?.driveAccess === false;
      if (isGlobalDriveDisabled || isUserDriveDisabled) {
        return NextResponse.json(
          { success: false, error: 'Accès Drive restreint par un administrateur' },
          { status: 403 }
        );
      }
    }

    const allowedExtensions = settings?.permissions?.allowedFileTypes || [];
    if (!skipChecks && allowedExtensions.length > 0 && userObj?.role !== 'admin') {
      const parts = originalName.split('.');
      const extension = (parts.length > 1 ? '.' + parts.pop() : '').toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return NextResponse.json(
          { success: false, error: `Type de fichier non autorisé. Extensions permises: ${allowedExtensions.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const blob = await put(originalName, file, { access: 'public', addRandomSuffix: true });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'upload";
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
