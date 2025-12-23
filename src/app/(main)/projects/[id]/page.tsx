'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Share2, MoreHorizontal, ArrowUp, ExternalLink, Send, ThumbsUp, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatNumber, formatTimeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
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
            const params = new URLSearchParams()
            if (user?.id) {
                params.set('userId', user.id)
            }

            const res = await fetch(`/api/projects/${projectId}?${params}`)
            const data = await res.json()

            if (data.success) {
                setProject(data.data)
            }
        } catch (error) {
            console.error('Error fetching project:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchComments() {
        try {
            const res = await fetch(`/api/projects/${projectId}/comments`)
            const data = await res.json()

            if (data.success) {
                setComments(data.data)
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
        }
    }

    async function handleUpvote() {
        if (!user || !project) return

        try {
            await fetch(`/api/projects/${projectId}/upvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })
            fetchProject()
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    async function handleSubmitComment() {
        if (!user || !newComment.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment.trim(),
                    userId: user.id,
                }),
            })

            if (res.ok) {
                setNewComment('')
                fetchComments()
            }
        } catch (error) {
            console.error('Error submitting comment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-[#44e47e] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
                <p className="text-[#A0A0A0] mb-6">This project doesn&apos;t exist or has been removed.</p>
                <Link
                    href="/"
                    className="px-6 py-2 rounded-full bg-[#44e47e] text-black font-semibold"
                >
                    Go Home
                </Link>
            </div>
        )
    }

    return (
        <div className="pb-6">
            {/* Floating Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-5 pt-14 pb-4 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="pointer-events-auto w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-3 pointer-events-auto">
                    <button className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Cover Image */}
            <div className="relative w-full h-[30vh]">
                {project.coverImage ? (
                    <Image
                        src={project.coverImage}
                        alt={project.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#262626]" />
                )}
                <div className="absolute inset-0 image-overlay-gradient" />

                {/* Tags */}
                <div className="absolute bottom-6 left-5 flex gap-2">
                    {project.featured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/10">
                            <span className="text-[#44e47e] mr-1">✨</span>
                            Featured
                        </span>
                    )}
                    {project.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/10">
                            {project.category.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 -mt-4 relative z-10 space-y-6">
                {/* Title & Creator */}
                <div>
                    <h1 className="text-4xl font-bold leading-tight mb-3 text-white">{project.name}</h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {project.creator?.avatarUrl && (
                                <Image
                                    src={project.creator.avatarUrl}
                                    alt={project.creator.displayName || project.creator.username}
                                    width={40}
                                    height={40}
                                    className="rounded-full border border-white/10"
                                />
                            )}
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {project.creator?.displayName || project.creator?.username}
                                </p>
                                <p className="text-xs text-[#A0A0A0]">@{project.creator?.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#A0A0A0]">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">{formatTimeAgo(project.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* About Card */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/[0.08] p-5 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide opacity-80">
                        About this project
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        {project.description || project.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {project.websiteUrl && (
                            <a
                                href={project.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#44e47e] hover:text-white transition-colors"
                            >
                                Visit Website <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        {project.githubUrl && (
                            <>
                                <span className="text-white/20">•</span>
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[#A0A0A0] hover:text-white transition-colors"
                                >
                                    View on GitHub
                                </a>
                            </>
                        )}
                    </div>
                </div>

                {/* Upvote Button */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">Project Support</h3>
                    <button
                        onClick={handleUpvote}
                        disabled={!user}
                        className={cn(
                            "w-full relative group rounded-3xl p-6 flex items-center justify-between gap-4 transition-all duration-300 active:scale-[0.98] overflow-hidden",
                            project.hasUpvoted
                                ? "bg-[#44e47e]/20 border-2 border-[#44e47e]"
                                : "bg-[#1A1A1A] border border-white/[0.08] hover:border-[#4ADE80]/50"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#4ADE80]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-4 z-10">
                            <div className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300",
                                project.hasUpvoted
                                    ? "bg-[#44e47e] text-black"
                                    : "bg-[#4ADE80]/10 text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-black"
                            )}>
                                <ArrowUp className="w-8 h-8" strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <span className={cn(
                                    "block text-xl font-bold transition-colors",
                                    project.hasUpvoted ? "text-[#44e47e]" : "text-white group-hover:text-[#4ADE80]"
                                )}>
                                    {project.hasUpvoted ? 'Upvoted!' : 'Upvote Project'}
                                </span>
                                <span className="text-xs font-medium text-[#A0A0A0]">
                                    {project.hasUpvoted ? 'Thanks for your support' : 'Show your support'}
                                </span>
                            </div>
                        </div>

                        <div className="text-right z-10 pr-2">
                            <span className="block text-3xl font-bold text-[#4ADE80]">
                                {formatNumber(project.upvoteCount)}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Comments Section */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">
                            Discussion <span className="text-[#A0A0A0] text-sm font-normal ml-1">({project._count?.comments || 0})</span>
                        </h3>
                        <button className="text-[#44e47e] text-xs font-bold hover:underline">View All</button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="glass-panel rounded-xl p-3 flex gap-3">
                                {comment.user?.avatarUrl && (
                                    <Image
                                        src={comment.user.avatarUrl}
                                        alt={comment.user.displayName || comment.user.username}
                                        width={32}
                                        height={32}
                                        className="rounded-full border border-white/10 shrink-0"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-bold text-white">
                                            {comment.user?.displayName || comment.user?.username}
                                        </span>
                                        <span className="text-[10px] text-[#A0A0A0]">
                                            {formatTimeAgo(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-1 leading-snug">{comment.content}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button className="flex items-center gap-1 text-[#A0A0A0] text-[10px] hover:text-white">
                                            <ThumbsUp className="w-3 h-3" /> {comment.likeCount || 0}
                                        </button>
                                        <button className="text-[#A0A0A0] text-[10px] hover:text-white">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comment Input */}
                    {user && (
                        <div className="mt-4 flex gap-3 items-center">
                            {user.avatarUrl && (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    width={32}
                                    height={32}
                                    className="rounded-full border border-white/10"
                                />
                            )}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                                    placeholder="Add a comment..."
                                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-full py-2.5 px-4 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none transition-all"
                                />
                                <button
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim() || submitting}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#44e47e] text-black hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
