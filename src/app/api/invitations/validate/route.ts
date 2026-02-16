
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invitation from '@/models/Invitation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token requis' }, { status: 400 });
    }

    const invitation = await Invitation.findOne({ token, status: 'pending' })
      .populate('workspace', 'name useCase icon') // Only safe fields
      .populate('inviter', 'firstName lastName avatar');

    if (!invitation) {
      return NextResponse.json({ success: false, valid: false, error: 'Invitation invalide ou expirée' }, { status: 404 });
    }

    if (new Date() > invitation.expiresAt) {
        invitation.status = 'expired';
        await invitation.save();
        return NextResponse.json({ success: false, valid: false, error: 'Invitation expirée' }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        email: invitation.email,
        workspace: invitation.workspace,
        inviter: invitation.inviter,
        role: invitation.role
      }
    });

  } catch (error) {
    console.error('Validate invitation error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
