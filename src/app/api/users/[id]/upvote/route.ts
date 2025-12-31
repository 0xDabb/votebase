import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Check if user already upvoted this creator
        const existingUpvote = await prisma.creatorUpvote.findUnique({
            where: {
                userId_creatorId: {
                    userId,
                    creatorId: id
                }
            }
        })

        if (existingUpvote) {
            return NextResponse.json(
                { success: false, error: 'Already upvoted', alreadyUpvoted: true },
                { status: 400 }
            )
        }

        // Create upvote and increment count in a transaction
        const [creatorUpvote, updatedCreator] = await prisma.$transaction([
            prisma.creatorUpvote.create({
                data: {
                    userId,
                    creatorId: id
                }
            }),
            prisma.user.update({
                where: { id },
                data: {
                    upvoteCount: {
                        increment: 1
                    }
                }
            })
        ])

        return NextResponse.json({
            success: true,
            data: updatedCreator,
            newUpvote: true
        })
    } catch (error) {
        console.error('Error upvoting creator:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to upvote creator' },
            { status: 500 }
        )
    }
}
