import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all users for admin
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
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

        return NextResponse.json({ success: true, data: users })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

// POST: Create new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fid, username, displayName, bio, avatarUrl } = body

        if (!fid || !username) {
            return NextResponse.json(
                { success: false, error: 'FID and username are required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.create({
            data: {
                fid: parseInt(fid),
                username,
                displayName: displayName || null,
                bio: bio || null,
                avatarUrl: avatarUrl || null,
                upvoteCount: 0
            }
        })

        return NextResponse.json({ success: true, data: user })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
