'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, ArrowLeft, LogOut } from 'lucide-react'

interface Project {
    id: string
    name: string
    tagline: string
    description?: string
    logoImage?: string
    coverImage?: string
    websiteUrl?: string
    githubUrl?: string
    socialLinks?: {
        twitter?: string
        discord?: string
        telegram?: string
        farcaster?: string
    }
    featured: boolean
    status: string
    upvoteCount: number
    category?: { name: string }
    creator?: { username: string }
    createdAt: string
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Simple password check (in production, use proper auth)
    const ADMIN_PASSWORD = 'bote2024'

    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth')
        if (auth === 'true') {
            setIsAuthenticated(true)
            fetchProjects()
        }
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true')
            setIsAuthenticated(true)
            setError('')
            fetchProjects()
        } else {
            setError('Yanlış şifre!')
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem('admin_auth')
        setIsAuthenticated(false)
    }

    async function fetchProjects() {
        setLoading(true)
        try {
            const res = await fetch('/api/projects?pageSize=100')
            const data = await res.json()
            if (data.success) {
                setProjects(data.data)
            }
        } catch (err) {
            console.error('Error fetching projects:', err)
        } finally {
            setLoading(false)
        }
    }

    async function deleteProject(id: string) {
        if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchProjects()
            }
        } catch (err) {
            console.error('Error deleting project:', err)
        }
    }

    async function toggleFeatured(id: string, currentValue: boolean) {
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !currentValue })
            })
            if (res.ok) {
                fetchProjects()
            }
        } catch (err) {
            console.error('Error updating project:', err)
        }
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F0F0F' }}>
                <div
                    className="w-full max-w-md p-8 rounded-2xl"
                    style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Panel</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-xl text-white outline-none"
                                style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)' }}
                                placeholder="Admin şifresini girin..."
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-semibold text-black transition-opacity hover:opacity-90"
                            style={{ background: '#49df80' }}
                        >
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#0F0F0F' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-white/60 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/projects/new"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-black"
                            style={{ background: '#49df80' }}
                        >
                            <Plus className="w-5 h-5" />
                            Yeni Proje
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl text-white/60 hover:text-white transition-colors"
                            style={{ background: '#1A1A1A' }}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-white/60 text-sm">Toplam Proje</p>
                        <p className="text-2xl font-bold text-white">{projects.length}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-white/60 text-sm">Öne Çıkan</p>
                        <p className="text-2xl font-bold" style={{ color: '#49df80' }}>
                            {projects.filter(p => p.featured).length}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-white/60 text-sm">Aktif</p>
                        <p className="text-2xl font-bold text-white">
                            {projects.filter(p => p.status === 'ACTIVE').length}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-white/60 text-sm">Toplam Upvote</p>
                        <p className="text-2xl font-bold text-white">
                            {projects.reduce((sum, p) => sum + p.upvoteCount, 0)}
                        </p>
                    </div>
                </div>

                {/* Projects Table */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <h2 className="text-lg font-bold text-white">Projeler</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-white/60">Yükleniyor...</div>
                    ) : projects.length === 0 ? (
                        <div className="p-8 text-center text-white/60">Henüz proje yok.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <th className="text-left p-4 text-white/60 text-sm font-medium">Proje</th>
                                        <th className="text-left p-4 text-white/60 text-sm font-medium">Kategori</th>
                                        <th className="text-left p-4 text-white/60 text-sm font-medium">Upvotes</th>
                                        <th className="text-left p-4 text-white/60 text-sm font-medium">Öne Çıkan</th>
                                        <th className="text-left p-4 text-white/60 text-sm font-medium">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="border-t"
                                            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {project.logoImage ? (
                                                        <img
                                                            src={project.logoImage}
                                                            alt={project.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: '#0F0F0F' }}>
                                                            {project.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-white">{project.name}</p>
                                                        <p className="text-sm text-white/40 truncate max-w-[200px]">{project.tagline}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-white/60">{project.category?.name || '-'}</td>
                                            <td className="p-4 text-white">{project.upvoteCount}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleFeatured(project.id, project.featured)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${project.featured
                                                            ? 'bg-blue-500/20 text-blue-400'
                                                            : 'bg-white/5 text-white/40'
                                                        }`}
                                                >
                                                    {project.featured ? 'Evet' : 'Hayır'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/projects/${project.id}`}
                                                        className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/projects/${project.id}/edit`}
                                                        className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteProject(project.id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
