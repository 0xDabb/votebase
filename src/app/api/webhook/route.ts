import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[VoteBase Webhook] Received:", JSON.stringify(body, null, 2));

        // Handle Farcaster frame interactions
        // This is a placeholder for future webhook handling

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
        message: "VoteBase Farcaster Webhook Endpoint"
    });
}
