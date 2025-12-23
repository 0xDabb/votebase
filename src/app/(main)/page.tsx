'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header, ProjectCard, CategoryChips } from '@/components'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, ChevronRight, Sparkles } from 'lucide-react'
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
                // Refresh projects after vote
                fetchData()
            }
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    async function handleSave(projectId: string) {
        if (!user) return

        try {
            const res = await fetch(`/api/projects/${projectId}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })

            if (res.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Error saving:', error)
        }
    }

    // Separate featured projects
    const featuredProjects = projects.filter(p => p.featured)
    const regularProjects = projects.filter(p => !p.featured)

    return (
        <>
            <Header onSearch={(query) => console.log('Search:', query)} />

            <main className="pt-32 px-3 space-y-6 pb-6">
                {/* Category Filter */}
                <CategoryChips
                    categories={categories}
                    selectedId={selectedCategory || undefined}
                    onChange={setSelectedCategory}
                />

                {/* Featured Section */}
                {featuredProjects.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Sparkles className="w-5 h-5 text-[#44e47e]" />
                            <h2 className="text-lg font-bold text-white">Featured</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {featuredProjects.slice(0, 1).map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    variant="featured"
                                    onUpvote={() => handleUpvote(project.id)}
                                    onSave={() => handleSave(project.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Section */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            <h2 className="text-lg font-bold text-white">Top Projects</h2>
                        </div>
                        <Link href="/explore?sort=trending" className="text-[#44e47e] hover:opacity-80">
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-2xl bg-[#1A1A1A] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {regularProjects.slice(0, 2).map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    variant="compact"
                                    onUpvote={() => handleUpvote(project.id)}
                                    onSave={() => handleSave(project.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Main Projects Grid - Sorted by Upvotes */}
                <section>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="text-lg font-bold text-white">All Projects</h2>
                        <Link href="/explore" className="text-sm font-medium text-[#44e47e] hover:opacity-80">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-[#1A1A1A] animate-pulse" />
                            ))}
                        </div>
                    ) : regularProjects.length > 0 ? (
                        <div className="space-y-3">
                            {regularProjects.slice(2).map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    variant="list"
                                    onUpvote={() => handleUpvote(project.id)}
                                    onSave={() => handleSave(project.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-[#A0A0A0] text-sm">No projects yet.</p>
                            {user && (
                                <Link
                                    href="/create"
                                    className="inline-block mt-4 px-6 py-2 rounded-full bg-[#44e47e] text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                                >
                                    Create First Project
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </>
    )
}
