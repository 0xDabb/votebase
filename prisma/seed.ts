import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Kategoriler
const categories = [
    { name: 'SaaS', slug: 'saas', icon: 'dns', color: '#3B82F6', order: 1 },
    { name: 'AI Tools', slug: 'ai-tools', icon: 'smart_toy', color: '#8B5CF6', order: 2 },
    { name: 'Productivity', slug: 'productivity', icon: 'bolt', color: '#EAB308', order: 3 },
    { name: 'Crypto', slug: 'crypto', icon: 'currency_bitcoin', color: '#F97316', order: 4 },
    { name: 'Mobile', slug: 'mobile', icon: 'smartphone', color: '#10B981', order: 5 },
    { name: 'Design', slug: 'design', icon: 'palette', color: '#EC4899', order: 6 },
    { name: 'DevTools', slug: 'devtools', icon: 'code', color: '#06B6D4', order: 7 },
    { name: 'Fintech', slug: 'fintech', icon: 'account_balance', color: '#22C55E', order: 8 },
    { name: 'Social', slug: 'social', icon: 'group', color: '#6366F1', order: 9 },
    { name: 'Games', slug: 'games', icon: 'sports_esports', color: '#EF4444', order: 10 },
    { name: 'Web3', slug: 'web3', icon: 'token', color: '#A855F7', order: 11 },
    { name: 'E-commerce', slug: 'ecommerce', icon: 'shopping_cart', color: '#14B8A6', order: 12 },
]

// Demo kullanıcılar
const users = [
    {
        fid: 1,
        username: 'vitalik',
        displayName: 'Vitalik Buterin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik',
    },
    {
        fid: 2,
        username: 'dwr',
        displayName: 'Dan Romero',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dan',
    },
    {
        fid: 3,
        username: 'horsefacts',
        displayName: 'horsefacts.eth',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=horse',
    },
    {
        fid: 4,
        username: 'linda',
        displayName: 'Linda Xie',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linda',
    },
    {
        fid: 5,
        username: 'jessepollak',
        displayName: 'Jesse Pollak',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jesse',
    },
]

