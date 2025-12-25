'use client'

import { useEffect } from 'react'
import sdk from '@farcaster/frame-sdk'

export function FrameSDKInit() {
    useEffect(() => {
        const init = async () => {
            try {
                // Initialize the SDK
                const context = await sdk.context
                console.log('Farcaster SDK initialized:', context)

                // Tell Farcaster we're ready
                await sdk.actions.ready()
                console.log('Farcaster SDK ready')
            } catch (error) {
                console.error('Failed to initialize Farcaster SDK:', error)
            }
        }

        init()
    }, [])

    return null
}
