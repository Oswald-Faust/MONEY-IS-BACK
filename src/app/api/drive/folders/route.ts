import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { DriveFolder } from '@/models';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, projectId, parentId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 });
    }

    await connectToDatabase();

    const folder = await DriveFolder.create({
      name,
      project: projectId ? new mongoose.Types.ObjectId(projectId) : null,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      owner: new mongoose.Types.ObjectId(auth.userId),
    } as any);

    return NextResponse.json(folder, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
