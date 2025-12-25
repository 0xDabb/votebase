'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
    label?: string
    className?: string
}

export function BackButton({ label = 'Back', className = '' }: BackButtonProps) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-white/70 hover:text-white transition-colors ${className}`}
        >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
