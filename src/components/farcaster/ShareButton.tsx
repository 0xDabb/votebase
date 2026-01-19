'use client'

import { useFarcasterActions } from '@/hooks/useFarcasterActions'
import { useState } from 'react'

interface ShareButtonProps {
    project: {
        id: string
        name: string
        tagline?: string
    }
    variant?: 'icon' | 'button' | 'text'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function ShareButton({
    project,
    variant = 'icon',
    size = 'md',
    className = ''
}: ShareButtonProps) {
    const { shareProject, isSharing, haptic } = useFarcasterActions()
    const [showSuccess, setShowSuccess] = useState(false)

    const handleShare = async () => {
        haptic('light')
        await shareProject(project)
        setShowSuccess(true)
        haptic('success')
        setTimeout(() => setShowSuccess(false), 2000)
    }

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    }

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    // Icon only variant
    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                disabled={isSharing}
                className={`
                    ${sizeClasses[size]}
                    flex items-center justify-center rounded-full
                    bg-white/5 hover:bg-white/10 active:bg-white/15
                    border border-white/10
                    transition-all duration-200
                    ${isSharing ? 'opacity-50 cursor-wait' : ''}
                    ${showSuccess ? 'bg-green-500/20 border-green-500/30' : ''}
                    ${className}
                `}
                title="Share on Farcaster"
            >
                {isSharing ? (
                    <div className={`${iconSizeClasses[size]} border-2 border-white/50 border-t-transparent rounded-full animate-spin`} />
                ) : showSuccess ? (
                    <svg
                        className={`${iconSizeClasses[size]} text-green-400`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg
                        className={`${iconSizeClasses[size]} text-white/70`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                )}
            </button>
        )
    }

    // Button variant with text
    if (variant === 'button') {
        return (
            <button
                onClick={handleShare}
                disabled={isSharing}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-purple-500/20 hover:bg-purple-500/30
                    border border-purple-500/30
                    text-purple-300 font-medium text-sm
                    transition-all duration-200
                    ${isSharing ? 'opacity-50 cursor-wait' : ''}
                    ${showSuccess ? 'bg-green-500/20 border-green-500/30 text-green-300' : ''}
                    ${className}
                `}
            >
                {isSharing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Sharing...
                    </>
                ) : showSuccess ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Shared!
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            {/* Farcaster logo simplified */}
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        Share on Farcaster
                    </>
                )}
            </button>
        )
    }

    // Text link variant
    return (
        <button
            onClick={handleShare}
            disabled={isSharing}
            className={`
                text-purple-400 hover:text-purple-300
                font-medium text-sm
                transition-colors duration-200
                ${isSharing ? 'opacity-50 cursor-wait' : ''}
                ${className}
            `}
        >
            {isSharing ? 'Sharing...' : showSuccess ? 'Shared!' : 'Share'}
        </button>
    )
}
