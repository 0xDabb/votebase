import { ReactNode } from 'react'
import { BottomNav } from '@/components/navigation/BottomNav'
import { AuthProvider } from '@/contexts/AuthContext'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-[#0F0F0F] text-white pb-24">
                {children}
                <BottomNav />
            </div>
        </AuthProvider>
    )
}
