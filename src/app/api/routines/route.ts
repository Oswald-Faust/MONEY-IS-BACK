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
    const activeOnly = searchParams.get('active') !== 'false';

    const query: any = { creator: auth.userId };
    if (projectId) query.project = projectId;
    if (activeOnly) query.isActive = true;

    const routines = await Routine.find(query)
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    // Add project color to routines
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
    } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Titre et projet requis' },
        { status: 400 }
      );
    }

    // Get project info for color
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
      completedDates: [],
    });

    await routine.populate('project', 'name color');

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
