import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Idea from '@/models/Idea';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { ideaId, content } = body;

    if (!ideaId || !content) {
      return NextResponse.json(
        { success: false, error: "ID de l'idée et contenu requis" },
        { status: 400 }
      );
    }

    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      user: auth.userId,
      content,
      createdAt: new Date()
    };

    const updatedIdea = await Idea.findByIdAndUpdate(
      ideaId,
      { $push: { comments: newComment } },
      { new: true }
    )
      .populate('creator', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName avatar')
      .populate('assignees', 'firstName lastName avatar')
      .populate('project', 'name color')
      .populate('comments.user', 'firstName lastName avatar');

    if (!updatedIdea) {
      return NextResponse.json({ success: false, error: 'Idée non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedIdea,
      message: 'Commentaire ajouté',
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'ajout du commentaire" },
      { status: 500 }
    );
  }
}
