import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/projects/[id]/comments - Get comments for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const parentId = searchParams.get('parentId') // For loading replies

        const where: Record<string, unknown> = {
            projectId,
        }

        if (parentId) {
            where.parentId = parentId
        } else {
            where.parentId = null // Only top-level comments
        }

        const total = await prisma.comment.count({ where })

        const comments = await prisma.comment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
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
        })

        return NextResponse.json({
            success: true,
            data: comments,
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        })
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}

// POST /api/projects/[id]/comments - Add a comment to a project
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params
        const body = await request.json()
        const { content, userId, parentId } = body

        if (!content || !userId) {
            return NextResponse.json(
                { success: false, error: 'Content and userId are required' },
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

        // If it's a reply, check if parent comment exists
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
            })

            if (!parentComment) {
                return NextResponse.json(
                    { success: false, error: 'Parent comment not found' },
                    { status: 404 }
                )
            }
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content,
                userId,
                projectId,
                parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        })

        // Create notification for project creator or comment author (if replying)
        const commenter = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, displayName: true },
        })

        if (parentId) {
            // It's a reply - notify the parent comment author
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                select: { userId: true },
            })

            if (parentComment && parentComment.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        type: 'REPLY',
                        title: 'New Reply!',
                        message: `${commenter?.displayName || commenter?.username} replied to your comment`,
                        userId: parentComment.userId,
                        data: { projectId, commentId: comment.id, parentId },
                    },
                })
            }
        } else if (project.creatorId !== userId) {
            // It's a top-level comment - notify project creator
            await prisma.notification.create({
                data: {
                    type: 'COMMENT',
                    title: 'New Comment!',
                    message: `${commenter?.displayName || commenter?.username} commented on "${project.name}"`,
                    userId: project.creatorId,
                    data: { projectId, commentId: comment.id },
                },
            })
        }

        return NextResponse.json({
            success: true,
            data: comment,
        })
    } catch (error) {
        console.error('Error creating comment:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create comment' },
            { status: 500 }
        )
    }
}
