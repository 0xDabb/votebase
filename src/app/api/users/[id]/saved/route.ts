import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/users/[id]/saved - Get user's saved projects
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: userId } = await params
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')

        const total = await prisma.savedProject.count({
            where: { userId },
        })

        const savedProjects = await prisma.savedProject.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                project: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                        category: true,
                        _count: {
                            select: {
                                upvotes: true,
                                comments: true,
                            },
                        },
                    },
                },
            },
        })

        // Transform to return projects with hasSaved = true
        const projects = savedProjects.map((sp) => ({
            ...sp.project,
            hasSaved: true,
            savedAt: sp.createdAt,
        }))

        return NextResponse.json({
            success: true,
            data: projects,
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        })
    } catch (error) {
        console.error('Error fetching saved projects:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch saved projects' },
            { status: 500 }
        )
    }
}
