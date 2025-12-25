'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Share2, ArrowUp, ExternalLink, Send, ThumbsUp, MessageCircle, Globe, Github, Home, Compass, Plus, Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { Project, Comment } from '@/types'

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (projectId) {
            fetchProject()
            fetchComments()
        }
    }, [projectId, user])

    async function fetchProject() {
        try {
            const p = new URLSearchParams()
            if (user?.id) p.set('userId', user.id)
            const res = await fetch(`/api/projects/${projectId}?${p}`)
            const data = await res.json()
            if (data.success) setProject(data.data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    async function fetchComments() {
        try {
            const res = await fetch(`/api/projects/${projectId}/comments`)
            const data = await res.json()
            if (data.success) setComments(data.data)
        } catch (e) { console.error(e) }
    }

    async function handleUpvote() {
        if (!user || !project) return
        await fetch(`/api/projects/${projectId}/upvote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
        })
        fetchProject()
    }

    async function handleSubmitComment() {
        if (!user || !newComment.trim()) return
        setSubmitting(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment.trim(), userId: user.id }),
            })
            if (res.ok) { setNewComment(''); fetchComments() }
        } catch (e) { console.error(e) }
        finally { setSubmitting(false) }
    }

    const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : n.toString()
    const timeAgo = (date: string | Date) => {
        const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
        if (mins < 60) return `${mins}m ago`
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
        return `${Math.floor(mins / 1440)}d ago`
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid #49df80', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        )
    }

    if (!project) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px' }}>
                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Project Not Found</h1>
                <p style={{ color: '#888', marginBottom: '24px' }}>This project doesn't exist or has been removed.</p>
                <Link href="/" style={{ padding: '12px 24px', borderRadius: '12px', background: '#49df80', color: '#000', fontWeight: 600, textDecoration: 'none' }}>Go Home</Link>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => router.back()} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                    <ArrowLeft style={{ width: '20px', height: '20px' }} />
                </button>
                <button style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                    <Share2 style={{ width: '20px', height: '20px' }} />
                </button>
            </div>

            {/* Cover Image */}
            <div style={{ width: '100%', height: '280px', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: project.coverImage ? `url(${project.coverImage})` : 'linear-gradient(135deg, #1a3a2a, #0d1f17)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, #0a0a0a 100%)' }} />
            </div>

            {/* Content */}
            <div style={{ padding: '0 20px', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
                {/* Title & Category */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {project.category && (
                            <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#49df8020', color: '#49df80', fontSize: '12px', fontWeight: 600 }}>{project.category.name}</span>
                        )}
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>{project.name}</h1>
                    <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.6 }}>{project.tagline}</p>
                </div>

                {/* Creator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
                        <div>
                            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{project.creator?.displayName || project.creator?.username || 'Anonymous'}</p>
                            <p style={{ color: '#666', fontSize: '12px' }}>@{project.creator?.username || 'user'}</p>
                        </div>
                    </div>
                    <span style={{ color: '#666', fontSize: '12px' }}>{timeAgo(project.createdAt)}</span>
                </div>

                {/* About */}
                <div style={{ padding: '20px', borderRadius: '16px', background: '#161616', marginBottom: '16px' }}>
                    <h3 style={{ color: '#888', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>About</h3>
                    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{project.description || project.tagline}</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {project.websiteUrl && (
                            <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#49df80', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                                <Globe style={{ width: '14px', height: '14px' }} /> Website
                            </a>
                        )}
                        {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                                <Github style={{ width: '14px', height: '14px' }} /> GitHub
                            </a>
                        )}
                    </div>
                </div>

                {/* Upvote Button */}
                <button onClick={handleUpvote} disabled={!user} style={{ width: '100%', padding: '20px', borderRadius: '16px', background: project.hasUpvoted ? '#49df8030' : '#161616', border: project.hasUpvoted ? '2px solid #49df80' : '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: user ? 'pointer' : 'not-allowed', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: project.hasUpvoted ? '#49df80' : '#49df8020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUp style={{ width: '24px', height: '24px', color: project.hasUpvoted ? '#000' : '#49df80' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ color: project.hasUpvoted ? '#49df80' : '#fff', fontSize: '16px', fontWeight: 700 }}>{project.hasUpvoted ? 'Upvoted!' : 'Upvote'}</p>
                            <p style={{ color: '#888', fontSize: '12px' }}>{project.hasUpvoted ? 'Thanks for your support' : 'Show your support'}</p>
                        </div>
                    </div>
                    <span style={{ color: '#49df80', fontSize: '28px', fontWeight: 700 }}>{fmt(project.upvoteCount)}</span>
                </button>

                {/* Comments */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>Comments <span style={{ color: '#888', fontWeight: 400 }}>({comments.length})</span></h3>
                    </div>

                    {/* Comment Input */}
                    {user && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7b54, #ffb347)', flexShrink: 0 }} />
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                                    placeholder="Add a comment..."
                                    style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: '24px', background: '#161616', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none' }}
                                />
                                <button onClick={handleSubmitComment} disabled={!newComment.trim() || submitting} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: '#49df80', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: newComment.trim() ? 1 : 0.5 }}>
                                    <Send style={{ width: '14px', height: '14px', color: '#000' }} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {comments.map((c) => (
                            <div key={c.id} style={{ padding: '16px', borderRadius: '16px', background: '#161616' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{c.user?.displayName || c.user?.username}</span>
                                            <span style={{ color: '#666', fontSize: '11px' }}>{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.5 }}>{c.content}</p>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                                            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <ThumbsUp style={{ width: '12px', height: '12px' }} /> {c.likeCount || 0}
                                            </button>
                                            <button style={{ color: '#888', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>Reply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </div>
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
                    <Link href="/create" style={{ position: 'relative', top: '-20px', textDecoration: 'none' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#49df80', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(73,223,128,0.4)' }}>
                            <Plus style={{ width: '28px', height: '28px', color: '#000', strokeWidth: 2.5 }} />
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
