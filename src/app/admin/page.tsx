'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, ArrowLeft, LogOut, FolderOpen, LayoutGrid } from 'lucide-react'

interface Project {
    id: string
    name: string
    tagline: string
    logoImage?: string
    featured: boolean
    status: string
    upvoteCount: number
    category?: { name: string }
    createdAt: string
}

interface Category {
    id: string
    name: string
    slug: string
    description?: string
    color?: string
    _count?: { projects: number }
}

interface Creator {
    id: string
    fid: number
    username: string
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
    upvoteCount: number
    createdAt: string
    _count: {
        projects: number
        comments: number
    }
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [creators, setCreators] = useState<Creator[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'projects' | 'categories' | 'creators'>('projects')

    // Category form
    const [showCategoryForm, setShowCategoryForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', color: '#49df80' })

    // Creator form
    const [showCreatorForm, setShowCreatorForm] = useState(false)
    const [editingCreator, setEditingCreator] = useState<Creator | null>(null)
    const [creatorForm, setCreatorForm] = useState({ fid: '', username: '', displayName: '', bio: '', avatarUrl: '' })

    const ADMIN_PASSWORD = 'bote2024'

    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth')
        if (auth === 'true') {
            setIsAuthenticated(true)
            fetchData()
        }
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true')
            setIsAuthenticated(true)
            setError('')
            fetchData()
        } else {
            setError('Yanlış şifre!')
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem('admin_auth')
        setIsAuthenticated(false)
    }

    async function fetchData() {
        setLoading(true)
        try {
            const [projRes, catRes, creatorRes] = await Promise.all([
                fetch('/api/projects?pageSize=100'),
                fetch('/api/admin/categories'),
                fetch('/api/admin/users')
            ])
            const [projData, catData, creatorData] = await Promise.all([
                projRes.json(),
                catRes.json(),
                creatorRes.json()
            ])
            if (projData.success) setProjects(projData.data)
            if (catData.success) setCategories(catData.data)
            if (creatorData.success) setCreators(creatorData.data)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function deleteProject(id: string) {
        if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return
        try {
            const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
            if (res.ok) fetchData()
        } catch (err) {
            console.error('Error:', err)
        }
    }

    async function toggleFeatured(id: string, currentValue: boolean) {
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !currentValue })
            })
            if (res.ok) fetchData()
        } catch (err) {
            console.error('Error:', err)
        }
    }

    // Category functions
    async function handleCategorySubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories'
            const method = editingCategory ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryForm)
            })

            if (res.ok) {
                fetchData()
                setShowCategoryForm(false)
                setEditingCategory(null)
                setCategoryForm({ name: '', slug: '', description: '', color: '#49df80' })
            }
        } catch (err) {
            console.error('Error:', err)
        }
    }

    async function deleteCategory(id: string) {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error)
                return
            }
            fetchData()
        } catch (err) {
            console.error('Error:', err)
        }
    }

    function editCategory(cat: Category) {
        setEditingCategory(cat)
        setCategoryForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            color: cat.color || '#49df80'
        })
        setShowCategoryForm(true)
    }

    // Creator functions
    async function handleCreatorSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const url = editingCreator
                ? `/api/admin/users/${editingCreator.id}`
                : '/api/admin/users'
            const method = editingCreator ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creatorForm)
            })

            if (res.ok) {
                fetchData()
                setShowCreatorForm(false)
                setEditingCreator(null)
                setCreatorForm({ fid: '', username: '', displayName: '', bio: '', avatarUrl: '' })
            }
        } catch (err) {
            console.error('Error:', err)
        }
    }

    async function deleteCreator(id: string) {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
            if (res.ok) fetchData()
        } catch (err) {
            console.error('Error:', err)
        }
    }

    function editCreator(creator: Creator) {
        setEditingCreator(creator)
        setCreatorForm({
            fid: creator.fid.toString(),
            username: creator.username,
            displayName: creator.displayName || '',
            bio: creator.bio || '',
            avatarUrl: creator.avatarUrl || ''
        })
        setShowCreatorForm(true)
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#0a0a0a' }}>
                <div style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '16px', background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '24px', textAlign: 'center' }}>Admin Panel</h1>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '8px' }}>Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                placeholder="Admin şifresini girin..."
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
                        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#49df80', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', padding: '24px', background: '#0a0a0a' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/" style={{ color: '#888' }}><ArrowLeft style={{ width: '24px', height: '24px' }} /></Link>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Admin Panel</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/admin/projects/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: '#49df80', color: '#000', fontWeight: 600, textDecoration: 'none' }}>
                            <Plus style={{ width: '20px', height: '20px' }} />
                            Yeni Proje
                        </Link>
                        <button onClick={handleLogout} style={{ padding: '10px', borderRadius: '12px', background: '#161616', color: '#888', border: 'none', cursor: 'pointer' }}>
                            <LogOut style={{ width: '20px', height: '20px' }} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setActiveTab('projects')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'projects' ? '#49df80' : '#161616', color: activeTab === 'projects' ? '#000' : '#888', fontWeight: 600 }}
                    >
                        <LayoutGrid style={{ width: '18px', height: '18px' }} />
                        Projeler ({projects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'categories' ? '#49df80' : '#161616', color: activeTab === 'categories' ? '#000' : '#888', fontWeight: 600 }}
                    >
                        <FolderOpen style={{ width: '18px', height: '18px' }} />
                        Kategoriler ({categories.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('creators')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'creators' ? '#49df80' : '#161616', color: activeTab === 'creators' ? '#000' : '#888', fontWeight: 600 }}
                    >
                        <Plus style={{ width: '18px', height: '18px' }} />
                        Creators ({creators.length})
                    </button>
                </div>

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Projeler</h2>
                        </div>
                        {loading ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Yükleniyor...</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', color: '#888', fontSize: '13px', fontWeight: 500 }}>Proje</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', color: '#888', fontSize: '13px', fontWeight: 500 }}>Kategori</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', color: '#888', fontSize: '13px', fontWeight: 500 }}>Upvotes</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', color: '#888', fontSize: '13px', fontWeight: 500 }}>Öne Çıkan</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', color: '#888', fontSize: '13px', fontWeight: 500 }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.map((p) => (
                                            <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                            {p.logoImage ? <img src={p.logoImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : p.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p style={{ color: '#fff', fontWeight: 500 }}>{p.name}</p>
                                                            <p style={{ color: '#666', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#888' }}>{p.category?.name || '-'}</td>
                                                <td style={{ padding: '12px 16px', color: '#fff' }}>{p.upvoteCount}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <button onClick={() => toggleFeatured(p.id, p.featured)} style={{ padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: p.featured ? '#49df8020' : '#ffffff10', color: p.featured ? '#49df80' : '#888' }}>
                                                        {p.featured ? 'Evet' : 'Hayır'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <Link href={`/projects/${p.id}`} style={{ padding: '8px', borderRadius: '8px', color: '#888' }}><Eye style={{ width: '16px', height: '16px' }} /></Link>
                                                        <Link href={`/admin/projects/${p.id}/edit`} style={{ padding: '8px', borderRadius: '8px', color: '#888' }}><Edit style={{ width: '16px', height: '16px' }} /></Link>
                                                        <button onClick={() => deleteProject(p.id)} style={{ padding: '8px', borderRadius: '8px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 style={{ width: '16px', height: '16px' }} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Kategoriler</h2>
                            <button onClick={() => { setShowCategoryForm(true); setEditingCategory(null); setCategoryForm({ name: '', slug: '', description: '', color: '#49df80' }) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: '#49df80', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                <Plus style={{ width: '18px', height: '18px' }} />
                                Yeni Kategori
                            </button>
                        </div>

                        {/* Category Form Modal */}
                        {showCategoryForm && (
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}>
                                <form onSubmit={handleCategorySubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <input
                                            type="text"
                                            placeholder="Kategori Adı"
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Slug"
                                            value={categoryForm.slug}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '12px' }}>
                                        <input
                                            type="text"
                                            placeholder="Açıklama (opsiyonel)"
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                        />
                                        <input
                                            type="color"
                                            value={categoryForm.color}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                                            style={{ width: '44px', height: '44px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: '#49df80', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                            {editingCategory ? 'Güncelle' : 'Ekle'}
                                        </button>
                                        <button type="button" onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#333', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                            İptal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ padding: '16px' }}>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {categories.map((cat) => (
                                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#0a0a0a' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: cat.color }} />
                                            </div>
                                            <div>
                                                <p style={{ color: '#fff', fontWeight: 600 }}>{cat.name}</p>
                                                <p style={{ color: '#666', fontSize: '12px' }}>{cat._count?.projects || 0} proje</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => editCategory(cat)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                                <Edit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button onClick={() => deleteCategory(cat.id)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                                <Trash2 style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Creators Tab */}
                {activeTab === 'creators' && (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Creators</h2>
                            <button onClick={() => { setShowCreatorForm(true); setEditingCreator(null); setCreatorForm({ fid: '', username: '', displayName: '', bio: '', avatarUrl: '' }) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: '#49df80', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                <Plus style={{ width: '18px', height: '18px' }} />
                                Yeni Creator
                            </button>
                        </div>

                        {/* Creator Form Modal */}
                        {showCreatorForm && (
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}>
                                <form onSubmit={handleCreatorSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <input
                                            type="number"
                                            placeholder="Farcaster ID (FID)"
                                            value={creatorForm.fid}
                                            onChange={(e) => setCreatorForm({ ...creatorForm, fid: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={creatorForm.username}
                                            onChange={(e) => setCreatorForm({ ...creatorForm, username: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '12px' }}>
                                        <input
                                            type="text"
                                            placeholder="Display Name (opsiyonel)"
                                            value={creatorForm.displayName}
                                            onChange={(e) => setCreatorForm({ ...creatorForm, displayName: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Bio (opsiyonel)"
                                            value={creatorForm.bio}
                                            onChange={(e) => setCreatorForm({ ...creatorForm, bio: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                        />
                                        <input
                                            type="url"
                                            placeholder="Avatar URL (opsiyonel)"
                                            value={creatorForm.avatarUrl}
                                            onChange={(e) => setCreatorForm({ ...creatorForm, avatarUrl: e.target.value })}
                                            style={{ padding: '10px', borderRadius: '8px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: '#49df80', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                            {editingCreator ? 'Güncelle' : 'Ekle'}
                                        </button>
                                        <button type="button" onClick={() => { setShowCreatorForm(false); setEditingCreator(null) }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#333', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                            İptal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ padding: '16px' }}>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {creators.map((creator) => (
                                    <div key={creator.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#0a0a0a' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: creator.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #49df80, #2a9d5f)', overflow: 'hidden', border: '2px solid rgba(73, 223, 128, 0.2)' }}>
                                                {creator.avatarUrl ? (
                                                    <img src={creator.avatarUrl} alt={creator.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '18px' }}>
                                                        {creator.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ color: '#fff', fontWeight: 600 }}>{creator.displayName || creator.username}</p>
                                                <p style={{ color: '#666', fontSize: '12px' }}>@{creator.username} · FID: {creator.fid}</p>
                                                <p style={{ color: '#888', fontSize: '11px' }}>{creator.upvoteCount} votes · {creator._count.projects} projects</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => editCreator(creator)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                                <Edit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button onClick={() => deleteCreator(creator.id)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                                <Trash2 style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
