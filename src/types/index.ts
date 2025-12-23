// User types
export interface User {
    id: string
    fid: number
    username: string
    displayName: string | null
    avatarUrl: string | null
    custodyAddress: string | null
    createdAt: Date
    updatedAt: Date
}

// Project types
export interface Project {
    id: string
    name: string
    tagline: string
    description: string | null
    websiteUrl: string | null
    githubUrl: string | null
    coverImage: string | null
    logoImage: string | null
    featured: boolean
    status: ProjectStatus
    createdAt: Date
    updatedAt: Date
    creatorId: string
    categoryId: string
    upvoteCount: number
    creator?: User
    category?: Category
    upvotes?: Upvote[]
    comments?: Comment[]
    _count?: {
        upvotes: number
        comments: number
    }
    hasUpvoted?: boolean
    hasSaved?: boolean
}

export type ProjectStatus = 'ACTIVE' | 'PENDING' | 'ARCHIVED'

// Category types
export interface Category {
    id: string
    name: string
    slug: string
    icon: string | null
    color: string | null
    description: string | null
    order: number
    createdAt: Date
    _count?: {
        projects: number
    }
}

// Upvote types
export interface Upvote {
    id: string
    createdAt: Date
    userId: string
    projectId: string
    user?: User
    project?: Project
}

// Comment types
export interface Comment {
    id: string
    content: string
    createdAt: Date
    updatedAt: Date
    userId: string
    projectId: string
    parentId: string | null
    likeCount: number
    user?: User
    project?: Project
    replies?: Comment[]
    parent?: Comment
}

// SavedProject types
export interface SavedProject {
    id: string
    createdAt: Date
    userId: string
    projectId: string
    user?: User
    project?: Project
}

// Notification types
export interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string | null
    read: boolean
    data: Record<string, unknown> | null
    createdAt: Date
    userId: string
    user?: User
}

export type NotificationType = 'UPVOTE' | 'COMMENT' | 'REPLY' | 'FEATURED' | 'SYSTEM'

// API Response types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

// Form types
export interface CreateProjectInput {
    name: string
    tagline: string
    description?: string
    websiteUrl?: string
    githubUrl?: string
    coverImage?: string
    logoImage?: string
    categoryId: string
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
    id: string
}

export interface CreateCommentInput {
    content: string
    projectId: string
    parentId?: string
}

// Filter & Sort types
export type ProjectSortBy = 'upvotes' | 'newest' | 'trending'

export interface ProjectFilters {
    categoryId?: string
    search?: string
    featured?: boolean
    creatorId?: string
    sortBy?: ProjectSortBy
}
