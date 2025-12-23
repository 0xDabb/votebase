'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, TrendingUp, ChevronRight } from 'lucide-react'
import { ProjectCard, CategoryCard } from '@/components'
import { useAuth } from '@/contexts/AuthContext'
import type { Project, Category } from '@/types'

function ExploreContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const initialCategory = searchParams.get('category')

    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Set initial category from URL
        if (initialCategory) {
            // Find category by slug
            const cat = categories.find(c => c.slug === initialCategory)
            if (cat) {
                setSelectedCategory(cat.id)
            }
        }
    }, [initialCategory, categories])

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchProjects()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, searchQuery, user])

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories')
            const data = await res.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    async function fetchProjects() {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                sortBy: 'upvotes',
                pageSize: '50',
            })

            if (selectedCategory) {
                params.set('categoryId', selectedCategory)
            }
            if (searchQuery) {
                params.set('search', searchQuery)
            }
            if (user?.id) {
                params.set('userId', user.id)
            }

            const res = await fetch(`/api/projects?${params}`)
            const data = await res.json()
            if (data.success) {
                setProjects(data.data)
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpvote(projectId: string) {
        if (!user) return

        try {
            await fetch(`/api/projects/${projectId}/upvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })
            fetchProjects()
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    // Get trending projects (high upvotes from last 24h - simplified: just top 3)
    const trendingProjects = [...projects]
        .sort((a, b) => b.upvoteCount - a.upvoteCount)
        .slice(0, 3)

    // New arrivals (most recent)
    const newArrivals = [...projects]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

    return (
        <>
            {/* Sticky Header with Search */}
            <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0F0F0F]/80 border-b border-white/5 pt-12 pb-2 px-4">
                <h1 className="text-3xl font-bold tracking-tight mb-3 pl-1 text-white">Explore</h1>
                <div className="relative flex w-full items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#44e47e]">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full p-4 pl-12 text-sm text-white bg-[#1A1A1A] border border-white/5 rounded-xl focus:ring-2 focus:ring-[#44e47e] focus:border-transparent placeholder-[#A0A0A0]/70 transition-shadow outline-none"
                        placeholder="Search projects, tags, or makers..."
                    />
                </div>
            </header>

            <main className="px-4 pb-6 space-y-8">
                {/* Categories Bento Grid */}
                <section className="mt-6">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="text-xl font-bold text-white">Categories</h2>
                        <button className="text-sm font-medium text-[#44e47e] hover:opacity-80">
                            See All
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.slice(0, 2).map((category) => (
                            <CategoryCard key={category.id} category={category} variant="square" />
                        ))}
                        {categories[2] && (
                            <CategoryCard category={categories[2]} variant="wide" />
                        )}
                        {categories.slice(3, 5).map((category) => (
                            <CategoryCard key={category.id} category={category} variant="square" />
                        ))}
                    </div>
                </section>

                {/* Trending Now (Horizontal Scroll) */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#44e47e]" />
                            <h2 className="text-xl font-bold text-white">Trending Now</h2>
                        </div>
                        <button className="text-[#44e47e] hover:opacity-80 p-1">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 space-x-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="flex-none w-[280px] h-[220px] bg-[#1A1A1A] rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            trendingProjects.map((project) => (
                                <div key={project.id} className="flex-none w-[280px]">
                                    <ProjectCard
                                        project={project}
                                        variant="compact"
                                        onUpvote={() => handleUpvote(project.id)}
                                    />
                                </div>
                            ))
                        )}
                        <div className="w-2" /> {/* Spacer */}
                    </div>
                </section>

                {/* New Arrivals (Vertical List) */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">New Arrivals</h2>
                        <button className="text-sm font-medium text-[#44e47e] hover:opacity-80">
                            View All
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 bg-[#1A1A1A] rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            newArrivals.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    variant="list"
                                    onUpvote={() => handleUpvote(project.id)}
                                />
                            ))
                        )}
                    </div>
                </section>
            </main>
        </>
    )
}

export default function ExplorePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#44e47e]"></div>
            </div>
        }>
            <ExploreContent />
        </Suspense>
    )
}
