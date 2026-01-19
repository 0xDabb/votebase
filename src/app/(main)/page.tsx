'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Search, TrendingUp, ArrowUp, MessageCircle, Home, Compass, Plus, Bell, User, Zap, X } from 'lucide-react'
import type { Project, Category } from '@/types'
import { AddToFarcasterButton } from '@/components/farcaster/AddToFarcasterButton'

export default function HomePage() {
    const { user } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [selectedCategory, user])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = projects.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredProjects(filtered)
        } else {
            setFilteredProjects(projects)
        }
    }, [searchQuery, projects])

    async function fetchData() {
        setLoading(true)
        try {
            // Build project query parameters
            const params = new URLSearchParams({ sortBy: 'upvotes', pageSize: '20' })
            if (selectedCategory) params.set('categoryId', selectedCategory)
            if (user?.id) params.set('userId', user.id)

            // Parallel fetch - much faster than sequential
            const [catData, projData] = await Promise.all([
                fetch('/api/categories').then(res => res.json()),
                fetch(`/api/projects?${params}`).then(res => res.json())
            ])

            // Update state with fetched data
            if (catData.success) setCategories(catData.data)
            if (projData.success) {
                setProjects(projData.data)
                setFilteredProjects(projData.data)
            }
        } catch (e) {
            console.error('Error fetching data:', e)
            // Show user-friendly error message
            alert('Failed to load data. Please refresh the page.')
        } finally {
            setLoading(false)
        }
    }

    async function handleUpvote(id: string) {
        if (!user) return
        await fetch(`/api/projects/${id}/upvote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) })
        fetchData()
    }

    const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString()
    const featured = filteredProjects.find(p => p.featured)
    const regular = filteredProjects.filter(p => !p.featured)

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

            {/* HEADER */}
            <div style={{ padding: '24px 20px 16px 20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '56px',
                    padding: '0 12px',
                    borderRadius: '28px',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {/* Logo + Name */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img src="/icon.png" alt="VoteBase" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>VoteBase</span>
                    </Link>

                    {/* Search Button */}
                    <button onClick={() => setShowSearch(!showSearch)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                        <Search style={{ width: '16px', height: '16px', color: '#666' }} />
                        <span style={{ color: '#666', fontSize: '14px' }}>Search...</span>
                    </button>

                    {/* Avatar */}
                    <Link href="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #49df80, #2a9d5f)',
                            overflow: 'hidden'
                        }}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>
                                    {user?.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>

            {/* ADD TO FARCASTER BANNER */}
            <AddToFarcasterButton variant="banner" />

            {/* SEARCH BAR (Expandable) */}
            {showSearch && (
                <div style={{ padding: '0 20px 16px 20px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            autoFocus
                            style={{
                                width: '100%',
                                height: '48px',
                                padding: '0 48px 0 16px',
                                borderRadius: '24px',
                                background: '#161616',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#49df80',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X style={{ width: '14px', height: '14px', color: '#000' }} />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p style={{ color: '#888', fontSize: '12px', marginTop: '8px', paddingLeft: '16px' }}>
                            Found {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                        </p>
                    )}
                </div>
            )}

            {/* CATEGORY PILLS */}
            <div style={{ padding: '0 20px 16px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
                <button onClick={() => setSelectedCategory(null)} style={{
                    height: '36px', padding: '0 20px', borderRadius: '18px', border: 'none',
                    background: !selectedCategory ? '#49df80' : 'transparent',
                    color: !selectedCategory ? '#000' : '#888',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                    ...(selectedCategory ? { border: '1px solid #333' } : {})
                }}>All</button>
                <button style={{
                    height: '36px', padding: '0 20px', borderRadius: '18px',
                    background: 'transparent', color: '#888', fontSize: '13px', fontWeight: 500,
                    border: '1px solid #333', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <TrendingUp style={{ width: '14px', height: '14px', color: '#facc15' }} />
                    Trending
                </button>
                {categories.slice(0, 3).map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{
                        height: '36px', padding: '0 20px', borderRadius: '18px', border: 'none',
                        background: selectedCategory === c.id ? '#49df80' : 'transparent',
                        color: selectedCategory === c.id ? '#000' : '#888',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer', flexShrink: 0,
                        ...(selectedCategory !== c.id ? { border: '1px solid #333' } : {})
                    }}>{c.name}</button>
                ))}
            </div>

            {/* FEATURED PROJECT */}
            {featured && (
                <div style={{ padding: '0 20px 12px 20px' }}>
                    <Link href={`/projects/${featured.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', borderRadius: '24px', overflow: 'hidden', background: '#161616' }}>
                            <div style={{ width: '38%', minHeight: '140px', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: featured.coverImage ? `url(${featured.coverImage})` : 'linear-gradient(135deg, #2a4a3a, #1a2a22)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            </div>
                            <div style={{ width: '62%', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 }}>{featured.name}</h2>
                                        <button onClick={(e) => { e.preventDefault(); handleUpvote(featured.id) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#49df80', color: '#000', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                                            <ArrowUp style={{ width: '12px', height: '12px' }} />
                                            {fmt(featured.upvoteCount)}
                                        </button>
                                    </div>
                                    <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{featured.tagline}</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #222' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
                                        <span style={{ color: '#666', fontSize: '11px' }}>by {featured.creator?.displayName || 'User'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                                        <MessageCircle style={{ width: '14px', height: '14px' }} />
                                        <span style={{ fontSize: '11px' }}>{featured._count?.comments || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* PROJECT GRID */}
            <div style={{ padding: '0 20px 120px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {loading ? (
                    [...Array(4)].map((_, i) => <div key={i} style={{ height: '180px', borderRadius: '20px', background: '#161616' }} />)
                ) : (
                    regular.map((p, i) => (
                        <Link href={`/projects/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                            <div style={{ borderRadius: '20px', padding: '14px', height: '180px', display: 'flex', flexDirection: 'column', background: '#161616' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.category?.color ? `${p.category.color}20` : '#49df8020', marginBottom: '10px' }}>
                                    <Zap style={{ width: '18px', height: '18px', color: p.category?.color || '#49df80' }} />
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0' }}>{p.name}</h3>
                                {i === 0 && <span style={{ fontSize: '9px', fontWeight: 700, background: '#49df80', color: '#000', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginBottom: '6px' }}>Trending</span>}
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
                    ))
                )}
            </div>

            {/* BOTTOM NAV */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '12px 24px 32px 24px', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '360px', margin: '0 auto' }}>
                    <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                        <Home style={{ width: '24px', height: '24px', color: '#49df80', fill: '#49df80' }} />
                        <span style={{ fontSize: '10px', color: '#49df80' }}>Home</span>
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
                        <User style={{ width: '24px', height: '24px', color: '#666' }} />
                        <span style={{ fontSize: '10px', color: '#666' }}>Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
