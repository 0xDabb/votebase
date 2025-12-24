import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Tek proje getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                category: true,
                creator: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true
                    }
                }
            }
        })

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: project })
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

// PATCH: Proje güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
            featured,
            status,
            socialLinks
        } = body

        const project = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(tagline && { tagline }),
                ...(description !== undefined && { description }),
                ...(websiteUrl !== undefined && { websiteUrl }),
                ...(githubUrl !== undefined && { githubUrl }),
                ...(coverImage !== undefined && { coverImage }),
                ...(logoImage !== undefined && { logoImage }),
                ...(categoryId && { categoryId }),
                ...(featured !== undefined && { featured }),
                ...(status && { status }),
                ...(socialLinks !== undefined && { socialLinks })
            },
            include: {
                category: true,
                creator: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true
                    }
                }
            }
        })

        return NextResponse.json({ success: true, data: project })
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update project' },
            { status: 500 }
        )
    }
}

// DELETE: Proje sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.project.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: 'Project deleted' })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}
