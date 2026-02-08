import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'fr',
      },
    });

    // Create default workspace for user
    const workspace = await Workspace.create({
      name: 'Mon Workspace',
      description: 'Workspace personnel',
      owner: user._id,
      members: [{ user: user._id, role: 'admin', joinedAt: new Date() }],
    });

    // Update user with workspace
    user.workspaces = [workspace._id];
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
        workspace: {
          _id: workspace._id,
          name: workspace.name,
        },
      },
      message: 'Inscription réussie',
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
