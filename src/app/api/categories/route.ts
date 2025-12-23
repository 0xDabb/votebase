import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/categories - List all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { projects: true },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: categories,
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

// POST /api/categories - Create a new category (admin only in production)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, slug, icon, color, description, order } = body

        if (!name || !slug) {
            return NextResponse.json(
                { success: false, error: 'Name and slug are required' },
                { status: 400 }
            )
        }

        // Check if slug already exists
        const existing = await prisma.category.findUnique({
            where: { slug },
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Category with this slug already exists' },
                { status: 400 }
            )
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                icon,
                color,
                description,
                order: order || 0,
            },
        })

        return NextResponse.json({
            success: true,
            data: category,
        })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
