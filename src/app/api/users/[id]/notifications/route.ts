import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/users/[id]/notifications - Get user notifications
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: userId } = await params
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const unreadOnly = searchParams.get('unreadOnly') === 'true'

        const where: Record<string, unknown> = { userId }
        if (unreadOnly) {
            where.read = false
        }

        const total = await prisma.notification.count({ where })
        const unreadCount = await prisma.notification.count({
            where: { userId, read: false },
        })

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        return NextResponse.json({
            success: true,
            data: notifications,
            total,
            unreadCount,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notifications' },
            { status: 500 }
        )
    }
}

// PATCH /api/users/[id]/notifications - Mark notifications as read
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: userId } = await params
        const body = await request.json()
        const { notificationIds, markAllAsRead } = body

        if (markAllAsRead) {
            await prisma.notification.updateMany({
                where: { userId, read: false },
                data: { read: true },
            })
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId,
                },
                data: { read: true },
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Notifications updated',
        })
    } catch (error) {
        console.error('Error updating notifications:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update notifications' },
            { status: 500 }
        )
    }
}
