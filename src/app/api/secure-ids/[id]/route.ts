import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import SecureId from '@/models/SecureId';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        await connectToDatabase();
        
        const secureId = await SecureId.findById(id).select('+password');

        if (!secureId) {
             return NextResponse.json({ error: 'Element non trouvé' }, { status: 404 });
        }

        // Check access via Project
        const project = await Project.findById(secureId.project);
        if (!project) {
             return NextResponse.json({ error: 'Projet associé non trouvé' }, { status: 404 });
        }

        const isGlobalAdmin = auth.role === 'admin';
        const isOwner = project.owner.toString() === auth.userId;
        const member = project.members.find((m: any) => m.user.toString() === auth.userId);
        
        if (!isGlobalAdmin && !isOwner && (!member || member.role !== 'admin')) {
             return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
        }
        
        let decryptedPassword = '';
        try {
             decryptedPassword = decrypt(secureId.password);
        } catch (e) {
            // If decryption fails, it might be legacy or bad data. Return raw or error.
            console.error("Decryption failed", e);
            decryptedPassword = "Erreur de déchiffrement";
        }

        return NextResponse.json({
            ...secureId.toObject(),
            password: decryptedPassword
        });

    } catch (error: any) {
        console.error('Error fetching secure ID:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
     try {
        const { id } = await params;
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        await connectToDatabase();
        
        const secureId = await SecureId.findById(id);
        
        if (!secureId) {
            return NextResponse.json({ error: 'Element non trouvé' }, { status: 404 });
        }

        const project = await Project.findById(secureId.project);
        if (project) {
            const isGlobalAdmin = auth.role === 'admin';
            const isOwner = project.owner.toString() === auth.userId;
            const member = project.members.find((m: any) => m.user.toString() === auth.userId);
            
            if (!isGlobalAdmin && !isOwner && (!member || member.role !== 'admin')) {
                 return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
            }
        }

        await SecureId.findByIdAndDelete(id);
        
        if (!secureId) {
            return NextResponse.json({ error: 'Element non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting secure ID:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const { title, password, username, link, notes, category } = body;

        await connectToDatabase();

        const secureIdToUpdate = await SecureId.findById(id);
        if (!secureIdToUpdate) {
            return NextResponse.json({ error: 'Element non trouvé' }, { status: 404 });
        }

        const project = await Project.findById(secureIdToUpdate.project);
        if (project) {
            const isGlobalAdmin = auth.role === 'admin';
            const isOwner = project.owner.toString() === auth.userId;
            const member = project.members.find((m: any) => m.user.toString() === auth.userId);
            
            if (!isGlobalAdmin && !isOwner && (!member || member.role !== 'admin')) {
                 return NextResponse.json({ error: 'Accès refusé - Admin requis' }, { status: 403 });
            }
        }

        const updateData: any = {
            title, username, link, notes, category
        };

        if (password) {
            updateData.password = encrypt(password);
        }

        const secureId = await SecureId.findByIdAndUpdate(id, updateData, { new: true });

        if (!secureId) {
            return NextResponse.json({ error: 'Element non trouvé' }, { status: 404 });
        }

        return NextResponse.json(secureId);

    } catch (error: any) {
        console.error('Error updating secure ID:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
