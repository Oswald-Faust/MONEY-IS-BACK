import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { verifyAuth } from '@/lib/auth';
import { DriveFolder, DriveFile } from '@/models';
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

    // Find folder
    const folder = await DriveFolder.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      owner: new mongoose.Types.ObjectId(auth.userId) 
    }) as any;
    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 });
    }

    // Function to recursively find and delete subfolders and files
    const deleteRecursive = async (folderId: string) => {
      // Find subfolders
      const subfolders = await DriveFolder.find({ parentId: folderId });
      for (const sub of subfolders) {
        await deleteRecursive(sub._id.toString());
      }

      // Find and delete files in this folder
      const files = await DriveFile.find({ folderId });
      for (const file of files) {
        if (file.url) {
          try {
            await del(file.url);
          } catch (e) {
            console.error('Failed to delete blob:', file.url, e);
          }
        }
        await DriveFile.deleteOne({ _id: file._id });
      }

      // Delete the folder itself
      await DriveFolder.deleteOne({ _id: folderId });
    };

    await deleteRecursive(id);

    return NextResponse.json({ success: true, message: 'Dossier et son contenu supprimés' });
  } catch (error: any) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(req);
    const { name, projectId, parentId } = await req.json();
    
    await connectToDatabase();

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (projectId !== undefined) updateData.project = projectId ? new mongoose.Types.ObjectId(projectId) : null;
    if (parentId !== undefined) updateData.parentId = parentId ? new mongoose.Types.ObjectId(parentId) : null;

    const folder = await DriveFolder.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), owner: new mongoose.Types.ObjectId(auth.userId) },
      { $set: updateData },
      { new: true }
    ) as any;

    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error: any) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
