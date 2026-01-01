import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    // Connection pool settings for better performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Global type declaration for singleton
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Use existing instance or create new one
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// Export as both named and default
export { prisma }
export default prisma

// In development, save to global to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
