
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// GET /api/projects/members?projectId=...
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID requis' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });

    // Verify access: User must be a member of the project or owner
    const isMember = project.members.some((m: any) => m.user.toString() === auth.userId) || project.owner.toString() === auth.userId;
    // Also allow if user is admin of workspace? For now strict project check.
    if (!isMember) return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });

    // Populate members
    await project.populate('members.user', 'firstName lastName email avatar role');
    await project.populate('owner', 'firstName lastName email avatar');

    // Calculate stats for each member
    const membersWithStats = await Promise.all(project.members.map(async (member: any) => {
      // If user is null (deleted?), skip or handle
      if (!member.user) return null;

      const userId = member.user._id;
      
      // Count tasks for this user in this project
      // Check both assignee (single) and assignees (array)
      const tasks = await Task.find({
        project: projectId,
        $or: [
            { assignees: userId },
            { assignee: userId } // Backward compatibility
        ]
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
      const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
      const estimatedTime = tasks.reduce((acc: number, t: any) => acc + (t.estimatedTime || 0), 0);
      const timeSpent = tasks.reduce((acc: number, t: any) => acc + (t.timeSpent || 0), 0);

      return {
        ...member.toObject(),
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          estimatedTime,
          timeSpent,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      };
    }));

    // Clean up nulls
    const validMembers = membersWithStats.filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        owner: project.owner,
        members: validMembers
      }
    });


  } catch (error: any) {
    console.error('Get project members error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/projects/members - Add a member to project
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { projectId, userId, role = 'editor' } = body;

    if (!projectId || !userId) {
      return NextResponse.json({ success: false, error: 'Project ID et User ID requis' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });

    // Check permissions: Only project admin/owner can add members
    const requesterMember = project.members.find((m: any) => m.user.toString() === auth.userId);
    const isOwner = project.owner.toString() === auth.userId;
    const isAdmin = isOwner || (requesterMember && requesterMember.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Seuls les admins du projet peuvent ajouter des membres' }, { status: 403 });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });

    // Check if already member
    const isAlreadyMember = project.members.some((m: any) => m.user.toString() === userId);
    if (isAlreadyMember) {
      return NextResponse.json({ success: false, error: 'Utilisateur déjà membre du projet' }, { status: 400 });
    }

    // Add to project
    project.members.push({
      user: userId,
      role,
      joinedAt: new Date()
    });
    await project.save();

    return NextResponse.json({
      success: true,
      message: 'Membre ajouté avec succès',
      data: project.members[project.members.length - 1]
    });

  } catch (error: any) {
    console.error('Add project member error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/projects/members - Update member role
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { projectId, userId, role } = body;

    if (!projectId || !userId || !role) {
      return NextResponse.json({ success: false, error: 'Données incomplètes' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });

    // Check permissions
    const requesterMember = project.members.find((m: any) => m.user.toString() === auth.userId);
    const isOwner = project.owner.toString() === auth.userId;
    const isAdmin = isOwner || (requesterMember && requesterMember.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Permission refusée' }, { status: 403 });
    }

    // Prevent changing Owner's role if they are in list (though usually owner is handled separately or is immutable super admin)
    if (project.owner.toString() === userId) {
         return NextResponse.json({ success: false, error: 'Impossible de modifier le rôle du propriétaire' }, { status: 403 });
    }

    const memberIndex = project.members.findIndex((m: any) => m.user.toString() === userId);
    if (memberIndex === -1) {
      return NextResponse.json({ success: false, error: 'Membre non trouvé' }, { status: 404 });
    }

    project.members[memberIndex].role = role;
    await project.save();

    return NextResponse.json({ success: true, message: 'Rôle mis à jour' });

  } catch (error: any) {
    console.error('Update project member error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/projects/members - Remove member from project
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      return NextResponse.json({ success: false, error: 'Project ID et User ID requis' }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });

    // Check permissions
    const requesterMember = project.members.find((m: any) => m.user.toString() === auth.userId);
    const isOwner = project.owner.toString() === auth.userId;
    const isAdmin = isOwner || (requesterMember && requesterMember.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Permission refusée' }, { status: 403 });
    }

    if (userId === project.owner.toString()) {
        return NextResponse.json({ success: false, error: 'Impossible de supprimer le propriétaire' }, { status: 400 });
    }

    if (userId === auth.userId && !isOwner) {
         // Allow leaving? Yes, but maybe handle separately. 
         // Here assuming admin removes someone else.
         // If user removes themselves, logic is same.
    }

    project.members = project.members.filter((m: any) => m.user.toString() !== userId);
    await project.save();

    return NextResponse.json({ success: true, message: 'Membre retiré du projet' });

  } catch (error: any) {
    console.error('Remove project member error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
