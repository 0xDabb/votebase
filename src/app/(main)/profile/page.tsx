'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Share2, Settings, ArrowUp, MessageCircle, Zap, Home, Compass, Plus, Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { Project } from '@/types'

type ProfileTab = 'projects' | 'upvoted' | 'saved'

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth()
    const [activeTab, setActiveTab] = useState<ProfileTab>('projects')
    const [projects, setProjects] = useState<Project[]>([])
    const [stats, setStats] = useState({
        projectCount: 0,
        totalUpvotes: 0,
        savedCount: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user, activeTab])

    async function fetchUserData() {
        if (!user) return

        setLoading(true)
        try {
            const profileRes = await fetch(`/api/users/${user.id}`)
            const profileData = await profileRes.json()

            if (profileData.success) {
                setStats({
                    projectCount: profileData.data._count?.projects || 0,
                    totalUpvotes: profileData.data.totalUpvotesReceived || 0,
                    savedCount: profileData.data._count?.savedProjects || 0,
                })

                if (activeTab === 'projects') {
                    setProjects(profileData.data.projects || [])
                }
            }

            if (activeTab === 'upvoted') {
                const params = new URLSearchParams({ userId: user.id })
                const res = await fetch(`/api/projects?${params}`)
                const data = await res.json()
                if (data.success) {
                    setProjects(data.data.filter((p: Project) => p.hasUpvoted))
                }
            } else if (activeTab === 'saved') {
                const res = await fetch(`/api/users/${user.id}/saved`)
                const data = await res.json()
                if (data.success) {
                    setProjects(data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString()

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
                <p style={{ color: '#888', marginBottom: '24px' }}>Connect with Farcaster to view your profile</p>
                <p style={{ color: '#666', fontSize: '12px' }}>Open this app in Warpcast to sign in automatically</p>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 20px', paddingTop: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1a1a1a' }}>
                <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>Profile</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
                        <Share2 style={{ width: '18px', height: '18px' }} />
                    </button>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
                        <Settings style={{ width: '18px', height: '18px' }} />
                    </button>
                </div>
            </div>

            {/* Profile Info */}
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{ padding: '3px', borderRadius: '50%', background: 'linear-gradient(135deg, #49df80, #2a9d5f)' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #0a0a0a', overflow: 'hidden', background: '#161616' }}>
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.displayName || user.username} width={100} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 700, color: '#888' }}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#49df80', border: '4px solid #0a0a0a' }} />
                </div>

                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
                    {user.displayName || user.username}
                </h1>
                <p style={{ color: '#49df80', fontSize: '14px', fontWeight: 600 }}>@{user.username}</p>
            </div>

            {/* Stats */}
            <div style={{ padding: '0 20px 24px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '16px', borderRadius: '16px', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{stats.projectCount}</p>
                        <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</p>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '16px', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{fmt(stats.totalUpvotes)}</p>
                        <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upvotes</p>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '16px', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <p style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{stats.savedCount}</p>
                        <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saved</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 20px 16px 20px', position: 'sticky', top: '76px', zIndex: 40, background: '#0a0a0a', paddingTop: '8px' }}>
                <div style={{ display: 'flex', height: '44px', borderRadius: '22px', background: '#161616', padding: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {(['projects', 'upvoted', 'saved'] as ProfileTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                height: '100%',
                                borderRadius: '18px',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: activeTab === tab ? '#49df80' : 'transparent',
                                color: activeTab === tab ? '#000' : '#888'
                            }}
                        >
                            {tab === 'projects' ? 'My Projects' : tab === 'upvoted' ? 'Upvoted' : 'Saved'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            <div style={{ padding: '0 20px' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ height: '180px', borderRadius: '20px', background: '#161616', animation: 'pulse 2s infinite' }} />
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {projects.map((p) => (
                            <Link href={`/projects/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                                <div style={{ borderRadius: '20px', padding: '14px', height: '180px', display: 'flex', flexDirection: 'column', background: '#161616' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.category?.color ? `${p.category.color}20` : '#49df8020', marginBottom: '10px' }}>
                                        <Zap style={{ width: '18px', height: '18px', color: p.category?.color || '#49df80' }} />
                                    </div>
                                    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0' }}>{p.name}</h3>
                                    <p style={{ color: '#888', fontSize: '11px', margin: 0, lineHeight: 1.4, flex: 1 }}>{p.tagline}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ArrowUp style={{ width: '12px', height: '12px', color: '#49df80' }} />
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#49df80' }}>{fmt(p.upvoteCount)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555' }}>
                                            <MessageCircle style={{ width: '12px', height: '12px' }} />
                                            <span style={{ fontSize: '10px' }}>{p._count?.comments || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <p style={{ color: '#888', marginBottom: '16px' }}>
                            {activeTab === 'projects'
                                ? "You haven't created any projects yet"
                                : activeTab === 'upvoted'
                                    ? "You haven't upvoted any projects yet"
                                    : "You haven't saved any projects yet"
                            }
                        </p>
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
                        <Bell style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Activity</span>
                    </Link>
                    <Link href="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <User style={{ width: '24px', height: '24px', color: '#49df80', fill: '#49df80' }} />
                        <span style={{ fontSize: '10px', color: '#49df80' }}>Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
