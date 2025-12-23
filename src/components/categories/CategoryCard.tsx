'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategoryCardProps {
    category: Category
    variant?: 'square' | 'wide'
    backgroundImage?: string
}

// Default background images for categories
const categoryBackgrounds: Record<string, string> = {
    'saas': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    'ai-tools': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    'mobile': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    'crypto': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    'productivity': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
    'design': 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
    'devtools': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    'fintech': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
    'social': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
    'games': 'https://images.unsplash.com/photo-1493711662062-fa541f7f0b0c?w=400',
}

// Category icons map
const categoryIcons: Record<string, string> = {
    'saas': 'dns',
    'ai-tools': 'smart_toy',
    'mobile': 'smartphone',
    'crypto': 'currency_bitcoin',
    'productivity': 'bolt',
    'design': 'palette',
    'devtools': 'code',
    'fintech': 'account_balance',
    'social': 'group',
    'games': 'sports_esports',
}

export function CategoryCard({ category, variant = 'square', backgroundImage }: CategoryCardProps) {
    const bgImage = backgroundImage || categoryBackgrounds[category.slug] || categoryBackgrounds['saas']
    const icon = category.icon || categoryIcons[category.slug] || 'folder'

    if (variant === 'wide') {
        return (
            <Link href={`/explore?category=${category.slug}`}>
                <div className="group col-span-2 relative overflow-hidden rounded-2xl bg-[#1A1A1A] h-32 flex flex-col justify-end p-4 border border-white/5 hover:border-[#44e47e]/50 transition-all cursor-pointer">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-60"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between w-full">
                        <div>
                            <p className="font-bold text-lg leading-tight text-white">{category.name}</p>
                            {category._count && (
                                <p className="text-xs text-[#A0A0A0] mt-1">{category._count.projects}+ Projects</p>
                            )}
                        </div>
                        <span
                            className="material-symbols-outlined text-[32px]"
                            style={{ color: category.color || '#44e47e' }}
                        >
                            {icon}
                        </span>
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <Link href={`/explore?category=${category.slug}`}>
            <div className="group relative overflow-hidden rounded-2xl bg-[#1A1A1A] aspect-square flex flex-col justify-end p-4 border border-white/5 hover:border-[#44e47e]/50 transition-all cursor-pointer">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-60"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative z-10">
                    <span
                        className="material-symbols-outlined text-[28px] mb-1"
                        style={{ color: category.color || '#44e47e' }}
                    >
                        {icon}
                    </span>
                    <p className="font-bold text-lg leading-tight text-white">{category.name}</p>
                </div>
            </div>
        </Link>
    )
}

interface CategoryChipsProps {
    categories: Category[]
    selectedId?: string
    onChange?: (categoryId: string | null) => void
}

export function CategoryChips({ categories, selectedId, onChange }: CategoryChipsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3 scroll-smooth">
            <button
                onClick={() => onChange?.(null)}
                className={cn(
                    "flex h-8 shrink-0 items-center px-4 rounded-full font-semibold text-xs transition-transform active:scale-95",
                    !selectedId
                        ? "bg-[#44e47e] text-black"
                        : "bg-[#1A1A1A] border border-white/[0.08] text-[#A0A0A0] hover:text-white"
                )}
            >
                All
            </button>

            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onChange?.(category.id)}
                    className={cn(
                        "flex h-8 shrink-0 items-center px-4 rounded-full font-medium text-xs transition-all active:scale-95",
                        selectedId === category.id
                            ? "bg-[#44e47e] text-black"
                            : "bg-[#1A1A1A] border border-white/[0.08] text-[#A0A0A0] hover:text-white"
                    )}
                >
                    {category.icon && (
                        <span
                            className="material-symbols-outlined text-base mr-1"
                            style={{ color: selectedId === category.id ? 'inherit' : category.color }}
                        >
                            {category.icon}
                        </span>
                    )}
                    {category.name}
                </button>
            ))}
        </div>
    )
}