// Örnek projeler
const projects = [
    {
        name: 'Warpcast',
        tagline: 'The leading Farcaster client with a beautiful, native experience',
        description: 'Warpcast is the flagship client for Farcaster, a sufficiently decentralized social network.',
        websiteUrl: 'https://warpcast.com',
        coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
        categorySlug: 'social',
        creatorFid: 2,
        featured: true,
        upvoteCount: 4250,
    },
    {
        name: 'Farcaster Frames',
        tagline: 'Interactive mini-apps that live inside Farcaster casts',
        description: 'Frames allow developers to create interactive experiences directly in the Farcaster feed.',
        websiteUrl: 'https://docs.farcaster.xyz/frames',
        coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
        categorySlug: 'devtools',
        creatorFid: 3,
        featured: true,
        upvoteCount: 3100,
    },
    {
        name: 'Base',
        tagline: 'An Ethereum L2 built by Coinbase, designed for everyone',
        description: 'Base is a secure, low-cost, builder-friendly Ethereum L2.',
        websiteUrl: 'https://base.org',
        githubUrl: 'https://github.com/base-org',
        coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
        categorySlug: 'crypto',
        creatorFid: 5,
        featured: true,
        upvoteCount: 5800,
    },
    {
        name: 'Supercast',
        tagline: 'A power-user Farcaster client with advanced features',
        description: 'Supercast offers advanced features for power users.',
        websiteUrl: 'https://supercast.xyz',
        coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
        categorySlug: 'productivity',
        creatorFid: 4,
        upvoteCount: 892,
    },
    {
        name: 'Paragraph',
        tagline: 'The web3 publishing platform for writers and creators',
        description: 'Write and publish content on the decentralized web.',
        websiteUrl: 'https://paragraph.xyz',
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        categorySlug: 'saas',
        creatorFid: 4,
        upvoteCount: 1450,
    },
    {
        name: 'Zora',
        tagline: 'Create, collect, and earn onchain',
        description: 'Zora is a decentralized protocol for crypto-art and NFTs.',
        websiteUrl: 'https://zora.co',
        githubUrl: 'https://github.com/ourzora',
        coverImage: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800',
        categorySlug: 'web3',
        creatorFid: 1,
        upvoteCount: 2340,
    },
    {
        name: 'Neynar',
        tagline: 'APIs and infrastructure for building on Farcaster',
        description: 'Neynar provides developer APIs for Farcaster.',
        websiteUrl: 'https://neynar.com',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        categorySlug: 'devtools',
        creatorFid: 3,
        upvoteCount: 1680,
    },
    {
        name: 'Farcaster AI Assistant',
        tagline: 'Your AI-powered assistant for the Farcaster ecosystem',
        description: 'Get instant answers about Farcaster with AI.',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        categorySlug: 'ai-tools',
        creatorFid: 1,
        upvoteCount: 756,
    },
    {
        name: 'CoinTracker',
        tagline: 'Crypto portfolio tracker with tax reporting',
        description: 'Track your cryptocurrency portfolio.',
        websiteUrl: 'https://cointracker.io',
        coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
        categorySlug: 'fintech',
        creatorFid: 4,
        upvoteCount: 980,
    },
    {
        name: 'Frame Studio',
        tagline: 'No-code builder for Farcaster Frames',
        description: 'Create Frames without writing code.',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        categorySlug: 'design',
        creatorFid: 2,
        upvoteCount: 524,
    },
    {
        name: 'Drakula',
        tagline: 'Short-form video meets crypto rewards',
        description: 'A TikTok-style app where creators earn crypto.',
        websiteUrl: 'https://drakula.app',
        coverImage: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800',
        categorySlug: 'social',
        creatorFid: 5,
        upvoteCount: 1120,
    },
    {
        name: 'Farcaster Mobile SDK',
        tagline: 'Build native mobile apps on Farcaster',
        description: 'React Native SDK for Farcaster.',
        githubUrl: 'https://github.com/farcasterxyz/mobile-sdk',
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        categorySlug: 'mobile',
        creatorFid: 3,
        upvoteCount: 445,
    },
]

// Örnek yorumlar
const sampleComments = [
    { content: 'This is exactly what the ecosystem needed! Great work team! 🚀', projectIndex: 0 },
    { content: 'Been using this for weeks and it has been a game changer.', projectIndex: 0 },
    { content: 'The UI is so clean, love the attention to detail.', projectIndex: 1 },
    { content: 'Would love to see more templates for common use cases.', projectIndex: 1 },
    { content: 'This is the future of Layer 2 scaling!', projectIndex: 2 },
    { content: 'Gas fees are incredibly low, amazing work.', projectIndex: 2 },
    { content: 'Power users rejoice! Finally a client with proper keyboard shortcuts.', projectIndex: 3 },
    { content: 'The analytics feature alone is worth it.', projectIndex: 3 },
    { content: 'Token-gated content is a brilliant feature.', projectIndex: 4 },
    { content: 'Love how easy it is to publish compared to traditional platforms.', projectIndex: 4 },
]

