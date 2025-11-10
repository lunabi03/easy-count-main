import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Supabase 인증 코드 교환을 처리하는 라우트
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // OAuth 에러가 있는 경우
  if (error) {
    console.error('OAuth 에러:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '로그인에 실패했습니다.')}`, requestUrl.origin)
    )
  }

  // 인증 코드가 있는 경우 세션으로 교환
  if (code) {
    try {
      const supabase = createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('세션 교환 에러:', exchangeError)
        return NextResponse.redirect(
          new URL(`/auth?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }
    } catch (err) {
      console.error('인증 처리 중 에러:', err)
      return NextResponse.redirect(
        new URL('/auth?error=unknown&message=인증 처리 중 오류가 발생했습니다.', requestUrl.origin)
      )
    }
  }

  // 성공 시 홈으로 리다이렉트
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

