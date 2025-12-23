'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, BarChart3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
    title?: string
    showSearch?: boolean
    showLogo?: boolean
    showProfile?: boolean
    onSearch?: (query: string) => void
}

export function Header({
    title,
    showSearch = true,
    showLogo = true,
    showProfile = true,
    onSearch
}: HeaderProps) {
    const { user } = useAuth()

    return (
        <header className="sticky top-0 left-0 right-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-4 flex items-center justify-between gap-4">
            {/* Logo or Title */}
            {showLogo ? (
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#49df80]/20 flex items-center justify-center text-[#49df80]">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Bote</span>
                </Link>
            ) : title ? (
                <h1 className="text-lg font-bold text-white">{title}</h1>
            ) : (
                <div />
            )}

            {/* Search */}
            {showSearch && (
                <div className="flex-1 max-w-[180px]">
                    <div className="relative h-10 w-full group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-[#A0A0A0]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            onChange={(e) => onSearch?.(e.target.value)}
                            className="block w-full h-full pl-10 pr-3 py-2 rounded-full border-none bg-[#1A1A1A]/80 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#49df80] focus:bg-[#1A1A1A] transition-all outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Profile */}
            {showProfile && (
                <Link href="/profile">
                    <button className="w-10 h-10 rounded-full overflow-hidden border border-white/[0.08]">
                        {user?.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.displayName || user.username}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-[#A0A0A0]">
                                <span className="text-sm font-medium">
                                    {user?.username?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                    </button>
                </Link>
            )}
        </header>
    )
}

