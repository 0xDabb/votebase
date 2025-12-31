import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all users sorted by upvotes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const limit = parseInt(searchParams.get('limit') || '50')
        const userId = searchParams.get('userId') // Current user ID to check upvoted creators

        const users = await prisma.user.findMany({
            where: search ? {
                OR: [
                    { username: { contains: search, mode: 'insensitive' } },
                    { displayName: { contains: search, mode: 'insensitive' } },
                    { bio: { contains: search, mode: 'insensitive' } }
                ]
            } : {},
            orderBy: { upvoteCount: 'desc' },
            take: limit,
            select: {
                id: true,
                fid: true,
                username: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                upvoteCount: true,
                createdAt: true,
                _count: {
                    select: {
                        projects: true,
                        comments: true
                    }
                }
            }
        })

        // If userId provided, fetch which creators this user has upvoted
        let upvotedCreatorIds: string[] = []
        if (userId) {
            const upvotes = await prisma.creatorUpvote.findMany({
                where: { userId },
                select: { creatorId: true }
            })
            upvotedCreatorIds = upvotes.map(u => u.creatorId)
        }

        // Add hasUpvoted flag to each user
        const usersWithUpvoteStatus = users.map(user => ({
            ...user,
            hasUpvoted: upvotedCreatorIds.includes(user.id)
        }))

        return NextResponse.json({ success: true, data: usersWithUpvoteStatus })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
