 'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Navigation from './Navigation'

export default function Header() {
  const { user, loading } = useAuth()
  const supabase = createClient()

  const handleSignOut = async () => {
    // Supabase 세션을 해제하여 로그아웃 처리
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Easy Count
          </Link>

          <div className="flex items-center gap-4">
            <Navigation />

            {loading ? (
              <div className="text-black">로딩중...</div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/history" className="text-black hover:text-indigo-600">
                  기록
                </Link>
                <span className="text-sm text-black">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-black hover:text-red-600"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

