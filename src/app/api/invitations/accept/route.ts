import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Invitation from '@/models/Invitation';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Vous devez être connecté pour accepter une invitation' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token requis' }, { status: 400 });
    }

    // Cast as any to access projectIds if not in type definition yet, or relying on schema
    const invitation = await Invitation.findOne({ token, status: 'pending' });

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Invitation invalide ou expirée' }, { status: 404 });
    }

    if (new Date() > invitation.expiresAt) {
        invitation.status = 'expired';
        await invitation.save();
        return NextResponse.json({ success: false, error: 'Invitation expirée' }, { status: 410 });
    }

    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) {
        return NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 404 });
    }

    // Check if already member
    const isMember = workspace.members.some(m => m.user.toString() === auth.userId) || workspace.owner.toString() === auth.userId;
    if (isMember) {
        // Just mark invitation handled if they are already in
        invitation.status = 'accepted';
        await invitation.save();
        return NextResponse.json({ success: true, message: 'Vous êtes déjà membre de ce workspace', workspaceId: workspace._id });
    }

    // Add to workspace
    workspace.members.push({
        user: new mongoose.Types.ObjectId(auth.userId),
        role: invitation.role,
        joinedAt: new Date()
    });
    await workspace.save();

    // Add to user
    await User.findByIdAndUpdate(auth.userId, { $addToSet: { workspaces: workspace._id } });

    // Add to projects if specified
    // Access projectIds safely
    const projectIds = (invitation as any).projectIds || [];
    
    if (projectIds && projectIds.length > 0) {
        for (const projectId of projectIds) {
            try {
                const project = await Project.findById(projectId);
                // Ensure project belongs to the workspace
                if (project && project.workspace.toString() === workspace._id.toString()) {
                    const isAlreadyMember = project.members.some((m: any) => m.user.toString() === auth.userId);
                    const isProjectOwner = project.owner.toString() === auth.userId;
                    
                    if (!isAlreadyMember && !isProjectOwner) {
                        project.members.push({
                            user: auth.userId,
                            role: invitation.role, // Inherit role from workspace invite
                            joinedAt: new Date()
                        });
                        await project.save();
                    }
                }
            } catch (err) {
                console.error(`Error adding user to project ${projectId} on accept:`, err);
            }
        }
    }

    // Mark accepted
    invitation.status = 'accepted';
    await invitation.save();

    return NextResponse.json({
        success: true,
        message: 'Invitation acceptée avec succès',
        workspaceId: workspace._id
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
