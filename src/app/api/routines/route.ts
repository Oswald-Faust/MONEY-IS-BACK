import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Routine from '@/models/Routine';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');
    const activeOnly = searchParams.get('active');

    const query: any = {};
    if (projectId) query.project = projectId;
    if (activeOnly === 'true') query.isActive = true;

    const routines = await Routine.find(query)
      .populate('project', 'name color')
      .populate('assignee', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    const routinesWithProject = routines.map((routine) => ({
      ...routine.toObject(),
      projectColor: (routine.project as any)?.color || routine.color,
    }));

    return NextResponse.json({
      success: true,
      data: routinesWithProject,
    });
  } catch (error: any) {
    console.error('Get routines error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des routines' },
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
      description, 
      project: projectId, 
      days, 
      time,
      duration,
      color,
      assignee,
    } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Titre et projet requis' },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    const routine = await Routine.create({
      title,
      description,
      project: projectId,
      projectColor: project.color,
      creator: auth.userId,
      days: days || {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      time,
      duration,
      isActive: true,
      color: color || project.color,
      assignee,
      completedDates: [],
    });

    await routine.populate('project', 'name color');
    await routine.populate('assignee', 'firstName lastName avatar');

    return NextResponse.json({
      success: true,
      data: routine,
      message: 'Routine créée avec succès',
    });
  } catch (error: any) {
    console.error('Create routine error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de la routine' },
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
    
    // Handle special actions like toggling a date
    if (body.toggleDate) {
      const routine = await Routine.findById(id);
      if (!routine) {
        return NextResponse.json({ success: false, error: 'Routine non trouvée' }, { status: 404 });
      }

      const dateToToggle = new Date(body.toggleDate);
      const dateString = dateToToggle.toDateString(); // Compare by date only
      
      const existsIndex = routine.completedDates.findIndex(
        (d: Date) => d.toDateString() === dateString
      );

      if (existsIndex > -1) {
        // Remove date (uncomplete)
        routine.completedDates.splice(existsIndex, 1);
      } else {
        // Add date (complete)
        routine.completedDates.push(dateToToggle);
      }

      await routine.save();
      
      const populatedRoutine = await Routine.findById(id)
        .populate('project', 'name color')
        .populate('assignee', 'firstName lastName avatar');
      
      return NextResponse.json({
         success: true,
         data: populatedRoutine
      });
    }

    const updatedRoutine = await Routine.findByIdAndUpdate(id, body, { new: true })
      .populate('project', 'name color')
      .populate('assignee', 'firstName lastName avatar');

    if (!updatedRoutine) {
      return NextResponse.json({ success: false, error: 'Routine non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedRoutine,
    });
  } catch (error: any) {
    console.error('Update routine error:', error);
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

    const deletedRoutine = await Routine.findByIdAndDelete(id);

    if (!deletedRoutine) {
        return NextResponse.json({ success: false, error: 'Routine non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Routine supprimée',
    });
  } catch (error: any) {
    console.error('Delete routine error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
