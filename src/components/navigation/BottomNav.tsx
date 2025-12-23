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
    { href: '/notifications', icon: Bell, label: 'Alerts', hasBadge: true },
    { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel-strong pb-safe">
            <div className="flex justify-around items-center h-20 px-2 pb-2 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isMain) {
                        return (
                            <Link
                                key={item.href}
                                href={user ? item.href : '#'}
                                className="relative -top-5"
                            >
                                <button
                                    className={cn(
                                        "flex items-center justify-center w-14 h-14 rounded-full",
                                        "bg-[#44e47e] text-black",
                                        "shadow-[0_0_20px_rgba(68,228,126,0.4)]",
                                        "hover:shadow-[0_0_30px_rgba(68,228,126,0.6)]",
                                        "transition-all hover:scale-105 active:scale-95"
                                    )}
                                    disabled={!user}
                                >
                                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                                </button>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-full gap-1 group transition-colors",
                                isActive ? "text-[#44e47e]" : "text-[#A0A0A0] hover:text-white"
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    className={cn(
                                        "w-6 h-6 transition-transform group-hover:scale-110",
                                        isActive && "fill-current"
                                    )}
                                />
                                {item.hasBadge && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-[#0F0F0F]" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px]",
                                isActive ? "font-bold" : "font-medium"
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
