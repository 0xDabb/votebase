import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Admin şifresi - Vercel'de environment variable olarak ayarla
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bote2024'

// Middleware: Basit auth kontrolü
function checkAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get('x-admin-auth')
    return authHeader === ADMIN_PASSWORD
}

// GET: Tüm projeleri getir (admin için detaylı)
export async function GET(request: NextRequest) {
    try {
        const projects = await prisma.project.findMany({
            include: {
                category: true,
                creator: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true
                    }
                },
                _count: {
                    select: {
                        upvotes: true,
                        comments: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, data: projects })
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

// POST: Yeni proje oluştur
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
            featured,
            socialLinks
        } = body

        // Validation
        if (!name || !tagline || !categoryId) {
            return NextResponse.json(
                { success: false, error: 'Name, tagline and category are required' },
                { status: 400 }
            )
        }

        // Creator yoksa admin user oluştur/kullan
        let finalCreatorId = creatorId
        if (!finalCreatorId) {
            // Admin user bul veya oluştur
            let adminUser = await prisma.user.findFirst({
                where: { username: 'admin' }
            })

            if (!adminUser) {
                adminUser = await prisma.user.create({
                    data: {
                        fid: 0,
                        username: 'admin',
                        displayName: 'Bote Admin'
                    }
                })
            }
            finalCreatorId = adminUser.id
        }

        const project = await prisma.project.create({
            data: {
                name,
                tagline,
                description: description || null,
                websiteUrl: websiteUrl || null,
                githubUrl: githubUrl || null,
                coverImage: coverImage || null,
                logoImage: logoImage || null,
                categoryId,
                creatorId: finalCreatorId,
                featured: featured || false,
                socialLinks: socialLinks || null,
                status: 'ACTIVE'
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
        console.error('Error creating project:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
