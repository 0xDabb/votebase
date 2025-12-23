import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/projects/[id]/save - Toggle save/bookmark on a project
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        })

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        // Check if already saved
        const existingSave = await prisma.savedProject.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId,
                },
            },
        })

        if (existingSave) {
            // Remove save
            await prisma.savedProject.delete({
                where: { id: existingSave.id },
            })

            return NextResponse.json({
                success: true,
                action: 'removed',
                message: 'Project unsaved',
            })
        } else {
            // Add save
            await prisma.savedProject.create({
                data: {
                    userId,
                    projectId,
                },
            })

            return NextResponse.json({
                success: true,
                action: 'added',
                message: 'Project saved',
            })
        }
    } catch (error) {
        console.error('Error toggling save:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to toggle save' },
            { status: 500 }
        )
    }
}