async function main() {
    console.log('🌱 Seeding database...\n')

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.notification.deleteMany()
    await prisma.savedProject.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.upvote.deleteMany()
    await prisma.project.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // Create categories
    console.log('📂 Creating categories...')
    for (const category of categories) {
        await prisma.category.create({ data: category })
        console.log(`   ✅ ${category.name}`)
    }

    // Create users
    console.log('\n👤 Creating users...')
    const createdUsers: Record<number, string> = {}
    for (const user of users) {
        const created = await prisma.user.create({ data: user })
        createdUsers[user.fid] = created.id
        console.log(`   ✅ @${user.username} (${user.displayName})`)
    }

    // Get all categories for lookup
    const allCategories = await prisma.category.findMany()
    const categoryMap = Object.fromEntries(allCategories.map(c => [c.slug, c.id]))

    // Create projects
    console.log('\n🚀 Creating projects...')
    const createdProjects: string[] = []
    for (const project of projects) {
        const created = await prisma.project.create({
            data: {
                name: project.name,
                tagline: project.tagline,
                description: project.description,
                websiteUrl: project.websiteUrl,
                githubUrl: project.githubUrl,
                coverImage: project.coverImage,
                featured: project.featured || false,
                upvoteCount: project.upvoteCount,
                creatorId: createdUsers[project.creatorFid],
                categoryId: categoryMap[project.categorySlug],
            },
        })
        createdProjects.push(created.id)
        console.log(`   ✅ ${project.name} (${project.upvoteCount} upvotes)`)
    }

    // Create some upvotes
    console.log('\n⬆️ Creating upvotes...')
    const userIds = Object.values(createdUsers)
    let upvoteCount = 0
    for (const projectId of createdProjects) {
        const numUpvotes = Math.floor(Math.random() * userIds.length) + 1
        const shuffledUsers = [...userIds].sort(() => Math.random() - 0.5).slice(0, numUpvotes)

        for (const userId of shuffledUsers) {
            try {
                await prisma.upvote.create({
                    data: { userId, projectId },
                })
                upvoteCount++
            } catch {
                // Ignore duplicate upvotes
            }
        }
    }
    console.log(`   ✅ Created ${upvoteCount} upvotes`)

    // Create comments
    console.log('\n💬 Creating comments...')
    for (const comment of sampleComments) {
        const randomUserIndex = Math.floor(Math.random() * userIds.length)
        await prisma.comment.create({
            data: {
                content: comment.content,
                userId: userIds[randomUserIndex],
                projectId: createdProjects[comment.projectIndex],
            },
        })
        console.log(`   ✅ Comment on project ${comment.projectIndex + 1}`)
    }

    // Create some saved projects
    console.log('\n🔖 Creating saved projects...')
    let savedCount = 0
    for (const userId of userIds) {
        const numSaved = Math.floor(Math.random() * 3) + 1
        const shuffledProjects = [...createdProjects].sort(() => Math.random() - 0.5).slice(0, numSaved)

        for (const projectId of shuffledProjects) {
            try {
                await prisma.savedProject.create({
                    data: { userId, projectId },
                })
                savedCount++
            } catch {
                // Ignore duplicates
            }
        }
    }
    console.log(`   ✅ Created ${savedCount} saved projects`)

    // Create sample notifications
    console.log('\n🔔 Creating notifications...')
    const mainUser = userIds[0]
    const notifications = [
        { type: 'UPVOTE', title: 'New Upvote!', message: 'horsefacts.eth upvoted your project "Warpcast"' },
        { type: 'COMMENT', title: 'New Comment!', message: 'Linda Xie commented on "Base"' },
        { type: 'FEATURED', title: 'Congratulations! 🎉', message: 'Your project "Warpcast" was featured!' },
        { type: 'UPVOTE', title: 'New Upvote!', message: 'Jesse Pollak upvoted your project "Farcaster Frames"' },
        { type: 'SYSTEM', title: 'Welcome to Bote!', message: 'Start by exploring projects or creating your own.' },
    ]

    for (const notif of notifications) {
        await prisma.notification.create({
            data: {
                ...notif,
                userId: mainUser,
                read: Math.random() > 0.5,
            },
        })
        console.log(`   ✅ ${notif.type}: ${notif.title}`)
    }

    console.log('\n✨ Seeding completed!\n')

    // Print summary
    const stats = {
        users: await prisma.user.count(),
        categories: await prisma.category.count(),
        projects: await prisma.project.count(),
        upvotes: await prisma.upvote.count(),
        comments: await prisma.comment.count(),
        savedProjects: await prisma.savedProject.count(),
        notifications: await prisma.notification.count(),
    }

    console.log('📊 Database Statistics:')
    console.log(`   👤 Users: ${stats.users}`)
    console.log(`   📂 Categories: ${stats.categories}`)
    console.log(`   🚀 Projects: ${stats.projects}`)
    console.log(`   ⬆️ Upvotes: ${stats.upvotes}`)
    console.log(`   💬 Comments: ${stats.comments}`)
    console.log(`   🔖 Saved Projects: ${stats.savedProjects}`)
    console.log(`   🔔 Notifications: ${stats.notifications}`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
