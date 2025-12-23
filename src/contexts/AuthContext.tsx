'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import sdk from '@farcaster/frame-sdk'
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
                const context = await sdk.context

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

                    // Tell the frame we're ready
                    await sdk.actions.ready()
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
