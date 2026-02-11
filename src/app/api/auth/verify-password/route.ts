import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import User from '@/models/User';
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
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    // 3. Find User
    const user = await User.findOne({ email: auth.email }).select('+password');
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 4. Verify Password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // 5. Success
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Password verification error:', error);
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
  }
}
