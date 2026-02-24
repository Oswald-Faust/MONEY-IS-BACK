import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/users
 * Returns list of all users, searchable.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Get current user to access their workspaces
    const currentUser = await User.findById(auth.userId).select('workspaces');
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const userWorkspaceIds = currentUser.workspaces || [];

    // Build query conditions
    const conditions: Record<string, any> = { 
      workspaces: { $in: userWorkspaceIds }
    };
    
    if (query.trim()) {
      const regex = new RegExp(query, 'i');
      conditions.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex }
      ];
    }

    // Limit to 20 users for performance if needed, or paginate
    const users = await User.find(conditions)
      .select('firstName lastName email avatar profileColor role')
      .limit(50)
      .lean();

    // Map to Contact structure to match existing types partially
    // (Though they might not have messages yet)
    const mapppedUsers = users.map(u => ({
      ...u,
      _id: u._id.toString(),
      unreadCount: 0, 
      lastMessage: undefined
    }));

    return NextResponse.json({
      success: true,
      data: mapppedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
