'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Plus, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/explore', icon: Compass, label: 'Explore' },
    { href: '/create', icon: Plus, label: 'Create', isMain: true },
    { href: '/notifications', icon: Bell, label: 'Activity' },
    { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    return (
        <nav className="absolute bottom-0 left-0 right-0 z-50 bg-[#0F0F0F]/85 backdrop-blur-xl border-t border-white/5 rounded-t-3xl pb-8 pt-4 px-6">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isMain) {
                        return (
                            <Link
                                key={item.href}
                                href={user ? item.href : '#'}
                                className="relative -top-6"
                            >
                                <button
                                    className={cn(
                                        "flex items-center justify-center w-16 h-16 rounded-full",
                                        "bg-[#49df80] text-black",
                                        "shadow-[0_0_20px_rgba(73,223,128,0.4)]",
                                        "hover:shadow-[0_0_30px_rgba(73,223,128,0.6)]",
                                        "transition-all hover:scale-105 active:scale-95"
                                    )}
                                    disabled={!user}
                                >
                                    <Icon className="w-8 h-8" strokeWidth={2.5} />
                                </button>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 group transition-colors",
                                isActive ? "text-[#49df80]" : "text-[#A0A0A0] hover:text-white"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-6 h-6 transition-transform group-hover:scale-110",
                                    isActive && "fill-current"
                                )}
                            />
                            <span className={cn(
                                "text-[10px]",
                                isActive ? "font-medium" : "font-medium"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

