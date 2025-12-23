import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fid, username, displayName, avatarUrl, custodyAddress } = body

        if (!fid || !username) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: fid and username' },
                { status: 400 }
            )
        }

        // Upsert user - create if not exists, update if exists
        const user = await prisma.user.upsert({
            where: { fid: Number(fid) },
            update: {
                username,
                displayName,
                avatarUrl,
                custodyAddress,
                updatedAt: new Date(),
            },
            create: {
                fid: Number(fid),
                username,
                displayName,
                avatarUrl,
                custodyAddress,
            },
        })

        return NextResponse.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error('Farcaster auth error:', error)
        return NextResponse.json(
            { success: false, error: 'Authentication failed' },
            { status: 500 }
        )
    }
}
