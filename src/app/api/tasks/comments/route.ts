import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, content } = body;

    if (!taskId || !content) {
      return NextResponse.json({ success: false, error: 'Task ID et contenu requis' }, { status: 400 });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
    }

    const newComment = {
        id: uuidv4(),
        user: auth.userId,
        content,
        createdAt: new Date()
    };

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $push: { comments: newComment } },
        { new: true }
    )
    .populate('project', 'name color')
    .populate('assignee', 'firstName lastName avatar')
    .populate('creator', 'firstName lastName avatar')
    .populate('comments.user', 'firstName lastName avatar');

    return NextResponse.json({
        success: true,
        data: updatedTask,
        message: 'Commentaire ajouté'
    });

  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { taskId, commentId } = body;

        if (!taskId || !commentId) {
            return NextResponse.json({ success: false, error: 'Task ID et Comment ID requis' }, { status: 400 });
        }

        const task = await Task.findById(taskId);
        if (!task) {
             return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
        }

        // Find comment to check ownership
        const comment = task.comments.find((c: any) => c.id === commentId);
        if (!comment) {
            return NextResponse.json({ success: false, error: 'Commentaire non trouvé' }, { status: 404 });
        }

        // Allow if user is author
        if (comment.user.toString() !== auth.userId) {
             return NextResponse.json({ success: false, error: 'Non autorisé à supprimer ce commentaire' }, { status: 403 });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $pull: { comments: { id: commentId } } },
            { new: true }
        )
        .populate('project', 'name color')
        .populate('assignee', 'firstName lastName avatar')
        .populate('creator', 'firstName lastName avatar')
        .populate('comments.user', 'firstName lastName avatar');

        return NextResponse.json({
            success: true,
            data: updatedTask,
            message: 'Commentaire supprimé'
        });

    } catch (error: any) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}
