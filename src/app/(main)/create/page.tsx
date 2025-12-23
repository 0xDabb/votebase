'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { Category } from '@/types'

export default function CreateProjectPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        description: '',
        websiteUrl: '',
        githubUrl: '',
        categoryId: '',
        coverImage: '',
        logoImage: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchCategories()
    }, [])

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

    function validateForm() {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required'
        }
        if (!formData.tagline.trim()) {
            newErrors.tagline = 'Tagline is required'
        }
        if (formData.tagline.length > 100) {
            newErrors.tagline = 'Tagline must be less than 100 characters'
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category'
        }
        if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
            newErrors.websiteUrl = 'Please enter a valid URL'
        }
        if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
            newErrors.githubUrl = 'Please enter a valid URL'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    function isValidUrl(string: string) {
        try {
            new URL(string)
            return true
        } catch {
            return false
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!user) return
        if (!validateForm()) return

        setLoading(true)
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    creatorId: user.id,
                }),
            })

            const data = await res.json()

            if (data.success) {
                router.push(`/projects/${data.data.id}`)
            } else {
                setErrors({ submit: data.error || 'Failed to create project' })
            }
        } catch (error) {
            console.error('Error creating project:', error)
            setErrors({ submit: 'Something went wrong. Please try again.' })
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
                    Connect with Farcaster to create a project
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3 pt-12">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-white text-lg font-bold">New Project</h2>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Cover Image</label>
                    <div className="relative h-40 bg-[#1A1A1A] rounded-2xl border border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                        {formData.coverImage ? (
                            <>
                                <img
                                    src={formData.coverImage}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <Upload className="w-8 h-8 text-[#A0A0A0] mx-auto mb-2" />
                                <p className="text-sm text-[#A0A0A0]">Paste image URL below</p>
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className="mt-2 w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none"
                    />
                </div>

                {/* Project Name */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Project Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Awesome Project"
                        className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none ${errors.name ? 'border-red-500' : 'border-white/10'
                            }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>

                {/* Tagline */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Tagline * <span className="text-[#A0A0A0] font-normal">({formData.tagline.length}/100)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="A short description of your project"
                        maxLength={100}
                        className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none ${errors.tagline ? 'border-red-500' : 'border-white/10'
                            }`}
                    />
                    {errors.tagline && <p className="mt-1 text-xs text-red-400">{errors.tagline}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell us more about your project..."
                        rows={4}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none resize-none"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Category *</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.categoryId === category.id
                                        ? 'bg-[#44e47e] text-black'
                                        : 'bg-[#1A1A1A] text-[#A0A0A0] border border-white/10 hover:text-white'
                                    }`}
                            >
                                {category.icon && <span className="mr-1">{category.icon}</span>}
                                {category.name}
                            </button>
                        ))}
                    </div>
                    {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId}</p>}
                </div>

                {/* URLs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Website URL</label>
                        <input
                            type="url"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                            placeholder="https://myproject.com"
                            className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none ${errors.websiteUrl ? 'border-red-500' : 'border-white/10'
                                }`}
                        />
                        {errors.websiteUrl && <p className="mt-1 text-xs text-red-400">{errors.websiteUrl}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">GitHub URL</label>
                        <input
                            type="url"
                            value={formData.githubUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                            placeholder="https://github.com/username/repo"
                            className={`w-full bg-[#1A1A1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#A0A0A0] focus:ring-1 focus:ring-[#44e47e] focus:border-[#44e47e] outline-none ${errors.githubUrl ? 'border-red-500' : 'border-white/10'
                                }`}
                        />
                        {errors.githubUrl && <p className="mt-1 text-xs text-red-400">{errors.githubUrl}</p>}
                    </div>
                </div>

                {/* Error Message */}
                {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-sm text-red-400">{errors.submit}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-[#44e47e] text-black font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Project'
                    )}
                </button>
            </form>
        </div>
    )
}
