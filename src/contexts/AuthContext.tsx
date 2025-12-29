'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import sdk from '@farcaster/miniapp-sdk'
import type { User } from '@/types'

interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
    isInFrame: boolean
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

    const isAuthenticated = !!user

    // Initialize - check for existing session and Farcaster context
    const initAuth = useCallback(async () => {
        setLoading(true)
        try {
            // Check if we're in a Farcaster frame context
            if (typeof window !== 'undefined') {
                // Create timeout promise (10 seconds for SDK initialization)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('SDK initialization timeout')), 10000)
                )

                try {
                    // Call ready with timeout protection
                    await Promise.race([
                        sdk.actions.ready(),
                        timeoutPromise
                    ])
                    console.log('Farcaster SDK ready called')

                    // Get context with timeout protection
                    const contextPromise = sdk.context
                    const context: any = await Promise.race([
                        contextPromise,
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('SDK context timeout')), 5000)
                        )
                    ])

                    console.log('Farcaster SDK context:', context)

                    if (context?.user) {
                        setIsInFrame(true)

                        // We have a Farcaster user, authenticate with our backend
                        const response = await fetch('/api/auth/farcaster', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fid: context.user.fid,
                                username: context.user.username || `fid:${context.user.fid}`,
                                displayName: context.user.displayName,
                                avatarUrl: context.user.pfpUrl,
                            }),
                        })

                        if (response.ok) {
                            const data = await response.json()
                            setUser(data.user)
                        }
                    } else {
                        console.log('No Farcaster user in context')
                    }
                } catch (sdkError) {
                    console.warn('SDK initialization failed or timed out:', sdkError)
                    // SDK failed, but app should still work as normal website
                    setIsInFrame(false)
                }
            }
        } catch (error) {
            console.error('Auth init error:', error)
            // Not in a Farcaster frame, that's okay for local dev
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        initAuth()
    }, [initAuth])

    async function signIn() {
        // Re-trigger the auth flow
        await initAuth()
    }

    function signOut() {
        setUser(null)
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
            console.error('Error refreshing user:', error)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                isInFrame,
                signIn,
                signOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
