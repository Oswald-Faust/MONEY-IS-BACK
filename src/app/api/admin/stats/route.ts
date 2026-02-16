import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get basic stats
    const totalUsers = await User.countDocuments();
    const totalWorkspaces = await Workspace.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();

    // Subscriptions stats
    const activeSubscriptions = await Workspace.countDocuments({
      subscriptionStatus: 'active'
    });

    const planDistribution = await Workspace.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    const useCaseDistribution = await Workspace.aggregate([
      { $group: { _id: '$useCase', count: { $sum: 1 } } }
    ]);

    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email avatar createdAt');

    // Recent active workspaces
    const recentWorkspaces = await Workspace.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('owner', 'firstName lastName avatar');

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          workspaces: totalWorkspaces,
          projects: totalProjects,
          tasks: totalTasks,
          subscriptions: activeSubscriptions
        },
        growth: {
          newUsersWeek
        },
        planDistribution,
        useCaseDistribution,
        recentUsers,
        recentWorkspaces
      }
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
