'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUp, MessageCircle, Bookmark } from 'lucide-react'
import { cn, formatNumber, formatTimeAgo } from '@/lib/utils'
import type { Project } from '@/types'

interface ProjectCardProps {
    project: Project
    variant?: 'default' | 'featured' | 'compact' | 'list'
    onUpvote?: () => void
    onSave?: () => void
}

export function ProjectCard({
    project,
    variant = 'default',
    onUpvote,
    onSave
}: ProjectCardProps) {
    const {
        id,
        name,
        tagline,
        coverImage,
        logoImage,
        creator,
        category,
        upvoteCount,
        _count,
        featured,
        createdAt,
        hasUpvoted,
        hasSaved
    } = project

    // Featured variant - wide card with image
    if (variant === 'featured') {
        return (
            <article className="col-span-2 bg-[#1A1A1A] rounded-xl border border-white/[0.08] overflow-hidden shadow-lg group relative flex flex-row h-32">
                {featured && (
                    <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-sm">
                            Featured
                        </span>
                    </div>
                )}

                {/* Image section */}
                <div
                    className="w-1/3 bg-cover bg-center relative h-full"
                    style={{ backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #1a1a1a, #262626)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1A1A1A]/80" />
                </div>

                {/* Content section */}
                <div className="w-2/3 p-3 flex flex-col justify-between z-10">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <Link href={`/projects/${id}`}>
                                <h2 className="text-base font-bold text-white leading-tight hover:text-[#44e47e] transition-colors">
                                    {name}
                                </h2>
                            </Link>
                            <button
                                onClick={(e) => { e.preventDefault(); onUpvote?.() }}
                                className={cn(
                                    "flex items-center gap-1 rounded-full px-1.5 py-0.5 border transition-colors",
                                    hasUpvoted
                                        ? "bg-[#44e47e]/20 border-[#44e47e]/30 text-[#44e47e]"
                                        : "bg-black/40 backdrop-blur-md border-white/10 text-white/70 hover:text-[#44e47e]"
                                )}
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">{formatNumber(upvoteCount)}</span>
                            </button>
                        </div>
                        <p className="text-[#A0A0A0] text-xs line-clamp-2 leading-snug">{tagline}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                        <div className="flex items-center gap-1.5">
                            {creator?.avatarUrl && (
                                <Image
                                    src={creator.avatarUrl}
                                    alt={creator.displayName || creator.username}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                />
                            )}
                            <span className="text-[10px] text-[#A0A0A0]">
                                by {creator?.displayName || creator?.username}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-0.5 text-[#A0A0A0] hover:text-white transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-medium">{_count?.comments || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        )
    }

    // Compact variant - small card with icon
    if (variant === 'compact') {
        return (
            <article className="bg-[#1A1A1A] rounded-xl border border-white/[0.08] overflow-hidden shadow-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: category?.color ? `${category.color}20` : '#44e47e20',
                            }}
                        >
                            {logoImage ? (
                                <Image src={logoImage} alt={name} width={20} height={20} className="rounded" />
                            ) : (
                                <span className="text-lg">{category?.icon || '📦'}</span>
                            )}
                        </div>
                        <div>
                            <Link href={`/projects/${id}`}>
                                <h3 className="font-bold text-white text-sm truncate max-w-[80px] hover:text-[#44e47e] transition-colors">
                                    {name}
                                </h3>
                            </Link>
                            {category && (
                                <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-medium border"
                                    style={{
                                        backgroundColor: category.color ? `${category.color}10` : 'rgba(255,255,255,0.05)',
                                        color: category.color || '#A0A0A0',
                                        borderColor: category.color ? `${category.color}30` : 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {category.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-[#A0A0A0] text-[10px] line-clamp-2 leading-relaxed">{tagline}</p>

                <div className="mt-auto pt-1 flex items-center justify-between">
                    <button
                        onClick={onUpvote}
                        className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 border transition-colors",
                            hasUpvoted
                                ? "bg-[#44e47e]/20 border-[#44e47e]/30 text-[#44e47e]"
                                : "bg-black/30 border-white/5 text-[#A0A0A0] hover:text-[#44e47e]"
                        )}
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{formatNumber(upvoteCount)}</span>
                    </button>

                    {creator?.avatarUrl && (
                        <div className="flex -space-x-1.5">
                            <Image
                                src={creator.avatarUrl}
                                alt=""
                                width={16}
                                height={16}
                                className="rounded-full border border-[#1A1A1A]"
                            />
                        </div>
                    )}
                </div>
            </article>
        )
    }

    // List variant - horizontal card
    if (variant === 'list') {
        return (
            <article className="bg-[#1A1A1A] p-3 rounded-2xl border border-white/5 flex gap-4 items-center active:scale-[0.98] transition-transform">
                <div
                    className="h-16 w-16 flex-shrink-0 rounded-xl bg-cover bg-center"
                    style={{
                        backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #262626, #1a1a1a)',
                    }}
                />

                <div className="flex-1 min-w-0">
                    <Link href={`/projects/${id}`}>
                        <h3 className="font-bold text-base text-white truncate hover:text-[#44e47e] transition-colors">
                            {name}
                        </h3>
                    </Link>
                    <p className="text-[#A0A0A0] text-xs mt-1">
                        {formatTimeAgo(createdAt)} {creator && `• by @${creator.username}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        {category && (
                            <span className="text-[10px] text-white/60 border border-white/10 px-1.5 py-0.5 rounded">
                                {category.name}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-1 bg-[#0F0F0F] p-2 rounded-xl h-full min-w-[50px]">
                    <button
                        onClick={onUpvote}
                        className={cn(
                            "transition-colors text-xl",
                            hasUpvoted ? "text-[#44e47e]" : "text-white/40 hover:text-[#44e47e]"
                        )}
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-white">{formatNumber(upvoteCount)}</span>
                </div>
            </article>
        )
    }

    // Default variant - card with cover image
    return (
        <article className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1A1A1A] border border-white/5">
            {/* Cover image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                    backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #1a1a1a, #262626)',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Upvote badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                    onClick={onUpvote}
                    className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold border transition-colors",
                        hasUpvoted
                            ? "bg-[#44e47e]/20 border-[#44e47e]/30 text-[#44e47e]"
                            : "bg-black/50 backdrop-blur-md border-white/10 text-white hover:text-[#44e47e]"
                    )}
                >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>{formatNumber(upvoteCount)}</span>
                </button>
            </div>

            {/* Save button */}
            <button
                onClick={(e) => { e.preventDefault(); onSave?.() }}
                className={cn(
                    "absolute top-3 left-3 p-1.5 rounded-full transition-colors",
                    hasSaved
                        ? "bg-[#44e47e] text-black"
                        : "bg-black/50 backdrop-blur-md text-white/70 hover:text-white border border-white/10"
                )}
            >
                <Bookmark className={cn("w-4 h-4", hasSaved && "fill-current")} />
            </button>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-4">
                <Link href={`/projects/${id}`}>
                    <p className="text-white text-base font-bold leading-tight mb-1 hover:text-[#44e47e] transition-colors">
                        {name}
                    </p>
                </Link>
                <p className="text-gray-400 text-xs">{category?.name}</p>
            </div>
        </article>
    )
}
