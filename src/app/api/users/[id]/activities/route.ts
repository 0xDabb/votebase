import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params

        // Fetch user's upvote activities with project details
        const upvotes = await prisma.upvote.findMany({
            where: {
                userId: userId
            },
            include: {
                project: {
                    include: {
                        category: {
                            select: {
                                name: true,
                                color: true
                            }
                        },
                        _count: {
                            select: {
                                upvotes: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to last 50 activities
        })

        // Transform data to match frontend interface
        const activities = upvotes.map(upvote => ({
            id: upvote.id,
            createdAt: upvote.createdAt,
            project: {
                id: upvote.project.id,
                name: upvote.project.name,
                tagline: upvote.project.tagline,
                upvoteCount: upvote.project._count.upvotes,
                category: upvote.project.category
            }
        }))

        return NextResponse.json({
            success: true,
            data: activities
        })
    } catch (error) {
        console.error('Error fetching user activities:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activities' },
            { status: 500 }
        )
    }
}
