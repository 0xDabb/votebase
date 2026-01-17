'use client'

import { sdk } from '@farcaster/miniapp-sdk'

// Re-export sdk for use throughout the app
export { sdk }

/**
 * Check if the app is running inside a Farcaster Mini App context
 */
export function isInMiniApp(): boolean {
    if (typeof window === 'undefined') return false
    return window.parent !== window
}

/**
 * Open a Farcaster profile
 */
export async function openProfile(fid: number): Promise<void> {
    try {
        await sdk.actions.viewProfile({ fid })
    } catch (error) {
        console.error('[VoteBase] Error opening profile:', error)
        // Fallback to Warpcast URL
        window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank')
    }
}

/**
 * Compose a cast with optional embeds
 */
export async function composeCast(options: {
    text?: string
    embeds?: string[]
}): Promise<void> {
    try {
        // Convert embeds array to the SDK's expected format (tuple of up to 2 strings)
        let embedsParam: [string] | [string, string] | undefined = undefined
        if (options.embeds && options.embeds.length > 0) {
            if (options.embeds.length >= 2) {
                embedsParam = [options.embeds[0], options.embeds[1]]
            } else {
                embedsParam = [options.embeds[0]]
            }
        }

        const result = await sdk.actions.composeCast({
            text: options.text,
            embeds: embedsParam
        })
        console.log('[VoteBase] Cast composed:', result)
    } catch (error) {
        console.error('[VoteBase] Error composing cast:', error)
        // Fallback to Warpcast compose URL
        const text = encodeURIComponent(options.text || '')
        const embedUrl = options.embeds?.[0] ? `&embeds[]=${encodeURIComponent(options.embeds[0])}` : ''
        window.open(`https://warpcast.com/~/compose?text=${text}${embedUrl}`, '_blank')
    }
}

/**
 * Prompt user to add the Mini App
 */
export async function promptAddMiniApp(): Promise<boolean> {
    try {
        const result = await sdk.actions.addMiniApp()
        return !!result
    } catch (error) {
        console.error('[VoteBase] Error adding mini app:', error)
        return false
    }
}

/**
 * Open an external URL
 */
export async function openUrl(url: string): Promise<void> {
    try {
        await sdk.actions.openUrl({ url })
    } catch (error) {
        console.error('[VoteBase] Error opening URL:', error)
        window.open(url, '_blank')
    }
}

/**
 * Close the Mini App
 */
export async function closeMiniApp(): Promise<void> {
    try {
        await sdk.actions.close()
    } catch (error) {
        console.error('[VoteBase] Error closing mini app:', error)
    }
}

/**
 * Get the current user context from Farcaster
 */
export async function getFarcasterContext() {
    try {
        const context = await sdk.context
        return context
    } catch (error) {
        console.error('[VoteBase] Error getting context:', error)
        return null
    }
}
