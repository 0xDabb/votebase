'use client'

import { useEffect, useCallback } from 'react'
import sdk from '@farcaster/miniapp-sdk'

export function FrameSDKInit() {
    const callReady = useCallback(() => {
        try {
            sdk.actions.ready()
            console.log('[VoteBase] SDK ready() called successfully')
        } catch (e) {
            console.error('[VoteBase] SDK ready() error:', e)
        }
    }, [])

    useEffect(() => {
        // Call ready immediately on mount - don't wait for anything
        console.log('[VoteBase] FrameSDKInit mounted, calling ready()...')

        // Call ready immediately
        callReady()

        // Also call ready after a short delay as backup
        const timer1 = setTimeout(callReady, 100)
        const timer2 = setTimeout(callReady, 500)
        const timer3 = setTimeout(callReady, 1000)

        // Try to get context in background (non-blocking)
        sdk.context
            .then(context => {
                console.log('[VoteBase] SDK context received:', context)
            })
            .catch(err => {
                console.log('[VoteBase] SDK context error (non-critical):', err)
            })

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [callReady])

    return null
}
