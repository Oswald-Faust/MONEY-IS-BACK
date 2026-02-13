import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Objective from '@/models/Objective';
import Project from '@/models/Project';
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
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    if (id) {
      const objective = await Objective.findById(id)
        .populate('project', 'name color')
        .populate('creator', 'firstName lastName avatar')
        .populate('assignee', 'firstName lastName avatar');

      if (!objective) {
        return NextResponse.json({ success: false, error: 'Objectif non trouvé' }, { status: 404 });
      }

      const objectiveWithProject = {
        ...objective.toObject(),
        projectName: (objective.project as any)?.name,
        projectColor: (objective.project as any)?.color,
      };

      return NextResponse.json({
        success: true,
        data: objectiveWithProject,
      });
    }

    const query: any = {};
    
    // Filter by project
    if (projectId) {
      query.project = projectId;
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const objectives = await Objective.find(query)
      .populate('project', 'name color')
      .populate('creator', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    // Add project info to objectives to match frontend type
    const objectivesWithProject = objectives.map((obj) => ({
      ...obj.toObject(),
      projectName: (obj.project as any)?.name,
      projectColor: (obj.project as any)?.color,
    }));

    return NextResponse.json({
      success: true,
      data: objectivesWithProject,
    });
  } catch (error: any) {
    console.error('Get objectives error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des objectifs' },
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
      priority = 'medium',
      status = 'not_started',
      targetDate,
      assignee,
      checkpoints = [],
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    let projectData = null;
    if (projectId) {
      projectData = await Project.findById(projectId);
      if (!projectData) {
        return NextResponse.json(
          { success: false, error: 'Projet non trouvé' },
          { status: 404 }
        );
      }
    }

    const objective = await Objective.create({
      title,
      description,
      project: projectId || undefined,
      creator: auth.userId,
      priority,
      status,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      checkpoints,
      assignee,
      progress: 0,
    });

    await objective.populate('project', 'name color');
    await objective.populate('creator', 'firstName lastName avatar');
    await objective.populate('assignee', 'firstName lastName avatar');

    // Add explicit project info for frontend convenience
    const objectiveResponse = {
      ...objective.toObject(),
      projectName: projectData?.name,
      projectColor: projectData?.color,
    };

    return NextResponse.json({
      success: true,
      data: objectiveResponse,
      message: 'Objectif créé avec succès',
    });
  } catch (error: any) {
    console.error('Create objective error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de l\'objectif' },
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
      return NextResponse.json({ success: false, error: 'ID de l\'objectif requis' }, { status: 400 });
    }

    const body = await request.json();
    
    // Calculate progress if checkpoints are updated
    if (body.checkpoints) {
      const total = body.checkpoints.length;
      const completed = body.checkpoints.filter((cp: any) => cp.completed).length;
      body.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Update status based on progress
      if (body.progress === 100) {
        body.status = 'completed';
      } else if (body.progress > 0) {
        body.status = 'in_progress';
      }
    }

    const updatedObjective = await Objective.findByIdAndUpdate(id, body, { new: true })
      .populate('project', 'name color')
      .populate('creator', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName avatar');

    if (!updatedObjective) {
        return NextResponse.json({ success: false, error: 'Objectif non trouvé' }, { status: 404 });
    }

    const objectiveResponse = {
        ...updatedObjective.toObject(),
        projectName: (updatedObjective.project as any)?.name,
        projectColor: (updatedObjective.project as any)?.color,
    };

    return NextResponse.json({
      success: true,
      data: objectiveResponse,
    });
  } catch (error: any) {
    console.error('Update objective error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour' },
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
        return NextResponse.json({ success: false, error: 'ID de l\'objectif requis' }, { status: 400 });
      }
  
      await Objective.findByIdAndDelete(id);
  
      return NextResponse.json({
        success: true,
        message: 'Objectif supprimé',
      });
    } catch (error: any) {
      console.error('Delete objective error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
}
