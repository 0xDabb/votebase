'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Share2, Settings } from 'lucide-react'
import { ProjectCard } from '@/components'
import { useAuth } from '@/contexts/AuthContext'
import { formatNumber } from '@/lib/utils'
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
            // Fetch user profile with stats
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

            // Fetch tab-specific data
            if (activeTab === 'upvoted') {
                const params = new URLSearchParams({ userId: user.id })
                const res = await fetch(`/api/projects?${params}`)
                const data = await res.json()
                if (data.success) {
                    // Filter to only upvoted
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

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-[#44e47e] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                    <span className="text-4xl">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
                <p className="text-[#A0A0A0] mb-6">
                    Connect with Farcaster to view your profile
                </p>
                <p className="text-xs text-[#A0A0A0]">
                    Open this app in Warpcast to sign in automatically
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Top App Bar */}
            <header className="sticky top-0 z-40 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3 pt-12">
                    <h2 className="text-white text-lg font-bold tracking-tight">Profile</h2>
                    <div className="flex gap-4">
                        <button className="flex items-center justify-center text-white hover:text-[#44e47e] transition-colors">
                            <Share2 className="w-6 h-6" />
                        </button>
                        <button className="flex items-center justify-center text-white hover:text-[#44e47e] transition-colors">
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Profile Info */}
            <section className="flex flex-col items-center px-4 pt-6 pb-2">
                <div className="relative mb-4">
                    {/* Avatar Ring */}
                    <div className="p-1 rounded-full bg-gradient-to-tr from-[#44e47e] to-transparent">
                        <div className="relative h-28 w-28 rounded-full border-4 border-[#0F0F0F] overflow-hidden">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.displayName || user.username}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                                    <span className="text-4xl font-bold text-[#A0A0A0]">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Online Indicator */}
                    <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-[#44e47e] border-4 border-[#0F0F0F]" />
                </div>

                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {user.displayName || user.username}
                    </h1>
                    <p className="text-[#44e47e] font-medium">@{user.username}</p>
                </div>
            </section>

            {/* Stats Row */}
            <section className="px-4 py-6 w-full">
                <div className="flex w-full gap-3 justify-between">
                    <div className="flex flex-1 flex-col gap-1 rounded-2xl bg-[#1A1A1A] p-4 items-center text-center border border-white/5 shadow-lg">
                        <p className="text-white text-xl font-bold">{stats.projectCount}</p>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Projects</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 rounded-2xl bg-[#1A1A1A] p-4 items-center text-center border border-white/5 shadow-lg">
                        <p className="text-white text-xl font-bold">{formatNumber(stats.totalUpvotes)}</p>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Upvotes</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 rounded-2xl bg-[#1A1A1A] p-4 items-center text-center border border-white/5 shadow-lg">
                        <p className="text-white text-xl font-bold">{stats.savedCount}</p>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Saved</p>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="px-4 pb-6 sticky top-[60px] z-30 bg-[#0F0F0F] pt-2">
                <div className="flex h-12 w-full items-center rounded-full bg-[#1A1A1A] p-1 border border-white/5">
                    {(['projects', 'upvoted', 'saved'] as ProfileTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 h-full rounded-full font-semibold text-sm transition-all duration-200 ${activeTab === tab
                                    ? 'bg-[#44e47e] text-black'
                                    : 'text-gray-400'
                                }`}
                        >
                            {tab === 'projects' ? 'My Projects' : tab === 'upvoted' ? 'Upvoted' : 'Saved'}
                        </button>
                    ))}
                </div>
            </section>

            {/* Projects Grid */}
            <section className="px-4 pb-6">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-2xl bg-[#1A1A1A] animate-pulse" />
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className={index === 2 ? 'col-span-2' : ''}
                            >
                                <ProjectCard
                                    project={project}
                                    variant={index === 2 ? 'featured' : 'default'}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-[#A0A0A0]">
                            {activeTab === 'projects'
                                ? "You haven't created any projects yet"
                                : activeTab === 'upvoted'
                                    ? "You haven't upvoted any projects yet"
                                    : "You haven't saved any projects yet"
                            }
                        </p>
                        {activeTab === 'projects' && (
                            <Link
                                href="/create"
                                className="inline-block mt-4 px-6 py-2 rounded-full bg-[#44e47e] text-black font-semibold text-sm"
                            >
                                Create Project
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </>
    )
}
