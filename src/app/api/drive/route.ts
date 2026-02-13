import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { DriveFolder, DriveFile, User, Project } from '@/models';
import GlobalSettings from '@/models/GlobalSettings';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import { list } from '@vercel/blob';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();

    // Check global and user-specific drive access
    const [settings, user] = await Promise.all([
      GlobalSettings.findOne(),
      User.findById(auth.userId).select('driveAccess role')
    ]);

    const isGlobalDriveDisabled = settings && settings.permissions && settings.permissions.driveAccess === false;
    const isUserDriveDisabled = user && user.driveAccess === false;

    if ((isGlobalDriveDisabled || isUserDriveDisabled) && user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès Drive restreint par un administrateur' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project');
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');

    // Visibility logic: owner OR project member
    let folderQuery: any = {};
    let fileQuery: any = {};

    if (user?.role !== 'admin') {
      // Find projects user belongs to
      const userProjects = await Project.find({
        $or: [
          { owner: new mongoose.Types.ObjectId(auth.userId) },
          { 'members.user': new mongoose.Types.ObjectId(auth.userId) }
        ]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);

      const visibilityFilter = {
        $or: [
          { owner: new mongoose.Types.ObjectId(auth.userId) },
          { project: { $in: projectIds } }
        ]
      };

      folderQuery = { ...visibilityFilter };
      fileQuery = { ...visibilityFilter };
    }

    if (projectId) {
      folderQuery.project = new mongoose.Types.ObjectId(projectId);
      fileQuery.project = new mongoose.Types.ObjectId(projectId);
    }

    if (search) {
      folderQuery.name = { $regex: search, $options: 'i' };
      fileQuery.name = { $regex: search, $options: 'i' };
    } else if (folderId) {
      folderQuery.parentId = new mongoose.Types.ObjectId(folderId);
      fileQuery.folderId = new mongoose.Types.ObjectId(folderId);
    } else {
      folderQuery.parentId = null;
      fileQuery.folderId = null;
    }

    const [folders, initialFiles] = await Promise.all([
      DriveFolder.find(folderQuery as Record<string, QueryVal>).sort({ name: 1 }),
      DriveFile.find(fileQuery as Record<string, QueryVal>).sort({ createdAt: -1 }),
    ]);

    let files = initialFiles;

    // Self-healing: Sync with Vercel Blob
    try {
      const { blobs } = await list();
      const blobUrls = new Set(blobs.map(b => b.url));
      
      const orphanIds: mongoose.Types.ObjectId[] = [];
      const healthyFiles = files.filter(file => {
        const exists = blobUrls.has(file.url);
        if (!exists) orphanIds.push(file._id as mongoose.Types.ObjectId);
        return exists;
      });

      // Async cleanup of orphans in background (don't block the response too long)
      if (orphanIds.length > 0) {
        DriveFile.deleteMany({ _id: { $in: orphanIds } }).exec();
      }
      
      files = healthyFiles;
    } catch (syncError) {
      console.warn('Vercel Blob sync failed:', syncError);
      // We still return the files even if sync fails
    }

    // Calculate path for breadcrumbs
    const path = [];
    if (folderId) {
      let currentId: string | null = folderId;
      while (currentId) {
        const f = await DriveFolder.findById(currentId);
        if (f) {
          path.unshift({ _id: f._id.toString(), name: f.name });
          currentId = f.parentId ? f.parentId.toString() : null;
        } else {
          break;
        }
      }
    }

    return NextResponse.json({ folders, files, path });
  } catch (error: Error | any) {
    const errorMessage = (error as Error).message || 'Erreur serveur';
    console.error('Error fetching drive content:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
