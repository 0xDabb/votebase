import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/projects/[id]/upvote - Toggle upvote on a project
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

        // Check if user already upvoted
        const existingUpvote = await prisma.upvote.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId,
                },
            },
        })

        if (existingUpvote) {
            // Remove upvote
            await prisma.$transaction([
                prisma.upvote.delete({
                    where: { id: existingUpvote.id },
                }),
                prisma.project.update({
                    where: { id: projectId },
                    data: { upvoteCount: { decrement: 1 } },
                }),
            ])

            return NextResponse.json({
                success: true,
                action: 'removed',
                message: 'Upvote removed',
            })
        } else {
            // Add upvote
            await prisma.$transaction([
                prisma.upvote.create({
                    data: {
                        userId,
                        projectId,
                    },
                }),
                prisma.project.update({
                    where: { id: projectId },
                    data: { upvoteCount: { increment: 1 } },
                }),
            ])

            // Create notification for project creator (if not self)
            if (project.creatorId !== userId) {
                const voter = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { username: true, displayName: true },
                })

                await prisma.notification.create({
                    data: {
                        type: 'UPVOTE',
                        title: 'New Upvote!',
                        message: `${voter?.displayName || voter?.username} upvoted your project "${project.name}"`,
                        userId: project.creatorId,
                        data: { projectId, voterId: userId },
                    },
                })
            }

            return NextResponse.json({
                success: true,
                action: 'added',
                message: 'Upvote added',
            })
        }
    } catch (error) {
        console.error('Error toggling upvote:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to toggle upvote' },
            { status: 500 }
        )
    }
}
