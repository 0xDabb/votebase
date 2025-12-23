'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUp, MessageCircle, Reply, Star, Bell, Check, CheckCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatTimeAgo } from '@/lib/utils'
import type { Notification } from '@/types'

const notificationIcons: Record<string, React.ReactNode> = {
    UPVOTE: <ArrowUp className="w-5 h-5" />,
    COMMENT: <MessageCircle className="w-5 h-5" />,
    REPLY: <Reply className="w-5 h-5" />,
    FEATURED: <Star className="w-5 h-5" />,
    SYSTEM: <Bell className="w-5 h-5" />,
}

const notificationColors: Record<string, string> = {
    UPVOTE: 'bg-[#4ADE80]/20 text-[#4ADE80]',
    COMMENT: 'bg-blue-500/20 text-blue-400',
    REPLY: 'bg-purple-500/20 text-purple-400',
    FEATURED: 'bg-yellow-500/20 text-yellow-400',
    SYSTEM: 'bg-gray-500/20 text-gray-400',
}

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchNotifications()
        }
    }, [user])

    async function fetchNotifications() {
        if (!user) return

        setLoading(true)
        try {
            const res = await fetch(`/api/users/${user.id}/notifications`)
            const data = await res.json()

            if (data.success) {
                setNotifications(data.data)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    async function markAllAsRead() {
        if (!user) return

        try {
            await fetch(`/api/users/${user.id}/notifications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true }),
            })

            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    async function markAsRead(notificationId: string) {
        if (!user) return

        try {
            await fetch(`/api/users/${user.id}/notifications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [notificationId] }),
            })

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-[#44e47e] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-[#A0A0A0]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
                <p className="text-[#A0A0A0]">Connect with Farcaster to view notifications</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3 pt-12">
                    <div className="flex items-center gap-2">
                        <h2 className="text-white text-lg font-bold">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#44e47e] text-black text-xs font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1 text-sm text-[#44e47e] hover:opacity-80"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>
            </header>

            {/* Notifications List */}
            <div className="px-4 py-4">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-[#1A1A1A] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const projectId = (notification.data as Record<string, string>)?.projectId

                            return (
                                <div
                                    key={notification.id}
                                    className={`relative p-4 rounded-2xl border transition-all ${notification.read
                                            ? 'bg-[#1A1A1A] border-white/5'
                                            : 'bg-[#1A1A1A] border-[#44e47e]/30'
                                        }`}
                                >
                                    {/* Unread indicator */}
                                    {!notification.read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#44e47e]" />
                                    )}

                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notificationColors[notification.type] || notificationColors.SYSTEM
                                            }`}>
                                            {notificationIcons[notification.type] || notificationIcons.SYSTEM}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white">{notification.title}</p>
                                            {notification.message && (
                                                <p className="text-xs text-[#A0A0A0] mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-[#A0A0A0] mt-1">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        {projectId && (
                                            <Link
                                                href={`/projects/${projectId}`}
                                                className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-white hover:bg-white/10 transition-colors"
                                            >
                                                View Project
                                            </Link>
                                        )}
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="px-3 py-1.5 rounded-full text-xs text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <Check className="w-3 h-3" />
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-[#A0A0A0]" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">No notifications yet</h3>
                        <p className="text-sm text-[#A0A0A0]">
                            We&apos;ll notify you when something happens
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
