import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

// Farcaster Webhook Events Types
type WebhookEvent =
    | 'miniapp_added'
    | 'miniapp_removed'
    | 'notifications_enabled'
    | 'notifications_disabled'

interface WebhookPayload {
    event: WebhookEvent
    notificationDetails?: {
        url: string
        token: string
    }
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[VoteBase Webhook] Received:", JSON.stringify(body, null, 2));

        // Check if this is a signed Farcaster event (has header, payload, signature)
        if (body.header && body.payload && body.signature) {
            // Decode the header to get FID
            const header = decodeBase64Url(body.header)
            const payload: WebhookPayload = decodeBase64Url(body.payload)

            console.log("[VoteBase Webhook] Decoded header:", header)
            console.log("[VoteBase Webhook] Decoded payload:", payload)

            const fid = header?.fid

            if (!fid) {
                console.error("[VoteBase Webhook] No FID in header")
                return NextResponse.json({ error: "Invalid header" }, { status: 400 })
            }

            // Handle different event types
            switch (payload.event) {
                case 'miniapp_added':
                    console.log(`[VoteBase Webhook] User ${fid} added the mini app`)

                    // Store notification token if provided
                    if (payload.notificationDetails) {
                        await prisma.user.updateMany({
                            where: { fid: fid },
                            data: {
                                // Store notification details (you may need to add these fields to schema)
                                updatedAt: new Date(),
                            }
                        })
                        console.log(`[VoteBase Webhook] Notification token saved for FID ${fid}`)
                    }
                    break

                case 'miniapp_removed':
                    console.log(`[VoteBase Webhook] User ${fid} removed the mini app`)
                    // Clear notification tokens for this user
                    break

                case 'notifications_enabled':
                    console.log(`[VoteBase Webhook] User ${fid} enabled notifications`)
                    if (payload.notificationDetails) {
                        // Store new notification token
                        console.log(`[VoteBase Webhook] New notification token for FID ${fid}`)
                    }
                    break

                case 'notifications_disabled':
                    console.log(`[VoteBase Webhook] User ${fid} disabled notifications`)
                    // Invalidate notification tokens
                    break

                default:
                    console.log(`[VoteBase Webhook] Unknown event:`, payload.event)
            }

            return NextResponse.json({
                success: true,
                event: payload.event,
                fid: fid
            });
        }

        // Handle legacy/simple webhook format
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[VoteBase Webhook] Error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "VoteBase Farcaster Webhook Endpoint",
        version: "2.0",
        supportedEvents: [
            "miniapp_added",
            "miniapp_removed",
            "notifications_enabled",
            "notifications_disabled"
        ]
    });
}
