'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Image, Link as LinkIcon, Twitter, Trash2 } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        description: '',
        websiteUrl: '',
        githubUrl: '',
        coverImage: '',
        logoImage: '',
        categoryId: '',
        featured: false,
        status: 'ACTIVE',
        socialLinks: {
            twitter: '',
            discord: '',
            telegram: '',
            farcaster: ''
        }
    })

    useEffect(() => {
        // Auth kontrolü
        const auth = sessionStorage.getItem('admin_auth')
        if (auth !== 'true') {
            router.push('/admin')
            return
        }
        fetchData()
    }, [id, router])

    async function fetchData() {
        try {
            // Kategorileri getir
            const catRes = await fetch('/api/categories')
            const catData = await catRes.json()
            if (catData.success) {
                setCategories(catData.data)
            }

            // Projeyi getir
            const projRes = await fetch(`/api/admin/projects/${id}`)
            const projData = await projRes.json()

            if (projData.success) {
                const project = projData.data
                setFormData({
                    name: project.name || '',
                    tagline: project.tagline || '',
                    description: project.description || '',
                    websiteUrl: project.websiteUrl || '',
                    githubUrl: project.githubUrl || '',
                    coverImage: project.coverImage || '',
                    logoImage: project.logoImage || '',
                    categoryId: project.categoryId || '',
                    featured: project.featured || false,
                    status: project.status || 'ACTIVE',
                    socialLinks: {
                        twitter: project.socialLinks?.twitter || '',
                        discord: project.socialLinks?.discord || '',
                        telegram: project.socialLinks?.telegram || '',
                        farcaster: project.socialLinks?.farcaster || ''
                    }
                })
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Proje yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '')
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialKey]: value
                }
            }))
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    socialLinks: Object.fromEntries(
                        Object.entries(formData.socialLinks).filter(([_, v]) => v)
                    )
                })
            })

            const data = await res.json()

            if (data.success) {
                router.push('/admin')
            } else {
                setError(data.error || 'Bir hata oluştu')
            }
        } catch (err) {
            setError('Proje güncellenirken bir hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return

        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                router.push('/admin')
            }
        } catch (err) {
            setError('Proje silinirken bir hata oluştu')
        }
    }

    const inputStyle = {
        background: '#0F0F0F',
        border: '1px solid rgba(255,255,255,0.1)'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0F0F' }}>
                <p className="text-white/60">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#0F0F0F' }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-white/60 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Projeyi Düzenle</h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div
                        className="p-6 rounded-2xl space-y-4"
                        style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <h2 className="text-lg font-bold text-white mb-4">Temel Bilgiler</h2>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Proje Adı *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Kısa Açıklama (Tagline) *
                            </label>
                            <input
                                type="text"
                                name="tagline"
                                value={formData.tagline}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Detaylı Açıklama
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80] resize-none"
                                style={inputStyle}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Kategori *
                                </label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                    style={inputStyle}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Durum
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                    style={inputStyle}
                                >
                                    <option value="ACTIVE">Aktif</option>
                                    <option value="INACTIVE">Pasif</option>
                                    <option value="PENDING">Beklemede</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="featured"
                                id="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="w-5 h-5 rounded"
                            />
                            <label htmlFor="featured" className="text-white">
                                Öne Çıkan Proje
                            </label>
                        </div>
                    </div>

                    {/* Images */}
                    <div
                        className="p-6 rounded-2xl space-y-4"
                        style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            Görseller
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Logo URL
                            </label>
                            <input
                                type="url"
                                name="logoImage"
                                value={formData.logoImage}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                style={inputStyle}
                            />
                            {formData.logoImage && (
                                <img src={formData.logoImage} alt="Logo preview" className="mt-2 w-16 h-16 rounded-lg object-cover" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Kapak Görseli URL
                            </label>
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                style={inputStyle}
                            />
                            {formData.coverImage && (
                                <img src={formData.coverImage} alt="Cover preview" className="mt-2 w-full h-32 rounded-lg object-cover" />
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div
                        className="p-6 rounded-2xl space-y-4"
                        style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5" />
                            Bağlantılar
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Website URL
                            </label>
                            <input
                                type="url"
                                name="websiteUrl"
                                value={formData.websiteUrl}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                GitHub URL
                            </label>
                            <input
                                type="url"
                                name="githubUrl"
                                value={formData.githubUrl}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Social Media */}
                    <div
                        className="p-6 rounded-2xl space-y-4"
                        style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Twitter className="w-5 h-5" />
                            Sosyal Medya Hesapları
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Twitter/X
                                </label>
                                <input
                                    type="url"
                                    name="social_twitter"
                                    value={formData.socialLinks.twitter}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Discord
                                </label>
                                <input
                                    type="url"
                                    name="social_discord"
                                    value={formData.socialLinks.discord}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Telegram
                                </label>
                                <input
                                    type="url"
                                    name="social_telegram"
                                    value={formData.socialLinks.telegram}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Farcaster
                                </label>
                                <input
                                    type="url"
                                    name="social_farcaster"
                                    value={formData.socialLinks.farcaster}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#49df80]"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Link
                            href="/admin"
                            className="flex-1 py-3 rounded-xl font-semibold text-center text-white/60 transition-colors hover:text-white"
                            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ background: '#49df80' }}
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
