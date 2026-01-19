import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

interface SendNotificationBody {
    fid?: number          // Send to specific user by FID
    userId?: string       // Or by user ID
    title: string
    body: string
    targetUrl?: string    // URL to open when notification is clicked
    notificationId?: string // Unique ID to prevent duplicates (optional)
}

interface NotificationResponse {
    result: {
        success: boolean
        message?: string
    }
}

/**
 * Send a push notification to a Farcaster user
 * 
 * POST /api/notifications/send
 * 
 * Body:
 * {
 *   "fid": 12345,           // or "userId": "cuid..."
 *   "title": "New Upvote!",
 *   "body": "Your project received a new upvote",
 *   "targetUrl": "/projects/abc123",
 *   "notificationId": "upvote-abc123-1234567890"  // optional, for dedup
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Check for admin authorization (basic protection)
        const authHeader = request.headers.get('authorization')
        const adminPassword = process.env.ADMIN_PASSWORD || 'bote2024'

        if (authHeader !== `Bearer ${adminPassword}`) {
            // Also allow internal calls without auth for automated notifications
            const isInternalCall = request.headers.get('x-internal-call') === 'true'
            if (!isInternalCall) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                )
            }
        }

        const body: SendNotificationBody = await request.json()

        if (!body.title || !body.body) {
            return NextResponse.json(
                { error: "Missing required fields: title and body" },
                { status: 400 }
            )
        }

        // Find the user
        let user
        if (body.fid) {
            user = await prisma.user.findUnique({
                where: { fid: body.fid }
            })
        } else if (body.userId) {
            user = await prisma.user.findUnique({
                where: { id: body.userId }
            })
        } else {
            return NextResponse.json(
                { error: "Must provide either fid or userId" },
                { status: 400 }
            )
        }

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Check if user has notifications enabled
        if (!user.notificationsEnabled || !user.notificationToken || !user.notificationUrl) {
            return NextResponse.json({
                success: false,
                error: "User has not enabled notifications",
                userId: user.id,
                fid: user.fid
            })
        }

        // Base URL for the app
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://votebase0301.vercel.app'

        // Construct the target URL
        const targetUrl = body.targetUrl
            ? (body.targetUrl.startsWith('http') ? body.targetUrl : `${appUrl}${body.targetUrl}`)
            : appUrl

        // Generate notification ID if not provided
        const notificationId = body.notificationId || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Send the notification to Farcaster's notification service
        console.log(`[Notifications] Sending to user ${user.fid}:`, {
            title: body.title,
            body: body.body,
            targetUrl,
            notificationId
        })

        const notificationPayload = {
            notificationId,
            title: body.title,
            body: body.body,
            targetUrl,
            tokens: [user.notificationToken]
        }

        const response = await fetch(user.notificationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notificationPayload)
        })

        const responseData: NotificationResponse = await response.json()

        if (!response.ok) {
            console.error(`[Notifications] Failed to send to ${user.fid}:`, responseData)

            // If token is invalid, mark user's notifications as disabled
            if (response.status === 401 || response.status === 403) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        notificationsEnabled: false,
                        notificationToken: null,
                        notificationUrl: null
                    }
                })
                console.log(`[Notifications] Disabled notifications for user ${user.fid} due to invalid token`)
            }

            return NextResponse.json({
                success: false,
                error: "Failed to send notification",
                details: responseData
            }, { status: response.status })
        }

        console.log(`[Notifications] ✅ Sent to user ${user.fid}`)

        // Also store in our internal notifications table
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'push',
                title: body.title,
                message: body.body,
                data: {
                    notificationId,
                    targetUrl,
                    sentAt: new Date().toISOString()
                }
            }
        })

        return NextResponse.json({
            success: true,
            notificationId,
            userId: user.id,
            fid: user.fid
        })

    } catch (error) {
        console.error("[Notifications] Error:", error)
        return NextResponse.json(
            { error: "Failed to send notification", details: String(error) },
            { status: 500 }
        )
    }
}

/**
 * Send notification to multiple users at once
 * 
 * POST /api/notifications/send?batch=true
 */
export async function sendBatchNotifications(
    userIds: string[],
    title: string,
    body: string,
    targetUrl?: string
) {
    const results = []

    for (const userId of userIds) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (!user?.notificationsEnabled || !user?.notificationToken || !user?.notificationUrl) {
                results.push({ userId, success: false, reason: 'notifications_disabled' })
                continue
            }

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://votebase0301.vercel.app'
            const fullTargetUrl = targetUrl
                ? (targetUrl.startsWith('http') ? targetUrl : `${appUrl}${targetUrl}`)
                : appUrl

            const notificationId = `batch-${Date.now()}-${userId.slice(-6)}`

            const response = await fetch(user.notificationUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationId,
                    title,
                    body,
                    targetUrl: fullTargetUrl,
                    tokens: [user.notificationToken]
                })
            })

            results.push({
                userId,
                fid: user.fid,
                success: response.ok,
                status: response.status
            })

        } catch (error) {
            results.push({ userId, success: false, reason: String(error) })
        }
    }

    return results
}

// GET endpoint for testing
export async function GET() {
    // Count users with notifications enabled
    const usersWithNotifications = await prisma.user.count({
        where: { notificationsEnabled: true }
    })

    const totalUsers = await prisma.user.count()

    return NextResponse.json({
        status: "ok",
        endpoint: "VoteBase Notification Sender",
        documentation: "POST with { fid/userId, title, body, targetUrl?, notificationId? }",
        stats: {
            totalUsers,
            usersWithNotifications,
            notificationRate: totalUsers > 0 ? `${((usersWithNotifications / totalUsers) * 100).toFixed(1)}%` : '0%'
        }
    })
}
