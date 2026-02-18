
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import Invitation from '@/models/Invitation';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';
import type { IWorkspace } from '@/models/Workspace';

// GET /api/workspaces/members?workspaceId=...
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'Workspace ID requis' }, { status: 400 });
    }

    // Verify access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 });

    const isMember = workspace.members.some(m => m.user.toString() === auth.userId) || workspace.owner.toString() === auth.userId;
    if (!isMember) return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });

    // Populate members
    await workspace.populate('members.user', 'firstName lastName email avatar role');
    await workspace.populate('owner', 'firstName lastName email avatar');

    // Fetch pending invitations
    const invitations = await Invitation.find({
      workspace: workspaceId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('inviter', 'firstName lastName');

    return NextResponse.json({
      success: true,
      data: {
        owner: workspace.owner,
        members: workspace.members,
        invitations
      }
    });

  } catch (error: any) {
    console.error('Get members error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/workspaces/members - Invite a member
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { workspaceId, email, role = 'editor', projectIds = [] } = body;

    if (!workspaceId || !email) {
      return NextResponse.json({ success: false, error: 'Workspace ID et Email requis' }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 });

    // Check if requester is admin/owner
    const member = workspace.members.find(m => m.user.toString() === auth.userId);
    const isOwner = workspace.owner.toString() === auth.userId;
    const isAdmin = isOwner || (member && member.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Seuls les admins peuvent inviter' }, { status: 403 });
    }

    // Check Plan Limits
    const { PLAN_LIMITS } = await import('@/lib/limits');
    const memberCount = workspace.members.length + 1; // +1 for owner
    const pendingInvitesCount = await Invitation.countDocuments({ workspace: workspaceId, status: 'pending' });
    const totalCount = memberCount + pendingInvitesCount;

    const limit = PLAN_LIMITS[workspace.subscriptionPlan as keyof typeof PLAN_LIMITS]?.maxMembers || Infinity;
    
    if (totalCount >= limit) {
        return NextResponse.json({ 
            success: false, 
            error: `Limite de membres atteinte pour le plan ${workspace.subscriptionPlan}. Veuillez passer au plan supérieur.` 
        }, { status: 403 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    // Check if already member
    if (existingUser) {
        const isAlreadyMember = workspace.members.some(m => m.user.toString() === existingUser._id.toString()) || workspace.owner.toString() === existingUser._id.toString();
        if (isAlreadyMember) {
            return NextResponse.json({ success: false, error: 'Cet utilisateur est déjà membre du workspace' }, { status: 400 });
        }
        
        // Add directly (User exists)
        workspace.members.push({
            user: existingUser._id,
            role,
            joinedAt: new Date()
        });
        await workspace.save();
        
        // Update user
        await User.findByIdAndUpdate(existingUser._id, { $push: { workspaces: workspace._id } });

        // Add to specified projects
        if (projectIds && projectIds.length > 0) {
            for (const projectId of projectIds) {
                try {
                    const project = await Project.findById(projectId);
                    if (project && project.workspace.toString() === workspaceId) {
                        const isAlreadyMember = project.members.some((m: any) => m.user.toString() === existingUser._id.toString());
                        const isProjectOwner = project.owner.toString() === existingUser._id.toString();
                        if (!isAlreadyMember && !isProjectOwner) {
                            project.members.push({ user: existingUser._id, role, joinedAt: new Date() });
                            await project.save();
                        }
                    }
                } catch (err) {
                    console.error(`Error adding user to project ${projectId}:`, err);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Utilisateur ajouté avec succès',
            type: 'added'
        });
    } else {
        // Create Invitation
        // Check if pending invitation exists
        const existingInvite = await Invitation.findOne({
            workspace: workspaceId,
            email,
            status: 'pending'
        });

        if (existingInvite) {
             return NextResponse.json({ success: false, error: 'Une invitation est déjà en attente pour cet email' }, { status: 400 });
        }

        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await Invitation.create({
            email,
            workspace: workspaceId,
            role,
            token,
            inviter: auth.userId,
            status: 'pending',
            expiresAt,
            projectIds: projectIds || []
        });

        // Here we would send email via Resend/SMTP
        // await sendInvitationEmail(email, token, workspace.name);

        return NextResponse.json({
            success: true,
            message: 'Invitation envoyée avec succès',
            type: 'invited',
            invitation
        });
    }

  } catch (error: any) {
    console.error('Invite member error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/workspaces/members - Update member role
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const auth = await verifyAuth(request);
        if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

        const body = await request.json();
        const { workspaceId, userId, role } = body;

        if (!workspaceId || !userId || !role) {
             return NextResponse.json({ success: false, error: 'Workspace ID, User ID et Role requis' }, { status: 400 });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 });

        // Check Permissions (Only Owner can change Admin roles securely or Admins can change Editors/Visitors)
        // For simplicity: Only Owner and Admins can change roles.
        // Prevent changing Owner's role
        if (workspace.owner.toString() === userId) {
            return NextResponse.json({ success: false, error: 'Impossible de modifier le rôle du propriétaire' }, { status: 403 });
        }

        const isOwner = workspace.owner.toString() === auth.userId;
        const requesterMember = workspace.members.find(m => m.user.toString() === auth.userId);
        const isAdmin = isOwner || (requesterMember && requesterMember.role === 'admin');

        if (!isAdmin) {
             return NextResponse.json({ success: false, error: 'Permission refusée' }, { status: 403 });
        }

        // Additional check: Admin cannot change another Admin's role unless Owner? 
        // Let's keep it simple: Admin can manage roles.

        const memberIndex = workspace.members.findIndex(m => m.user.toString() === userId);
        if (memberIndex === -1) {
            return NextResponse.json({ success: false, error: 'Membre non trouvé' }, { status: 404 });
        }

        workspace.members[memberIndex].role = role;
        await workspace.save();

        return NextResponse.json({ success: true, message: 'Rôle mis à jour' });

    } catch (error: any) {
        console.error('Update member error:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE /api/workspaces/members - Remove a member or cancel invitation
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const auth = await verifyAuth(request);
        if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

        const body = await request.json();
        const { workspaceId, userId, invitationId } = body;

        if (!workspaceId) {
             return NextResponse.json({ success: false, error: 'Workspace ID requis' }, { status: 400 });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 });

        // Check Permissions
        const isOwner = workspace.owner.toString() === auth.userId;
        const requesterMember = workspace.members.find(m => m.user.toString() === auth.userId);
        const isAdmin = isOwner || (requesterMember && requesterMember.role === 'admin');

        if (!isAdmin) {
             return NextResponse.json({ success: false, error: 'Permission refusée' }, { status: 403 });
        }

        if (userId) {
            // Remove Member
            if (userId === workspace.owner.toString()) {
                return NextResponse.json({ success: false, error: 'Impossible de supprimer le propriétaire' }, { status: 400 });
            }
            if (userId === auth.userId) {
                 return NextResponse.json({ success: false, error: 'Vous ne pouvez pas vous supprimer vous-même (quittez le workspace)' }, { status: 400 });
            }

            workspace.members = workspace.members.filter((m: any) => m.user.toString() !== userId);
            await workspace.save();

            // Update user workspaces list
            await User.findByIdAndUpdate(userId, { $pull: { workspaces: workspaceId } });

            return NextResponse.json({ success: true, message: 'Membre supprimé' });
        } else if (invitationId) {
            // Cancel Invitation
            await Invitation.findByIdAndDelete(invitationId);
            return NextResponse.json({ success: true, message: 'Invitation annulée' });
        } else {
            return NextResponse.json({ success: false, error: 'User ID ou Invitation ID requis' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Delete member error:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
