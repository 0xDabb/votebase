import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                projects: {
                    where: { status: 'ACTIVE' },
                    orderBy: { upvoteCount: 'desc' },
                    include: {
                        category: true,
                        _count: {
                            select: {
                                upvotes: true,
                                comments: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        projects: true,
                        upvotes: true,
                        savedProjects: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Calculate total upvotes received on user's projects
        const totalUpvotesReceived = await prisma.upvote.count({
            where: {
                project: {
                    creatorId: id,
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                totalUpvotesReceived,
            },
        })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}
