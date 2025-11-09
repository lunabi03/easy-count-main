import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Supabase 인증 코드 교환을 처리하는 라우트
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

