
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Categories Data
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

async function main() {
    console.log('🌱 Seeding database with categories only...')

    // 1. Clear existing data safely
    console.log('🧹 Clearing existing data...')
    // Note: We use deleteMany() to clear tables without dropping them
    await prisma.notification.deleteMany()
    await prisma.savedProject.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.upvote.deleteMany()
    await prisma.project.deleteMany()
    // We don't delete users yet as they might own projects, but if projects are gone, users can be deleted
    // await prisma.user.deleteMany() 

    // Deleting categories last
    await prisma.category.deleteMany()

    // 2. Insert Categories
    console.log('📂 Creating categories...')
    for (const category of categories) {
        // Upsert ensures we don't duplicate if run multiple times
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        })
        console.log(`   ✅ ${category.name}`)
    }

    console.log('\n✨ Seeding completed! (Empty DB with Categories ready)')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
