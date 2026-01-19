'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useFarcasterActions } from '@/hooks/useFarcasterActions'
import { useState, useEffect } from 'react'

interface AddToFarcasterButtonProps {
    variant?: 'button' | 'banner' | 'compact'
    onSuccess?: () => void
    className?: string
}

export function AddToFarcasterButton({
    variant = 'button',
    onSuccess,
    className = ''
}: AddToFarcasterButtonProps) {
    const { user, isInFrame } = useAuth()
    const { addMiniApp, isAddingApp, haptic } = useFarcasterActions({
        onAddSuccess: () => {
            haptic('success')
            setHasAdded(true)
            onSuccess?.()
        }
    })
    const [hasAdded, setHasAdded] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    // Check localStorage for dismissed state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const wasDismissed = localStorage.getItem('votebase_add_dismissed')
            if (wasDismissed) {
                setDismissed(true)
            }
        }
    }, [])

    // Don't show if not in a Farcaster frame, already added, or dismissed
    if (!isInFrame || hasAdded || dismissed) {
        return null
    }

    const handleDismiss = () => {
        setDismissed(true)
        localStorage.setItem('votebase_add_dismissed', 'true')
    }

    const handleAdd = async () => {
        haptic('medium')
        await addMiniApp()
    }

    // Compact version - just an icon button
    if (variant === 'compact') {
        return (
            <button
                onClick={handleAdd}
                disabled={isAddingApp}
                className={`
                    relative flex items-center justify-center
                    w-10 h-10 rounded-full
                    bg-purple-500/20 hover:bg-purple-500/30
                    border border-purple-500/30
                    transition-all duration-200
                    ${isAddingApp ? 'opacity-50 cursor-wait' : ''}
                    ${className}
                `}
                title="Add to Farcaster"
            >
                {isAddingApp ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg
                        className="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                )}
            </button>
        )
    }

    // Banner version - full width notification
    if (variant === 'banner') {
        return (
            <div className={`
                relative mx-4 mb-4 p-4 rounded-xl
                bg-gradient-to-r from-purple-500/20 to-pink-500/20
                border border-purple-500/30
                ${className}
            `}>
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white">Enable Notifications</h3>
                        <p className="text-xs text-white/60 mt-0.5">
                            Get notified when someone upvotes your projects
                        </p>
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={isAddingApp}
                        className={`
                            flex-shrink-0 px-4 py-2 rounded-lg
                            bg-purple-500 hover:bg-purple-600
                            text-white text-sm font-medium
                            transition-all duration-200
                            ${isAddingApp ? 'opacity-50 cursor-wait' : ''}
                        `}
                    >
                        {isAddingApp ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Enable'
                        )}
                    </button>
                </div>
            </div>
        )
    }

    // Default button version
    return (
        <button
            onClick={handleAdd}
            disabled={isAddingApp}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                bg-gradient-to-r from-purple-500 to-pink-500
                hover:from-purple-600 hover:to-pink-600
                text-white font-medium text-sm
                transition-all duration-200
                ${isAddingApp ? 'opacity-50 cursor-wait' : ''}
                ${className}
            `}
        >
            {isAddingApp ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add to Farcaster
                </>
            )}
        </button>
    )
}
