import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/projects - List projects with filters and sorting
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const sortBy = searchParams.get('sortBy') || 'upvotes' // upvotes, newest, trending
        const categoryId = searchParams.get('categoryId')
        const search = searchParams.get('search')
        const featured = searchParams.get('featured') === 'true'
        const creatorId = searchParams.get('creatorId')
        const userId = searchParams.get('userId') // Current user for hasUpvoted check

        // Build where clause
        const where: Record<string, unknown> = {
            status: 'ACTIVE',
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        if (featured) {
            where.featured = true
        }

        if (creatorId) {
            where.creatorId = creatorId
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Build orderBy based on sortBy
        let orderBy: Record<string, string>[] = []
        switch (sortBy) {
            case 'newest':
                orderBy = [{ createdAt: 'desc' }]
                break
            case 'trending':
                // Trending = high upvotes + recent (could be more sophisticated)
                orderBy = [{ upvoteCount: 'desc' }, { createdAt: 'desc' }]
                break
            case 'upvotes':
            default:
                orderBy = [{ upvoteCount: 'desc' }]
                break
        }

        // Get total count
        const total = await prisma.project.count({ where })

        // Get projects with relations
        const projects = await prisma.project.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                creator: {
                    select: {
                        id: true,
                        fid: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                category: true,
                _count: {
                    select: {
                        upvotes: true,
                        comments: true,
                    },
                },
                ...(userId && {
                    upvotes: {
                        where: { userId },
                        select: { id: true },
                    },
                    savedBy: {
                        where: { userId },
                        select: { id: true },
                    },
                }),
            },
        })

        // Transform to add hasUpvoted and hasSaved flags
        const transformedProjects = projects.map((project) => ({
            ...project,
            hasUpvoted: userId ? (project.upvotes?.length || 0) > 0 : false,
            hasSaved: userId ? (project.savedBy?.length || 0) > 0 : false,
            upvotes: undefined,
            savedBy: undefined,
        }))

        return NextResponse.json({
            success: true,
            data: transformedProjects,
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        })
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            name,
            tagline,
            description,
            websiteUrl,
            githubUrl,
            coverImage,
            logoImage,
            categoryId,
            creatorId,
        } = body

        // Validate required fields
        if (!name || !tagline || !categoryId || !creatorId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify creator exists
        const creator = await prisma.user.findUnique({
            where: { id: creatorId },
        })

        if (!creator) {
            return NextResponse.json(
                { success: false, error: 'Creator not found' },
                { status: 404 }
            )
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        })

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            )
        }

        // Create project
        const project = await prisma.project.create({
            data: {
                name,
                tagline,
                description,
                websiteUrl,
                githubUrl,
                coverImage,
                logoImage,
                categoryId,
                creatorId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fid: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                category: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: project,
        })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
