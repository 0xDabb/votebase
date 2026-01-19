'use client'

import { sdk } from '@farcaster/miniapp-sdk'
import { useCallback, useState } from 'react'

interface UseFarcasterActionsOptions {
    onAddSuccess?: () => void
    onAddError?: (error: Error) => void
    onShareSuccess?: () => void
    onShareError?: (error: Error) => void
}

export function useFarcasterActions(options: UseFarcasterActionsOptions = {}) {
    const [isAddingApp, setIsAddingApp] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [addAppError, setAddAppError] = useState<Error | null>(null)
    const [shareError, setShareError] = useState<Error | null>(null)

    /**
     * Prompt the user to add this Mini App to their Farcaster client
     * This enables push notifications
     */
    const addMiniApp = useCallback(async () => {
        setIsAddingApp(true)
        setAddAppError(null)

        try {
            console.log('[Farcaster] Prompting user to add Mini App...')

            // @ts-ignore - addMiniApp might not be in types yet
            if (sdk.actions.addMiniApp) {
                await sdk.actions.addMiniApp()
                console.log('[Farcaster] ✅ Mini App added successfully')
                options.onAddSuccess?.()
            } else {
                // Fallback: try to use the older addFrame method
                console.log('[Farcaster] addMiniApp not available, app may already be added')
            }
        } catch (error) {
            console.error('[Farcaster] ❌ Failed to add Mini App:', error)
            const err = error instanceof Error ? error : new Error(String(error))
            setAddAppError(err)
            options.onAddError?.(err)
        } finally {
            setIsAddingApp(false)
        }
    }, [options])

    /**
     * Open a cast composer to share content
     */
    const composeCast = useCallback(async (text: string, embedUrl?: string) => {
        setIsSharing(true)
        setShareError(null)

        try {
            console.log('[Farcaster] Opening cast composer...')

            const castOptions: any = {
                text
            }

            if (embedUrl) {
                castOptions.embeds = [embedUrl]
            }

            // @ts-ignore - composeCast types
            if (sdk.actions.composeCast) {
                await sdk.actions.composeCast(castOptions)
                console.log('[Farcaster] ✅ Cast composer opened')
                options.onShareSuccess?.()
            } else {
                // Fallback: open Warpcast compose URL
                const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}${embedUrl ? `&embeds[]=${encodeURIComponent(embedUrl)}` : ''}`
                window.open(warpcastUrl, '_blank')
                options.onShareSuccess?.()
            }
        } catch (error) {
            console.error('[Farcaster] ❌ Failed to open composer:', error)
            const err = error instanceof Error ? error : new Error(String(error))
            setShareError(err)
            options.onShareError?.(err)
        } finally {
            setIsSharing(false)
        }
    }, [options])

    /**
     * Share a project on Farcaster
     */
    const shareProject = useCallback(async (project: {
        id: string
        name: string
        tagline?: string
    }) => {
        const appUrl = 'https://votebase0301.vercel.app'
        const projectUrl = `${appUrl}/projects/${project.id}`
        const text = `Check out ${project.name} on VoteBase! 🚀\n\n${project.tagline || ''}`

        await composeCast(text.trim(), projectUrl)
    }, [composeCast])

    /**
     * Trigger haptic feedback
     */
    const haptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
        try {
            // @ts-ignore
            if (sdk.actions.haptic) {
                // @ts-ignore
                sdk.actions.haptic({ type })
            }
        } catch (e) {
            // Haptics might not be supported
        }
    }, [])

    /**
     * Open external link
     */
    const openLink = useCallback(async (url: string) => {
        try {
            // @ts-ignore
            if (sdk.actions.openUrl) {
                // @ts-ignore
                await sdk.actions.openUrl(url)
            } else {
                window.open(url, '_blank')
            }
        } catch (e) {
            window.open(url, '_blank')
        }
    }, [])

    /**
     * View a Farcaster profile
     */
    const viewProfile = useCallback(async (fid: number) => {
        try {
            // @ts-ignore
            if (sdk.actions.viewProfile) {
                // @ts-ignore
                await sdk.actions.viewProfile({ fid })
            } else {
                window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank')
            }
        } catch (e) {
            window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank')
        }
    }, [])

    return {
        // Add Mini App
        addMiniApp,
        isAddingApp,
        addAppError,

        // Sharing
        composeCast,
        shareProject,
        isSharing,
        shareError,

        // Utils
        haptic,
        openLink,
        viewProfile
    }
}
