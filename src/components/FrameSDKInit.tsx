'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export function FrameSDKInit() {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Only run once
        if (isReady) return

        const init = async () => {
            console.log('[VoteBase] FrameSDKInit: Starting...')

            // Check if we're in an iframe (Mini App context)
            const isInFrame = typeof window !== 'undefined' && window.parent !== window
            console.log('[VoteBase] Is in frame:', isInFrame)

            try {
                // Call ready immediately - this is critical!
                // ready() tells the host to hide the splash screen
                await sdk.actions.ready()
                console.log('[VoteBase] ✅ sdk.actions.ready() called successfully!')
                setIsReady(true)
            } catch (error) {
                console.error('[VoteBase] ❌ SDK ready error:', error)
                // Even on error, mark as ready to prevent infinite loops
                setIsReady(true)
            }
        }

        // Run immediately without waiting
        init()

        // Also set up event listeners for SDK events
        const handlePrimaryButtonClick = () => {
            console.log('[VoteBase] Primary button clicked')
        }

        try {
            sdk.on('primaryButtonClicked', handlePrimaryButtonClick)
        } catch (e) {
            // Event listener might not be available
        }

        return () => {
            try {
                sdk.off('primaryButtonClicked', handlePrimaryButtonClick)
            } catch (e) {
                // Cleanup might fail if SDK wasn't initialized
            }
        }
    }, [isReady])

    return null
}
