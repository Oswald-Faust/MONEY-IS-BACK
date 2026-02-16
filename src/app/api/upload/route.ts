import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyAuth } from '@/lib/auth';
import { DriveFile, User } from '@/models';
import GlobalSettings from '@/models/GlobalSettings';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch user and settings for permission check
    const [settings, userObj] = await Promise.all([
      GlobalSettings.findOne(),
      User.findById(auth.userId).select('driveAccess role')
    ]);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const folderId = formData.get('folderId') as string;

    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get('type');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const originalName = file.name;

    // 1. Check Module Access (Skip for avatars and admins)
    const skipChecks = ['avatar', 'workspace-icon'].includes(uploadType || '');
    if (!skipChecks && userObj?.role !== 'admin') {
       const isGlobalDriveDisabled = settings?.permissions?.driveAccess === false;
       const isUserDriveDisabled = userObj?.driveAccess === false;

       if (isGlobalDriveDisabled || isUserDriveDisabled) {
         return NextResponse.json({ success: false, error: 'Accès Drive restreint par un administrateur' }, { status: 403 });
       }
    }

    // 2. Check File Type (Skip for avatars and admins)
    const allowedExtensions = settings?.permissions?.allowedFileTypes || [];
    if (!skipChecks && allowedExtensions.length > 0 && userObj?.role !== 'admin') {
      const parts = originalName.split('.');
      const extension = (parts.length > 1 ? '.' + parts.pop() : '').toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        return NextResponse.json({ 
          success: false, 
          error: `Type de fichier non autorisé. Extensions permises: ${allowedExtensions.join(', ')}` 
        }, { status: 400 });
      }
    }

    // Limit check (e.g. 50MB) 
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, error: 'Fichier trop volumineux (Max 50MB)' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(originalName, file, {
      access: 'public',
      // The token is automatically picked up from process.env.BLOB_READ_WRITE_TOKEN
    });

    if (skipChecks) {
        return NextResponse.json({ 
            success: true, 
            url: blob.url,
            message: `${uploadType === 'avatar' ? 'Avatar' : 'Icône'} uploadé avec succès` 
        });
    }

    await connectToDatabase();

    const driveFile = await DriveFile.create({
        name: originalName,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url: blob.url,
        project: projectId ? new mongoose.Types.ObjectId(projectId) : null,
        folderId: folderId ? new mongoose.Types.ObjectId(folderId) : null,
        owner: new mongoose.Types.ObjectId(auth.userId)
    } as any);

    return NextResponse.json({ 
        success: true, 
        file: driveFile,
        url: blob.url,
        message: 'Fichier uploadé avec succès sur Vercel Blob' 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
