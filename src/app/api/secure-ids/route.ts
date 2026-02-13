import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import SecureId from '@/models/SecureId';
import Project from '@/models/Project';
import connectToDatabase from '@/lib/mongodb';
import { encrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project');

    if (!projectId) {
      return NextResponse.json({ error: 'ID du projet requis' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify project access
    const project = await Project.findById(projectId);
    if (!project) {
        return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Check if user is a member/owner OR global admin
    const isGlobalAdmin = auth.role === 'admin';
    const isOwner = project.owner.toString() === auth.userId;
    const member = project.members.find((m: any) => m.user.toString() === auth.userId);
    
    if (!isGlobalAdmin && !isOwner && (!member || member.role !== 'admin')) {
        return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
    }

    // List Secure IDs (exclude password by default via schema select: false)
    const secureIds = await SecureId.find({ project: projectId }).sort({ createdAt: -1 });

    return NextResponse.json(secureIds);
  } catch (error: any) {
    console.error('Error fetching secure IDs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const { title, password, projectId, username, link, notes, category } = body;

        if (!title || !password || !projectId) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        await connectToDatabase();

        // Verify project access
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
        }

        // Check if user is a member/owner OR global admin
        const isGlobalAdmin = auth.role === 'admin';
        const isOwner = project.owner.toString() === auth.userId;
        const member = project.members.find((m: any) => m.user.toString() === auth.userId);
        
        if (!isGlobalAdmin && !isOwner && (!member || member.role !== 'admin')) {
            return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
        }

        // Encrypt password
        const encryptedPassword = encrypt(password);

        const newSecureId = await SecureId.create({
            title,
            password: encryptedPassword,
            project: projectId,
            username,
            link,
            notes,
            category,
            owner: auth.userId,
            sharedWith: [] 
        });

        return NextResponse.json(newSecureId, { status: 201 });

    } catch (error: any) {
        console.error('Error creating secure ID:', error);
        return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
    }
}
