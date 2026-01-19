import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

// Farcaster Webhook Events Types
type WebhookEvent =
    | 'miniapp_added'
    | 'miniapp_removed'
    | 'notifications_enabled'
    | 'notifications_disabled'

interface NotificationDetails {
    url: string
    token: string
}

interface WebhookPayload {
    event: WebhookEvent
    notificationDetails?: NotificationDetails
}

interface DecodedHeader {
    fid: number
    type: string
    key: string
}

// Decode base64url to JSON
function decodeBase64Url(str: string): any {
    try {
        // Replace base64url chars with base64 chars
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
        const padding = '='.repeat((4 - base64.length % 4) % 4)
        const decoded = atob(base64 + padding)
        return JSON.parse(decoded)
    } catch (e) {
        console.error('[Webhook] Failed to decode base64url:', e)
        return null
    }
}

// Store or update notification token for a user
async function updateUserNotificationSettings(
    fid: number,
    notificationDetails?: NotificationDetails,
    miniAppAdded?: boolean,
    notificationsEnabled?: boolean
) {
    try {
        // First check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { fid }
        })

        if (!existingUser) {
            console.log(`[Webhook] User with FID ${fid} not found, skipping update`)
            return null
        }

        const updateData: any = {
            updatedAt: new Date()
        }

        if (miniAppAdded !== undefined) {
            updateData.miniAppAdded = miniAppAdded
        }

        if (notificationsEnabled !== undefined) {
            updateData.notificationsEnabled = notificationsEnabled
        }

        if (notificationDetails) {
            updateData.notificationToken = notificationDetails.token
            updateData.notificationUrl = notificationDetails.url
        } else if (notificationsEnabled === false) {
            // Clear tokens when notifications are disabled
            updateData.notificationToken = null
            updateData.notificationUrl = null
        }

        const user = await prisma.user.update({
            where: { fid },
            data: updateData
        })

        console.log(`[Webhook] Updated user ${fid}:`, {
            miniAppAdded: user.miniAppAdded,
            notificationsEnabled: user.notificationsEnabled,
            hasToken: !!user.notificationToken
        })

        return user
    } catch (error) {
        console.error(`[Webhook] Failed to update user ${fid}:`, error)
        return null
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[VoteBase Webhook] Received event at:", new Date().toISOString());
        console.log("[VoteBase Webhook] Body:", JSON.stringify(body, null, 2));

        // Check if this is a signed Farcaster event (has header, payload, signature)
        if (body.header && body.payload && body.signature) {
            // Decode the header to get FID
            const header: DecodedHeader = decodeBase64Url(body.header)
            const payload: WebhookPayload = decodeBase64Url(body.payload)

            console.log("[VoteBase Webhook] Decoded header:", header)
            console.log("[VoteBase Webhook] Decoded payload:", payload)

            const fid = header?.fid

            if (!fid) {
                console.error("[VoteBase Webhook] No FID in header")
                return NextResponse.json({ error: "Invalid header - missing FID" }, { status: 400 })
            }

            // TODO: In production, verify the signature using @farcaster/miniapp-node
            // See: https://miniapps.farcaster.xyz/docs/guides/notifications#verifying-events
            // const isValid = await verifyEvent(body.header, body.payload, body.signature)
            // if (!isValid) {
            //     return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
            // }

            // Handle different event types
            switch (payload.event) {
                case 'miniapp_added':
                    console.log(`[VoteBase Webhook] 🎉 User ${fid} added the mini app`)
                    await updateUserNotificationSettings(
                        fid,
                        payload.notificationDetails,
                        true, // miniAppAdded
                        !!payload.notificationDetails // notificationsEnabled (true if token provided)
                    )
                    break

                case 'miniapp_removed':
                    console.log(`[VoteBase Webhook] 👋 User ${fid} removed the mini app`)
                    await updateUserNotificationSettings(
                        fid,
                        undefined,
                        false, // miniAppAdded
                        false // notificationsEnabled
                    )
                    break

                case 'notifications_enabled':
                    console.log(`[VoteBase Webhook] 🔔 User ${fid} enabled notifications`)
                    await updateUserNotificationSettings(
                        fid,
                        payload.notificationDetails,
                        undefined, // don't change miniAppAdded
                        true // notificationsEnabled
                    )
                    break

                case 'notifications_disabled':
                    console.log(`[VoteBase Webhook] 🔕 User ${fid} disabled notifications`)
                    await updateUserNotificationSettings(
                        fid,
                        undefined,
                        undefined, // don't change miniAppAdded
                        false // notificationsEnabled
                    )
                    break

                default:
                    console.log(`[VoteBase Webhook] ❓ Unknown event:`, payload.event)
            }

            return NextResponse.json({
                success: true,
                event: payload.event,
                fid: fid,
                timestamp: new Date().toISOString()
            });
        }

        // Handle legacy/simple webhook format or unknown format
        console.log("[VoteBase Webhook] Received non-standard webhook format")
        return NextResponse.json({
            success: true,
            message: "Webhook received but format not recognized"
        });

    } catch (error) {
        console.error("[VoteBase Webhook] Error processing webhook:", error);
        return NextResponse.json(
            { error: "Webhook processing failed", details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: "ok",
        name: "VoteBase Farcaster Webhook",
        version: "3.0",
        documentation: "https://miniapps.farcaster.xyz/docs/guides/notifications",
        supportedEvents: [
            "miniapp_added",
            "miniapp_removed",
            "notifications_enabled",
            "notifications_disabled"
        ],
        timestamp: new Date().toISOString()
    });
}
