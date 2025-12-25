'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUp, Clock, Home, Compass, Bell, User, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface UpvoteActivity {
    id: string
    createdAt: Date
    project: {
        id: string
        name: string
        tagline: string
        upvoteCount: number
        category?: {
            name: string
            color: string
        }
    }
}

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth()
    const [activities, setActivities] = useState<UpvoteActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchActivities()
        }
    }, [user])

    async function fetchActivities() {
        if (!user) return

        setLoading(true)
        try {
            const res = await fetch(`/api/users/${user.id}/activities`)
            const data = await res.json()

            if (data.success) {
                setActivities(data.data)
            }
        } catch (error) {
            console.error('Error fetching activities:', error)
        } finally {
            setLoading(false)
        }
    }

    const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString()

    const timeAgo = (date: Date) => {
        const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
        if (mins < 10080) return `${Math.floor(mins / 1440)}d ago`
        return new Date(date).toLocaleDateString()
    }

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid #49df80', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        )
    }

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '40px' }}>🔐</span>
                </div>
                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Sign In Required</h1>
                <p style={{ color: '#888', marginBottom: '24px' }}>Connect with Farcaster to view your activity</p>
                <p style={{ color: '#666', fontSize: '12px' }}>Open this app in Warpcast to sign in automatically</p>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 20px', paddingTop: '48px', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1a1a1a' }}>
                <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>Activity</h2>
                <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>Your voting history</p>
            </div>

            {/* Activity List */}
            <div style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ height: '100px', borderRadius: '16px', background: '#161616', animation: 'pulse 2s infinite' }} />
                        ))}
                    </div>
                ) : activities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activities.map((activity) => (
                            <Link href={`/projects/${activity.project.id}`} key={activity.id} style={{ textDecoration: 'none' }}>
                                <div style={{ padding: '16px', borderRadius: '16px', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {/* Icon */}
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#49df8020', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <ArrowUp style={{ width: '20px', height: '20px', color: '#49df80' }} />
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>You upvoted</span>
                                                {activity.project.category && (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '8px',
                                                        background: `${activity.project.category.color}20`,
                                                        color: activity.project.category.color,
                                                        fontSize: '10px',
                                                        fontWeight: 600
                                                    }}>
                                                        {activity.project.category.name}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                                                {activity.project.name}
                                            </h3>

                                            <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {activity.project.tagline}
                                            </p>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                                                    <Clock style={{ width: '12px', height: '12px' }} />
                                                    <span style={{ fontSize: '11px' }}>{timeAgo(activity.createdAt)}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ArrowUp style={{ width: '12px', height: '12px', color: '#49df80' }} />
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#49df80' }}>
                                                        {fmt(activity.project.upvoteCount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Bell style={{ width: '32px', height: '32px', color: '#666' }} />
                        </div>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Activity Yet</h3>
                        <p style={{ color: '#888', marginBottom: '24px' }}>Start upvoting projects to see your activity here</p>
                        <Link href="/" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: '12px', background: '#49df80', color: '#000', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                            Explore Projects
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '12px 24px 32px 24px', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '360px', margin: '0 auto' }}>
                    <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Home style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Home</span>
                    </Link>
                    <Link href="/explore" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Compass style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Explore</span>
                    </Link>
                    <Link href="/" style={{ position: 'relative', top: '-20px', textDecoration: 'none' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#49df80', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(73,223,128,0.4)', overflow: 'hidden', padding: '8px' }}>
                            <img src="/icon.png" alt="VoteBase" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </Link>
                    <Link href="/notifications" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Bell style={{ width: '24px', height: '24px', color: '#49df80', fill: '#49df80' }} />
                        <span style={{ fontSize: '10px', color: '#49df80' }}>Activity</span>
                    </Link>
                    <Link href="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <User style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
