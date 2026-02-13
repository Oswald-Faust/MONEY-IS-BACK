import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { verifyAuth } from '@/lib/auth';
import { DriveFile } from '@/models';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(req);
    await connectToDatabase();

    // Ensure we are using valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const file = await DriveFile.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      owner: new mongoose.Types.ObjectId(auth.userId) 
    }) as any;

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé ou non autorisé' }, { status: 404 });
    }

    // Delete from Vercel Blob
    if (file.url) {
      try {
        await del(file.url);
      } catch (blobError) {
        console.error('Vercel Blob deletion error:', blobError);
        // We continue even if blob deletion fails, to avoid "stuck" files in DB
      }
    }

    // Delete from MongoDB
    const deleteResult = await DriveFile.deleteOne({ 
      _id: new mongoose.Types.ObjectId(id),
      owner: new mongoose.Types.ObjectId(auth.userId)
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'La suppression en base de données a échoué' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Fichier supprimé' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(req);
    const { name, folderId, projectId } = await req.json();
    
    await connectToDatabase();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (folderId !== undefined) updateData.folderId = folderId ? new mongoose.Types.ObjectId(folderId) : null;
    if (projectId !== undefined) updateData.project = projectId ? new mongoose.Types.ObjectId(projectId) : null;

    const file = await DriveFile.findOneAndUpdate(
      { _id: id, owner: auth.userId },
      { $set: updateData },
      { new: true }
    ) as any;

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error: any) {
    console.error('Error updating file:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
