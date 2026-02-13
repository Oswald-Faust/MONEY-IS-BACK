import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import SystemLog from '@/models/SystemLog';
import { verifyAuth } from '@/lib/auth';
import type { IProject } from '@/models/Project';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const admin = await verifyAuth(req);

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    const projects = await Project.find().select('name description members owner status');
    
    // Transform projects to include access info for the specific user
    const projectsWithAccess = projects.map((project: IProject) => {
      const member = project.members.find((m: any) => m.user.toString() === userId);
      const isOwner = project.owner.toString() === userId;
      
      return {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        hasAccess: !!member || isOwner,
        role: isOwner ? 'owner' : (member?.role || null),
        joinedAt: member?.joinedAt || null
      };
    });

    return NextResponse.json({ success: true, data: projectsWithAccess });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, projectId, role = 'editor' } = await req.json();

    if (!userId || !projectId) {
      return NextResponse.json({ success: false, error: 'User ID and Project ID are required' }, { status: 400 });
    }

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Check if user is already a member
    const isMember = project.members.some((m: any) => m.user.toString() === userId);
    if (isMember) {
      return NextResponse.json({ success: false, error: 'User already has access' }, { status: 400 });
    }

    // Add user to members
    project.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role,
      joinedAt: new Date()
    });

    await project.save();

    // Log the action
    await SystemLog.create({
      user: admin.userId,
      action: 'ACCESS_GRANTED',
      details: `Granted access to project ${project.name} for user ${userId}`,
      status: 'success',
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true, message: 'Access granted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    if (!userId || !projectId) {
        return NextResponse.json({ success: false, error: 'User ID and Project ID are required' }, { status: 400 });
    }

    await connectDB();
    
    const project = await Project.findById(projectId);
    if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    if (project.owner.toString() === userId) {
        return NextResponse.json({ success: false, error: 'Cannot remove owner from project' }, { status: 400 });
    }

    // Remove user from members
    project.members = project.members.filter((m: any) => m.user.toString() !== userId);
    await project.save();

    // Log the action
    await SystemLog.create({
        user: admin.userId,
        action: 'ACCESS_REVOKED',
        details: `Revoked access to project ${project.name} for user ${userId}`,
        status: 'warning',
        ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true, message: 'Access revoked' });
  } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
