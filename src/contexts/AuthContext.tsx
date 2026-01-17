'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import type { User } from '@/types'

interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
    isInFrame: boolean
    farcasterContext: any | null
    signIn: () => Promise<void>
    signOut: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isInFrame, setIsInFrame] = useState(false)
    const [farcasterContext, setFarcasterContext] = useState<any | null>(null)

    const isAuthenticated = !!user

    // Initialize - check for existing session and Farcaster context
    const initAuth = useCallback(async () => {
        setLoading(true)
        console.log('[VoteBase Auth] Starting initialization...')

        try {
            // Check if we're in a Farcaster frame context
            if (typeof window !== 'undefined') {
                const inFrame = window.parent !== window
                console.log('[VoteBase Auth] In frame:', inFrame)

                // IMMEDIATELY call ready - don't wait for anything
                // This is critical for Warpcast to dismiss splash screen
                try {
                    await sdk.actions.ready()
                    console.log('[VoteBase Auth] SDK ready called')
                } catch (e) {
                    console.warn('[VoteBase Auth] Failed to call ready:', e)
                }

                // Try to get context with timeout protection
                try {
                    const context = await Promise.race([
                        sdk.context,
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('SDK context timeout')), 3000)
                        )
                    ]) as any

                    console.log('[VoteBase Auth] Farcaster context:', context)
                    setFarcasterContext(context)

                    if (context?.user) {
                        setIsInFrame(true)
                        console.log('[VoteBase Auth] User from context:', context.user)

                        // Authenticate with our backend
                        const response = await fetch('/api/auth/farcaster', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fid: context.user.fid,
                                username: context.user.username || `fid:${context.user.fid}`,
                                displayName: context.user.displayName,
                                avatarUrl: context.user.pfpUrl,
                                custodyAddress: context.user.custody,
                            }),
                        })

                        if (response.ok) {
                            const data = await response.json()
                            console.log('[VoteBase Auth] User authenticated:', data.user)
                            setUser(data.user)
                        } else {
                            console.error('[VoteBase Auth] Auth response not ok:', response.status)
                        }
                    } else {
                        console.log('[VoteBase Auth] No Farcaster user in context')
                    }
                } catch (sdkError) {
                    console.warn('[VoteBase Auth] SDK context failed:', sdkError)
                    setIsInFrame(false)
                }
            }
        } catch (error) {
            console.error('[VoteBase Auth] Init error:', error)
        } finally {
            setLoading(false)
            console.log('[VoteBase Auth] Initialization complete')
        }
    }, [])

    useEffect(() => {
        initAuth()
    }, [initAuth])

    // Sign in (re-trigger auth flow)
    async function signIn() {
        console.log('[VoteBase Auth] Sign in triggered')

        // If we're in a frame but not authenticated, try SDK signin
        if (typeof window !== 'undefined' && window.parent !== window) {
            try {
                // Use SDK signIn with correct options
                const result = await sdk.actions.signIn({
                    nonce: crypto.randomUUID(),
                })
                console.log('[VoteBase Auth] SDK sign in result:', result)
            } catch (e) {
                console.warn('[VoteBase Auth] SDK signin failed:', e)
            }
        }

        await initAuth()
    }

    function signOut() {
        console.log('[VoteBase Auth] Sign out')
        setUser(null)
        setFarcasterContext(null)
    }

    async function refreshUser() {
        if (!user) return

        try {
            const response = await fetch(`/api/users/${user.id}`)
            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error('[VoteBase Auth] Error refreshing user:', error)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                isInFrame,
                farcasterContext,
                signIn,
                signOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
