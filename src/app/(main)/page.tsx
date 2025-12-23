'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, ArrowUp, MessageCircle, Bookmark } from 'lucide-react'
import type { Project, Category } from '@/types'

export default function HomePage() {
    const { user, loading: authLoading } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [selectedCategory, user])

    async function fetchData() {
        setLoading(true)
        try {
            // Fetch categories
            const catRes = await fetch('/api/categories')
            const catData = await catRes.json()
            if (catData.success) {
                setCategories(catData.data)
            }

            // Fetch projects sorted by upvotes
            const params = new URLSearchParams({
                sortBy: 'upvotes',
                pageSize: '20',
            })
            if (selectedCategory) {
                params.set('categoryId', selectedCategory)
            }
            if (user?.id) {
                params.set('userId', user.id)
            }

            const projRes = await fetch(`/api/projects?${params}`)
            const projData = await projRes.json()
            if (projData.success) {
                setProjects(projData.data)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpvote(projectId: string) {
        if (!user) return

        try {
            const res = await fetch(`/api/projects/${projectId}/upvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })

            if (res.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    // Separate featured projects
    const featuredProject = projects.find(p => p.featured)
    const regularProjects = projects.filter(p => !p.featured)

    // Format upvote count
    const formatCount = (count: number) => {
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        }
        return count.toString()
    }

    return (
        <>
            <Header onSearch={(query) => console.log('Search:', query)} />

            <main className="px-3 space-y-4 pb-6">
                {/* Category Filter Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3 scroll-smooth">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`flex h-8 shrink-0 items-center px-4 rounded-full font-semibold text-xs transition-all active:scale-95 ${!selectedCategory
                                ? 'bg-[#49df80] text-black'
                                : 'bg-[#1A1A1A] border border-white/[0.08] text-[#A0A0A0] hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        className="flex h-8 shrink-0 items-center px-4 rounded-full bg-[#1A1A1A] border border-white/[0.08] text-[#A0A0A0] font-medium text-xs hover:text-white transition-colors active:scale-95"
                    >
                        <TrendingUp className="w-4 h-4 text-yellow-400 mr-1" />
                        Trending
                    </button>
                    {categories.slice(0, 4).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex h-8 shrink-0 items-center px-4 rounded-full font-medium text-xs transition-all active:scale-95 ${selectedCategory === cat.id
                                    ? 'bg-[#49df80] text-black'
                                    : 'bg-[#1A1A1A] border border-white/[0.08] text-[#A0A0A0] hover:text-white'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Featured Project - Full Width */}
                    {featuredProject && (
                        <Link href={`/projects/${featuredProject.id}`} className="col-span-2">
                            <article className="bg-[#1A1A1A] rounded-xl border border-white/[0.08] overflow-hidden shadow-lg group relative flex flex-row h-32">
                                {/* Featured Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-sm">
                                        Featured
                                    </span>
                                </div>
                                {/* Image */}
                                <div
                                    className="w-1/3 bg-cover bg-center relative h-full"
                                    style={{ backgroundImage: `url('${featuredProject.coverImage || 'https://picsum.photos/200/300'}')` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1A1A1A]/80" />
                                </div>
                                {/* Content */}
                                <div className="w-2/3 p-3 flex flex-col justify-between z-10">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h2 className="text-base font-bold text-white leading-tight">{featuredProject.name}</h2>
                                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-white/10">
                                                <ArrowUp className="w-3 h-3 text-[#49df80]" />
                                                <span className="text-[10px] font-bold text-[#49df80]">{formatCount(featuredProject.upvoteCount)}</span>
                                            </div>
                                        </div>
                                        <p className="text-[#A0A0A0] text-xs line-clamp-2 leading-snug">{featuredProject.tagline}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            {featuredProject.creator?.avatarUrl && (
                                                <Image
                                                    src={featuredProject.creator.avatarUrl}
                                                    alt={featuredProject.creator.displayName || ''}
                                                    width={16}
                                                    height={16}
                                                    className="rounded-full"
                                                />
                                            )}
                                            <span className="text-[10px] text-[#A0A0A0]">by {featuredProject.creator?.displayName || featuredProject.creator?.username}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="flex items-center gap-0.5 text-[#A0A0A0] hover:text-white transition-colors">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-medium">{featuredProject._count?.comments || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    )}

                    {/* Regular Projects */}
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#1A1A1A] rounded-xl h-40 animate-pulse" />
                        ))
                    ) : (
                        regularProjects.map((project, index) => (
                            <Link href={`/projects/${project.id}`} key={project.id}>
                                <article className="bg-[#1A1A1A] rounded-xl border border-white/[0.08] overflow-hidden shadow-lg p-3 flex flex-col gap-2 h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: `${project.category?.color || '#49df80'}20` }}
                                            >
                                                <span className="text-lg">{project.category?.icon || '🚀'}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm truncate max-w-[100px]">{project.name}</h3>
                                                <span
                                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium border"
                                                    style={{
                                                        backgroundColor: `${project.category?.color || '#49df80'}10`,
                                                        color: project.category?.color || '#49df80',
                                                        borderColor: `${project.category?.color || '#49df80'}20`
                                                    }}
                                                >
                                                    {project.category?.name || 'Project'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[#A0A0A0] text-[10px] line-clamp-2 leading-relaxed">{project.tagline}</p>
                                    <div className="mt-auto pt-1 flex items-center justify-between">
                                        <div className="flex items-center bg-black/30 rounded-full px-2 py-0.5 border border-white/5 gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleUpvote(project.id)
                                                }}
                                                className="text-[#A0A0A0] hover:text-[#49df80] transition-colors"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-[10px] font-bold text-white">{formatCount(project.upvoteCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 text-[#A0A0A0]">
                                            <MessageCircle className="w-3 h-3" />
                                            <span className="text-[10px]">{project._count?.comments || 0}</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[#A0A0A0] text-sm">No projects yet.</p>
                        {user && (
                            <Link
                                href="/create"
                                className="inline-block mt-4 px-6 py-2 rounded-full bg-[#49df80] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                            >
                                Create First Project
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </>
    )
}
