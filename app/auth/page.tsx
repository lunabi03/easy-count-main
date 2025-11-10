'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function AuthPage() {
  // Supabase 인증 UI를 초기화하기 위한 클라이언트 생성
  const supabase = createClient()
  const [redirectUrl, setRedirectUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // OAuth 콜백 URL을 동적으로 생성
    // 환경 변수가 있으면 사용하고, 없으면 현재 호스트 사용
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    setRedirectUrl(`${siteUrl}/auth/callback`)

    // URL 파라미터에서 에러 정보 읽기
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get('error')
      const messageParam = params.get('message')
      
      if (errorParam) {
        setError(errorParam)
        setErrorMessage(messageParam)
        
        // 에러 메시지를 표시한 후 URL에서 제거 (선택사항)
        // window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          로그인 / 회원가입
        </h1>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">로그인 오류</p>
            <p className="text-red-600 text-sm mt-1">
              {errorMessage || '로그인 중 오류가 발생했습니다.'}
            </p>
          </div>
        )}

        {redirectUrl && (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  email_input_placeholder: 'your@email.com',
                  password_input_placeholder: '비밀번호'
                },
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '가입 중...',
                  email_input_placeholder: 'your@email.com',
                  password_input_placeholder: '비밀번호'
                }
              }
            }}
            theme="light"
            redirectTo={redirectUrl}
            magicLink={true}
            onlyThirdPartyProviders={false}
          />
        )}
      </div>
    </div>
  )
}

