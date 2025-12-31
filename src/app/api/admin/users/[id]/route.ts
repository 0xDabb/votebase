import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PATCH: Update user
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const body = await request.json()
        const { fid, username, displayName, bio, avatarUrl } = body

        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(fid !== undefined && { fid: parseInt(fid) }),
                ...(username && { username }),
                ...(displayName !== undefined && { displayName }),
                ...(bio !== undefined && { bio }),
                ...(avatarUrl !== undefined && { avatarUrl })
            }
        })

        return NextResponse.json({ success: true, data: user })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

// DELETE: Delete user
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
