import { ReactNode } from 'react'
import { BottomNav } from '@/components/navigation/BottomNav'
import { AuthProvider } from '@/contexts/AuthContext'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <AuthProvider>
            {/* Full screen dark background */}
            <div className="min-h-screen bg-[#0a0a0a] flex justify-center">
                {/* Mobile container - centered */}
                <div className="relative w-full max-w-[430px] min-h-screen bg-[#0F0F0F] text-white pb-24 shadow-2xl">
                    {children}
                    <BottomNav />
                </div>
            </div>
        </AuthProvider>
    )
}
