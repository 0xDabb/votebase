'use client'

import { useEffect } from 'react'
import sdk from '@farcaster/miniapp-sdk'

export function FrameSDKInit() {
    useEffect(() => {
        const init = async () => {
            try {
                console.log('[VoteBase] Starting SDK initialization...')

                // Add ready immediately - don't wait for context
                sdk.actions.ready()
                console.log('[VoteBase] SDK ready() called')

                // Then try to get context
                const context = await sdk.context
                console.log('[VoteBase] SDK context:', context)
            } catch (error) {
                console.error('[VoteBase] SDK init error:', error)
                // Still call ready even if context fails
                try {
                    sdk.actions.ready()
                } catch (e) {
                    console.error('[VoteBase] Failed to call ready:', e)
                }
            }
        }

        init()
    }, [])

    return null
}
