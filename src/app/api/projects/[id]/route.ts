import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/projects/[id] - Get single project details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        fid: true,
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
                comments: {
                    where: { parentId: null }, // Only top-level comments
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                        _count: {
                            select: { replies: true },
                        },
                    },
                },
                ...(userId && {
                    upvotes: {
                        where: { userId },
                        select: { id: true },
                    },
                    savedBy: {
                        where: { userId },
                        select: { id: true },
                    },
                }),
            },
        })

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        const transformedProject = {
            ...project,
            hasUpvoted: userId ? (project.upvotes?.length || 0) > 0 : false,
            hasSaved: userId ? (project.savedBy?.length || 0) > 0 : false,
            upvotes: undefined,
            savedBy: undefined,
        }

        return NextResponse.json({
            success: true,
            data: transformedProject,
        })
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, tagline, description, websiteUrl, githubUrl, coverImage, logoImage, categoryId, userId } = body

        // Verify project exists and user is the creator
        const existingProject = await prisma.project.findUnique({
            where: { id },
        })

        if (!existingProject) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        if (existingProject.creatorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const project = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(tagline && { tagline }),
                ...(description !== undefined && { description }),
                ...(websiteUrl !== undefined && { websiteUrl }),
                ...(githubUrl !== undefined && { githubUrl }),
                ...(coverImage !== undefined && { coverImage }),
                ...(logoImage !== undefined && { logoImage }),
                ...(categoryId && { categoryId }),
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fid: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                category: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: project,
        })
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update project' },
            { status: 500 }
        )
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        // Verify project exists and user is the creator
        const existingProject = await prisma.project.findUnique({
            where: { id },
        })

        if (!existingProject) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        if (existingProject.creatorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        await prisma.project.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: 'Project deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}
