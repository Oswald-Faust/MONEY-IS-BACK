
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, workspaceId, projectIds } = await request.json();

    if (!userId || !workspaceId || !Array.isArray(projectIds)) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    // Verify workspace access and admin rights
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }

    const requesterMember = workspace.members.find((m: any) => m.user.toString() === auth.userId);
    const isOwner = workspace.owner.toString() === auth.userId;
    const isAdmin = isOwner || (requesterMember && requesterMember.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    // Fetch all projects in workspace to perform diff
    const workspaceProjects = await Project.find({ workspace: workspaceId });

    const updates = [];

    for (const project of workspaceProjects) {
        const isMember = project.members.some((m: any) => m.user.toString() === userId);
        const shouldBeMember = projectIds.includes(project._id.toString());
        const isProjectOwner = project.owner.toString() === userId;

        if (shouldBeMember && !isMember) {
            // Add to project
            updates.push(
                Project.findByIdAndUpdate(project._id, {
                    $push: {
                        members: {
                            user: userId,
                            role: 'editor', // Default role provided
                            joinedAt: new Date()
                        }
                    }
                })
            );
        } else if (!shouldBeMember && isMember) {
            // Remove from project (unless owner)
            if (isProjectOwner) {
                // Cannot remove owner from project
                continue; 
            }
            updates.push(
                Project.findByIdAndUpdate(project._id, {
                    $pull: {
                        members: { user: userId }
                    }
                })
            );
        }
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Projects access updated' });

  } catch (error) {
    console.error('Update member projects error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
