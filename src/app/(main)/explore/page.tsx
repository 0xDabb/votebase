'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Flame, ChevronRight, ArrowUp, Home, Compass, Plus, Bell, User, Server, Bot, Zap, Bitcoin, Smartphone, Palette } from 'lucide-react'
import type { Project, Category } from '@/types'

export default function ExplorePage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            const catRes = await fetch('/api/categories')
            const catData = await catRes.json()
            if (catData.success) {
                setCategories(catData.data)
            }

            const projRes = await fetch('/api/projects?sortBy=upvotes&pageSize=10')
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

    const formatCount = (count: number) => {
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        }
        return count.toString()
    }

    const getCategoryIcon = (name: string) => {
        const icons: Record<string, React.ReactNode> = {
            'SaaS': <Server className="w-7 h-7" style={{ color: '#49df80' }} />,
            'AI Tools': <Bot className="w-7 h-7" style={{ color: '#49df80' }} />,
            'Productivity': <Zap className="w-7 h-7" style={{ color: '#49df80' }} />,
            'Crypto': <Bitcoin className="w-7 h-7" style={{ color: '#49df80' }} />,
            'Mobile': <Smartphone className="w-7 h-7" style={{ color: '#49df80' }} />,
            'Design': <Palette className="w-7 h-7" style={{ color: '#49df80' }} />,
        }
        return icons[name] || <Zap className="w-7 h-7" style={{ color: '#49df80' }} />
    }

    const categoryImages: Record<string, string> = {
        'SaaS': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
        'AI Tools': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop',
        'Productivity': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop',
        'Crypto': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop',
        'Mobile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop',
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: '#0F0F0F' }}>
            {/* Header */}
            <header
                className="sticky top-0 z-40 w-full pt-6 pb-4 px-4"
                style={{
                    background: 'rgba(15, 15, 15, 0.9)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
            >
                <h1 className="text-3xl font-bold tracking-tight mb-4 text-white">Explore</h1>
                <div className="relative flex w-full items-center">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-5 h-5" style={{ color: '#49df80' }} />
                    </div>
                    <input
                        className="block w-full p-4 pl-12 text-sm text-white rounded-xl outline-none"
                        style={{ background: '#1A1A1A', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                        placeholder="Search projects, tags, or makers..."
                        type="text"
                    />
                </div>
            </header>

            {/* Categories Bento Grid */}
            <section className="mt-6 px-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Categories</h2>
                    <button style={{ color: '#49df80' }} className="text-sm font-medium">See All</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {categories.slice(0, 5).map((cat, index) => (
                        <Link
                            href={`/?category=${cat.id}`}
                            key={cat.id}
                            className={`group relative overflow-hidden rounded-2xl flex flex-col justify-end p-4 ${index === 2 ? 'col-span-2 h-28' : 'aspect-square'
                                }`}
                            style={{ background: '#1A1A1A', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity"
                                style={{ backgroundImage: `url('${categoryImages[cat.name] || 'https://picsum.photos/400/400'}')` }}
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3), transparent)' }} />
                            <div className="relative z-10">
                                {index !== 2 && getCategoryIcon(cat.name)}
                                <div className={index === 2 ? 'flex items-center justify-between w-full' : 'mt-2'}>
                                    <div>
                                        <p className="font-bold text-lg text-white">{cat.name}</p>
                                        {index === 2 && (
                                            <p className="text-xs mt-1" style={{ color: '#A0A0A0' }}>{cat._count?.projects || 0}+ Projects</p>
                                        )}
                                    </div>
                                    {index === 2 && getCategoryIcon(cat.name)}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trending Projects */}
            <section className="mt-8">
                <div className="flex justify-between items-center mb-4 px-4">
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5" style={{ color: '#49df80' }} />
                        <h2 className="text-xl font-bold text-white">Trending Now</h2>
                    </div>
                    <button style={{ color: '#49df80' }}>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex overflow-x-auto pb-4 pl-4 gap-4" style={{ scrollbarWidth: 'none' }}>
                    {projects.slice(0, 4).map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id} className="flex-none w-[260px]">
                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{ background: '#1A1A1A', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                            >
                                <div
                                    className="h-32 w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url('${project.coverImage || 'https://picsum.photos/400/300'}')` }}
                                />
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-base text-white">{project.name}</h3>
                                        <div
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg"
                                            style={{ background: 'rgba(73, 223, 128, 0.1)' }}
                                        >
                                            <ArrowUp className="w-3 h-3" style={{ color: '#49df80' }} />
                                            <span className="text-xs font-bold" style={{ color: '#49df80' }}>{formatCount(project.upvoteCount)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm line-clamp-2" style={{ color: '#A0A0A0' }}>{project.tagline}</p>
                                    <div className="mt-3">
                                        <span
                                            className="text-[10px] font-medium px-2 py-1 rounded-md"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                                        >
                                            {project.category?.name || 'Project'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <div className="w-4 shrink-0" />
                </div>
            </section>

            {/* New Arrivals */}
            <section className="mt-6 px-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">New Arrivals</h2>
                    <button style={{ color: '#49df80' }} className="text-sm font-medium">View All</button>
                </div>
                <div className="flex flex-col gap-3">
                    {projects.slice(0, 3).map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <div
                                className="p-3 rounded-2xl flex gap-4 items-center"
                                style={{ background: '#1A1A1A', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                            >
                                <div
                                    className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center"
                                    style={{ backgroundImage: `url('${project.coverImage || 'https://picsum.photos/100/100'}')` }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-white truncate">{project.name}</h3>
                                    <p className="text-xs mt-0.5" style={{ color: '#A0A0A0' }}>by {project.creator?.displayName || project.creator?.username}</p>
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block"
                                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                                    >
                                        {project.category?.name || 'Project'}
                                    </span>
                                </div>
                                <div
                                    className="flex flex-col items-center gap-1 p-2 rounded-xl min-w-[50px]"
                                    style={{ background: '#0F0F0F' }}
                                >
                                    <ArrowUp className="w-4 h-4" style={{ color: '#A0A0A0' }} />
                                    <span className="text-xs font-bold text-white">{formatCount(project.upvoteCount)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Bottom Navigation */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 pb-6 pt-3"
                style={{
                    background: 'rgba(15, 15, 15, 0.9)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}
            >
                <div className="flex justify-around items-center px-4">
                    <Link href="/" className="flex flex-col items-center gap-1" style={{ color: '#A0A0A0' }}>
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>
                    <Link href="/explore" className="flex flex-col items-center gap-1" style={{ color: '#49df80' }}>
                        <Compass className="w-6 h-6" fill="currentColor" />
                        <span className="text-[10px] font-medium">Explore</span>
                    </Link>
                    <Link href="/create" className="relative -top-5">
                        <button
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background: '#49df80', boxShadow: '0 0 15px rgba(73, 223, 128, 0.3)' }}
                        >
                            <Plus className="w-7 h-7 text-black" strokeWidth={2.5} />
                        </button>
                    </Link>
                    <Link href="/notifications" className="flex flex-col items-center gap-1 relative" style={{ color: '#A0A0A0' }}>
                        <div className="relative">
                            <Bell className="w-6 h-6" />
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
                        </div>
                        <span className="text-[10px] font-medium">Alerts</span>
                    </Link>
                    <Link href="/profile" className="flex flex-col items-center gap-1" style={{ color: '#A0A0A0' }}>
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
