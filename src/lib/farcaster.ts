import sdk from '@farcaster/miniapp-sdk'

export interface FarcasterUser {
    fid: number
    username: string
    displayName?: string
    avatarUrl?: string
    custodyAddress?: string
}

export async function getFarcasterUser(): Promise<FarcasterUser | null> {
    try {
        const context = await sdk.context

        if (!context?.user) {
            return null
        }

        return {
            fid: context.user.fid,
            username: context.user.username || `fid:${context.user.fid}`,
            displayName: context.user.displayName,
            avatarUrl: context.user.pfpUrl,
        }
    } catch (error) {
        console.error('Error getting Farcaster user:', error)
        return null
    }
}

export async function isFrameContext(): Promise<boolean> {
    try {
        const context = await sdk.context
        return !!context
    } catch {
        return false
    }
}

export { sdk }
