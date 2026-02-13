import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Idea from '@/models/Idea';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const projectId = searchParams.get('project');
    const status = searchParams.get('status');

    if (id) {
      const idea = await Idea.findById(id)
        .populate('creator', 'firstName lastName avatar')
        .populate('assignee', 'firstName lastName avatar')
        .populate('project', 'name color');
      
      if (!idea) {
        return NextResponse.json({ success: false, error: 'Idée non trouvée' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: idea,
      });
    }

    const query: any = {};
    if (projectId) query.project = projectId;
    if (status && status !== 'all') query.status = status;

    const ideas = await Idea.find(query)
      .populate('creator', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName avatar')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: ideas,
    });
  } catch (error: any) {
    console.error('Get ideas error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des idées' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      project: projectId, 
      status = 'raw',
      tags = [],
      attachments = [],
      assignee
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Titre et contenu requis' },
        { status: 400 }
      );
    }

    const idea = await Idea.create({
      title,
      content,
      project: projectId || undefined,
      creator: auth.userId,
      status,
      tags,
      attachments,
      votes: [],
      comments: [],
      assignee
    });

    await idea.populate('creator', 'firstName lastName avatar');
    await idea.populate('assignee', 'firstName lastName avatar');
    if (projectId) {
      await idea.populate('project', 'name color');
    }

    return NextResponse.json({
      success: true,
      data: idea,
      message: 'Idée créée avec succès',
    });
  } catch (error: any) {
    console.error('Create idea error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'idée' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
    }

    const body = await request.json();
    
    const updatedIdea = await Idea.findByIdAndUpdate(id, body, { new: true })
      .populate('creator', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName avatar')
      .populate('project', 'name color');

    if (!updatedIdea) {
      return NextResponse.json({ success: false, error: 'Idée non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedIdea,
    });
  } catch (error: any) {
    console.error('Update idea error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
    }

    const deletedIdea = await Idea.findByIdAndDelete(id);

    if (!deletedIdea) {
        return NextResponse.json({ success: false, error: 'Idée non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Idée supprimée',
    });
  } catch (error: any) {
    console.error('Delete idea error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
