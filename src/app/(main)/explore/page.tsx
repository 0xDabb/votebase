'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Search, ArrowUp, Home, Compass, Bell, User, TrendingUp, Users, Award } from 'lucide-react'

interface UserData {
    id: string
    fid: number
    username: string
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
    upvoteCount: number
    createdAt: string
    hasUpvoted?: boolean
    _count: {
        projects: number
        comments: number
    }
}

export default function ExplorePage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<UserData[]>([])
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [upvotingId, setUpvotingId] = useState<string | null>(null)

    useEffect(() => { fetchUsers() }, [currentUser])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = users.filter(u =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.bio?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredUsers(filtered)
        } else {
            setFilteredUsers(users)
        }
    }, [searchQuery, users])

    async function fetchUsers() {
        setLoading(true)
        try {
            const url = currentUser
                ? `/api/users?limit=50&userId=${currentUser.id}`
                : '/api/users?limit=50'
            const res = await fetch(url)
            const data = await res.json()
            if (data.success) {
                setUsers(data.data)
                setFilteredUsers(data.data)
            }
        } catch (e) {
            console.error('Error fetching users:', e)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpvote(creatorId: string) {
        if (!currentUser) {
            alert('Please login to upvote creators')
            return
        }

        if (upvotingId) return // Prevent double clicks

        setUpvotingId(creatorId)
        try {
            const res = await fetch(`/api/users/${creatorId}/upvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            })
            const data = await res.json()

            if (data.success) {
                // Refresh data to show updated vote count and status
                fetchUsers()
            } else if (data.alreadyUpvoted) {
                alert('You have already upvoted this creator!')
            }
        } catch (e) {
            console.error('Error upvoting:', e)
        } finally {
            setTimeout(() => setUpvotingId(null), 500)
        }
    }

    const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString()

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: '120px' }}>

            {/* HEADER */}
            <div style={{ padding: '20px 20px 12px 20px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 2px 0' }}>
                        Creators
                    </h1>
                    <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
                        Vote for your favorite Farcaster creators
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    height: '42px',
                    padding: '0 14px',
                    borderRadius: '21px',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Search style={{ width: '16px', height: '16px', color: '#49df80' }} />
                    <input
                        type="text"
                        placeholder="Search creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#fff',
                            fontSize: '13px'
                        }}
                    />
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <div style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: '#161616',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Users style={{ width: '14px', height: '14px', color: '#49df80' }} />
                        <div>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{users.length}</div>
                            <div style={{ color: '#666', fontSize: '10px' }}>Creators</div>
                        </div>
                    </div>
                    <div style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: '#161616',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <TrendingUp style={{ width: '14px', height: '14px', color: '#facc15' }} />
                        <div>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                                {users.reduce((sum, u) => sum + u.upvoteCount, 0)}
                            </div>
                            <div style={{ color: '#666', fontSize: '10px' }}>Total Votes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* USER LIST */}
            <div style={{ padding: '0 20px' }}>
                {loading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, i) => (
                        <div key={i} style={{
                            height: '80px',
                            borderRadius: '16px',
                            background: '#161616',
                            marginBottom: '12px'
                        }} />
                    ))
                ) : filteredUsers.length === 0 ? (
                    // Empty state
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 20px',
                        color: '#666'
                    }}>
                        <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px', margin: 0 }}>
                            {searchQuery ? 'No creators found' : 'No creators yet'}
                        </p>
                    </div>
                ) : (
                    // User cards
                    filteredUsers.map((u, index) => (
                        <div
                            key={u.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '14px',
                                background: '#161616',
                                marginBottom: '8px',
                                border: index < 3 ? '1px solid rgba(73, 223, 128, 0.2)' : '1px solid transparent'
                            }}
                        >
                            {/* Rank Badge (Top 3) */}
                            {index < 3 && (
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: index === 0 ? '#facc15' : index === 1 ? '#94a3b8' : '#d97706',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Award style={{ width: '12px', height: '12px', color: '#000' }} />
                                </div>
                            )}

                            {/* Avatar */}
                            <Link href={`/users/${u.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: u.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #49df80, #2a9d5f)',
                                    overflow: 'hidden',
                                    border: '2px solid rgba(73, 223, 128, 0.2)'
                                }}>
                                    {u.avatarUrl ? (
                                        <img
                                            src={u.avatarUrl}
                                            alt={u.username}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#000',
                                            fontWeight: 700,
                                            fontSize: '16px'
                                        }}>
                                            {u.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* User Info */}
                            <Link href={`/users/${u.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1px' }}>
                                        <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, margin: 0 }}>
                                            {u.displayName || u.username}
                                        </h3>
                                        {index === 0 && (
                                            <span style={{
                                                fontSize: '8px',
                                                fontWeight: 700,
                                                background: '#facc15',
                                                color: '#000',
                                                padding: '1px 5px',
                                                borderRadius: '3px'
                                            }}>
                                                TOP
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ color: '#666', fontSize: '11px', margin: '0 0 2px 0' }}>
                                        @{u.username}
                                    </p>
                                    {u.bio && (
                                        <p style={{
                                            color: '#888',
                                            fontSize: '10px',
                                            margin: 0,
                                            lineHeight: 1.3,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {u.bio}
                                        </p>
                                    )}
                                </div>
                            </Link>

                            {/* Upvote Button */}
                            <button
                                onClick={() => handleUpvote(u.id)}
                                disabled={u.hasUpvoted || upvotingId === u.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    background: u.hasUpvoted ? '#49df8040' : '#49df8015',
                                    border: u.hasUpvoted ? '1px solid #49df80' : '1px solid #49df8030',
                                    cursor: u.hasUpvoted ? 'default' : 'pointer',
                                    flexShrink: 0,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: upvotingId === u.id ? 'scale(1.1)' : 'scale(1)',
                                    opacity: u.hasUpvoted ? 0.8 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!u.hasUpvoted) {
                                        e.currentTarget.style.background = '#49df8025'
                                        e.currentTarget.style.borderColor = '#49df80'
                                        e.currentTarget.style.transform = 'scale(1.05)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!u.hasUpvoted) {
                                        e.currentTarget.style.background = '#49df8015'
                                        e.currentTarget.style.borderColor = '#49df8030'
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }
                                }}
                            >
                                <ArrowUp style={{
                                    width: '14px',
                                    height: '14px',
                                    color: u.hasUpvoted ? '#49df80' : '#49df80',
                                    transition: 'transform 0.3s',
                                    transform: upvotingId === u.id ? 'translateY(-2px)' : 'translateY(0)'
                                }} />
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: u.hasUpvoted ? '#49df80' : '#49df80'
                                }}>
                                    {fmt(u.upvoteCount)}
                                </span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                padding: '12px 24px 32px 24px',
                background: 'rgba(10,10,10,0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid #1a1a1a'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: '360px',
                    margin: '0 auto'
                }}>
                    <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Home style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Home</span>
                    </Link>
                    <Link href="/explore" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Compass style={{ width: '24px', height: '24px', color: '#49df80', fill: '#49df80' }} />
                        <span style={{ fontSize: '10px', color: '#49df80' }}>Creators</span>
                    </Link>
                    <Link href="/" style={{ position: 'relative', top: '-20px', textDecoration: 'none' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#49df80',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 24px rgba(73,223,128,0.4)',
                            overflow: 'hidden',
                            padding: '8px'
                        }}>
                            <img src="/icon.png" alt="VoteBase" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </Link>
                    <Link href="/notifications" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Bell style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Activity</span>
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
