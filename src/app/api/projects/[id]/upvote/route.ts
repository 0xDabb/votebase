import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

        // Check rate limit: 1 vote per 12 hours
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)

        const recentUpvotesCount = await prisma.upvote.count({
            where: {
                userId,
                createdAt: {
                    gte: twelveHoursAgo
                }
            }
        })

        // Limit is 1 vote per 12 hours
        if (recentUpvotesCount >= 1) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'You have used your vote for this 12-hour period. Please wait before voting again.'
                },
                { status: 429 }
            )
        }

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

        return NextResponse.json({
            success: true,
            action: 'added',
            message: 'Upvote added',
        })
    } catch (error) {
        console.error('Error toggling upvote:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to toggle upvote' },
            { status: 500 }
        )
    }
}
