import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import User from '@/models/User';
import Project from '@/models/Project';
import connectToDatabase from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // 1. Verify Authentication
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Parse body
    const { password, projectId } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    // 3. Find User
    // The original code was:
    // const user = await User.findOne({ email: auth.email }).select('+password');
    // if (!user) {
    //   return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    // }
    // The user's edit seems to be trying to introduce a new logic path,
    // but the provided snippet is incomplete and refers to `currentWorkspace` which is not defined.
    // To make the file syntactically correct and incorporate the provided type,
    // I will assume the user intended to add a type to a similar find operation,
    // but without the context of `currentWorkspace`, I cannot fully implement the new logic.
    // I will revert to the original user finding logic, but if the user intended to replace it,
    // they need to provide the full context for `currentWorkspace`.
    const user = await User.findOne({ email: auth.email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 4. Check if we should verify against a project password
    if (projectId) {
      const project = await Project.findById(projectId).select('+securePassword');
      
      if (project && project.securePassword) {
        // Verify against Project Password
        const isMatch = await project.compareSecurePassword(password);
        if (!isMatch) {
          return NextResponse.json({ success: false, error: 'Mot de passe du projet incorrect' }, { status: 401 });
        }
        return NextResponse.json({ success: true });
      }
    }

    // 5. Verify against User Password (fallback or default)
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // 6. Success
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Password verification error:', err);
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
  }
}
