import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { DriveFile } from '@/models';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();

    const { url, name, size, type, projectId, folderId } = await request.json();

    if (!url || !name) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes (url, name)' },
        { status: 400 }
      );
    }

    const driveFile = await DriveFile.create({
      name,
      type: type || 'application/octet-stream',
      size: size || 0,
      url,
      project: projectId ? new mongoose.Types.ObjectId(projectId) : null,
      folderId: folderId ? new mongoose.Types.ObjectId(folderId) : null,
      owner: new mongoose.Types.ObjectId(auth.userId),
    } as any);

    return NextResponse.json({ success: true, file: driveFile });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur';
    console.error('Upload complete error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
