1. Supabase 프로젝트 설정
   
   Step 1: Supabase 계정 생성
   - https://supabase.com 접속
   - GitHub 계정으로 가입
   - "New project" 클릭
   - 프로젝트 이름, 데이터베이스 비밀번호 설정
   - Region: Northeast Asia (Seoul) 선택
   - 프로젝트 생성 완료 (약 2분 소요)
   
   Step 2: API 키 복사
   - Settings → API
   - Project URL 복사
   - anon public key 복사

2. 환경 변수 설정
   
   a) .env.local에 추가 (마우스 오른쪽 클릭 후 파일 생성)
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Site
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   
   b) .env.example에도 추가
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. 패키지 설치
   ```bash
   cd lesson-09
   pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
   pnpm add @supabase/auth-ui-react @supabase/auth-ui-shared
   ```

4. Supabase 클라이언트 설정
   
   a) 서버 클라이언트 (src/lib/supabase/server.ts)
   ```typescript
   import { createServerClient, type CookieOptions } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   
   export function createClient() {
     const cookieStore = cookies()
   
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return cookieStore.get(name)?.value
           },
         },
       }
     )
   }
   ```
   
   b) 클라이언트 클라이언트 (src/lib/supabase/client.ts)
   ```typescript
   import { createBrowserClient } from '@supabase/ssr'
   
   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```

5. 데이터베이스 스키마 설계
   
   Supabase Dashboard → SQL Editor → New query
   
   a) calculations 테이블
   ```sql
   -- 계산 기록 테이블
   CREATE TABLE calculations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     calculator_type VARCHAR(50) NOT NULL,
     title VARCHAR(255),
     input_data JSONB NOT NULL,
     result_data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
   );
   
   -- 인덱스 생성 (빠른 검색을 위해)
   CREATE INDEX idx_calculations_user_id ON calculations(user_id);
   CREATE INDEX idx_calculations_type ON calculations(calculator_type);
   CREATE INDEX idx_calculations_created_at ON calculations(created_at DESC);
   
   -- updated_at 자동 업데이트 트리거
   CREATE OR REPLACE FUNCTION update_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = TIMEZONE('utc', NOW());
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER update_calculations_updated_at
   BEFORE UPDATE ON calculations
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at();
   ```
   
   b) Row Level Security (RLS) 설정
   ```sql
   -- RLS 활성화
   ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
   
   -- 정책 1: 사용자는 자신의 계산만 조회
   CREATE POLICY "Users can view own calculations"
     ON calculations
     FOR SELECT
     USING (auth.uid() = user_id);
   
   -- 정책 2: 사용자는 자신의 계산만 추가
   CREATE POLICY "Users can insert own calculations"
     ON calculations
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   
   -- 정책 3: 사용자는 자신의 계산만 수정
   CREATE POLICY "Users can update own calculations"
     ON calculations
     FOR UPDATE
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   
   -- 정책 4: 사용자는 자신의 계산만 삭제
   CREATE POLICY "Users can delete own calculations"
     ON calculations
     FOR DELETE
     USING (auth.uid() = user_id);
   ```

6. 인증 컴포넌트 구현
   
   a) 인증 페이지 (src/app/auth/page.tsx)
   ```typescript
   'use client'
   
   import { Auth } from '@supabase/auth-ui-react'
   import { ThemeSupa } from '@supabase/auth-ui-shared'
   import { createClient } from '@/lib/supabase/client'
   
   export default function AuthPage() {
     const supabase = createClient()
     
     return (
       <div className="container mx-auto px-4 py-16">
         <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
           <h1 className="text-3xl font-bold mb-6 text-center">
             로그인 / 회원가입
           </h1>
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
                   password_input_placeholder: '비밀번호',
                 },
                 sign_up: {
                   email_label: '이메일',
                   password_label: '비밀번호',
                   button_label: '회원가입',
                   loading_button_label: '가입 중...',
                   email_input_placeholder: 'your@email.com',
                   password_input_placeholder: '비밀번호',
                 },
               },
             }}
             theme="light"
             redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
           />
         </div>
       </div>
     )
   }
   ```
   
   b) Auth 콜백 (src/app/auth/callback/route.ts)
   ```typescript
   import { NextResponse } from 'next/server'
   import { createClient } from '@/lib/supabase/server'
   
   export async function GET(request: Request) {
     const requestUrl = new URL(request.url)
     const code = requestUrl.searchParams.get('code')
     
     if (code) {
       const supabase = createClient()
       await supabase.auth.exchangeCodeForSession(code)
     }
     
     return NextResponse.redirect(new URL('/', requestUrl.origin))
   }
   ```
   
   c) 인증 상태 Provider (src/components/AuthProvider.tsx)
   ```typescript
   'use client'
   
   import { createContext, useContext, useEffect, useState } from 'react'
   import { User } from '@supabase/supabase-js'
   import { createClient } from '@/lib/supabase/client'
   
   interface AuthContextType {
     user: User | null
     loading: boolean
   }
   
   const AuthContext = createContext<AuthContextType>({
     user: null,
     loading: true,
   })
   
   export function AuthProvider({ children }: { children: React.ReactNode }) {
     const [user, setUser] = useState<User | null>(null)
     const [loading, setLoading] = useState(true)
     const supabase = createClient()
   
     useEffect(() => {
       // 현재 세션 확인
       supabase.auth.getSession().then(({ data: { session } }) => {
         setUser(session?.user ?? null)
         setLoading(false)
       })
   
       // 인증 상태 변경 감지
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (event, session) => {
           setUser(session?.user ?? null)
           setLoading(false)
         }
       )
   
       return () => subscription.unsubscribe()
     }, [supabase])
   
     return (
       <AuthContext.Provider value={{ user, loading }}>
         {children}
       </AuthContext.Provider>
     )
   }
   
   export const useAuth = () => useContext(AuthContext)
   ```
   
   d) 레이아웃에 AuthProvider 추가 (src/app/layout.tsx)
   ```typescript
   import { AuthProvider } from '@/components/AuthProvider'
   
   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="ko">
         <body className={inter.className}>
           <AuthProvider>
             <Analytics />
             <Header />
             <main className="min-h-screen">{children}</main>
             <Footer />
           </AuthProvider>
         </body>
       </html>
     )
   }
   ```

7. OAuth 제공자 설정 (Google & GitHub)

   Google과 GitHub 로그인을 사용하려면 각 제공자를 설정해야 합니다.
   
   **공통 설정 (먼저 수행)**
   
   Supabase 대시보드에서:
   - Authentication → URL Configuration
   - Site URL: `http://localhost:3000` (개발 환경) 또는 프로덕션 URL
   - Redirect URLs에 다음 추가:
     - `http://localhost:3000/auth/callback` (개발 환경)
     - `https://your-domain.com/auth/callback` (프로덕션 환경)
   
   ---
   
   **a) Google OAuth 설정**
   
   Step 1: Google Cloud Console에서 OAuth 클라이언트 생성
   
   1. https://console.cloud.google.com 접속
   2. 상단 프로젝트 선택 드롭다운에서 프로젝트 선택 (예: "easy-count")
     - 프로젝트가 없다면 "새 프로젝트"를 생성하세요
   
   3. 왼쪽 사이드바(탐색 메뉴)에서 다음 경로를 따라가세요:
      - **"API 및 서비스"** (또는 "APIs & Services") 클릭
      - "API 및 서비스" 메뉴가 펼쳐지면 아래 하위 메뉴가 보입니다
      - 하위 메뉴 중 **"사용자 인증 정보"** (또는 "Credentials") 클릭
     * 참고: 왼쪽 사이드바에서 "API 및 서비스"를 클릭하면 메인 화면이 표시되고, 
       그 아래 하위 메뉴에서 "사용자 인증 정보"를 클릭하면 OAuth 설정 페이지로 이동합니다
   
   4. 상단 **"+ 사용자 인증 정보 만들기"** (또는 "+ CREATE CREDENTIALS") 버튼 클릭
   5. 드롭다운 메뉴에서 **"OAuth 클라이언트 ID"** (또는 "OAuth client ID") 선택
   
   6. 만약 처음 설정하는 경우, "OAuth 동의 화면 구성" (또는 "Configure consent screen") 메시지가 표시됩니다
     - **"OAuth 동의 화면 구성"** 버튼 클릭
     - 사용자 유형: **"외부"** (또는 "External") 선택 → **"만들기"** (또는 "CREATE") 클릭
     - 앱 정보 입력:
       * 앱 이름: `Easy Count` (또는 원하는 이름)
       * 사용자 지원 이메일: 본인 이메일 선택
       * 앱 로고: 선택사항 (나중에 추가 가능)
       * 개발자 연락처 정보: 본인 이메일 입력
     - **"저장 후 계속"** (또는 "SAVE AND CONTINUE") 클릭
     - 범위(Scopes): 기본값 유지 → **"저장 후 계속"** 클릭
     - 테스트 사용자: 본인 이메일 추가 (선택사항) → **"저장 후 계속"** 클릭
     - 요약 확인 → **"대시보드로 돌아가기"** (또는 "BACK TO DASHBOARD") 클릭
   
   7. 다시 **"사용자 인증 정보"** 페이지로 돌아가서:
     - **"+ 사용자 인증 정보 만들기"** → **"OAuth 클라이언트 ID"** 선택
   
   8. 애플리케이션 유형: **"웹 애플리케이션"** (또는 "Web application") 선택
   
   9. 이름: `Easy Count Web` (또는 원하는 이름) 입력
   
   10. 승인된 리디렉션 URI에 다음 추가:
       - **"+ URI 추가"** (또는 "+ ADD URI") 버튼 클릭
       - Supabase에서 복사한 Callback URL 입력:
         ```
         https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
         ```
         (예: `https://gewhnzsljwravvrxryny.supabase.co/auth/v1/callback`)
         * YOUR_PROJECT_ID는 Supabase 대시보드 → Settings → API에서 확인 가능
         * 또는 Supabase의 Google OAuth 설정 페이지에 표시된 "Callback URL"을 그대로 사용
   
   11. **"만들기"** (또는 "CREATE") 버튼 클릭
   
   12. 팝업 창에 생성된 **Client ID**와 **Client Secret** (클라이언트 보안 비밀번호)이 표시됩니다
      - **Client ID**: 예) `123456789-abcdefg.apps.googleusercontent.com` 형식의 문자열
      - **Client Secret**: 예) `GOCSPX-abcdefghijklmnopqrstuvwxyz` 형식의 문자열
      - 두 값을 모두 복사하여 안전한 곳에 보관하세요
      - ⚠️ **Client Secret은 한 번만 표시되므로 반드시 복사해두세요!**
      - 만약 Client Secret을 잃어버렸다면, Google Cloud Console에서 새로운 Secret을 생성해야 합니다
   
   Step 2: Supabase에서 Callback URL 확인
   
   Google OAuth 설정을 위해 먼저 Supabase의 Callback URL을 확인해야 합니다.
   
   1. Supabase 대시보드 접속: https://app.supabase.com
   2. 프로젝트 선택
   3. 왼쪽 사이드바에서 **Authentication** 클릭
   4. 상단 메뉴에서 **Providers** 탭 클릭
   5. **Google** 제공자 카드 클릭 (또는 "Google" 옆의 설정 아이콘 클릭)
   6. Google 설정 페이지가 열리면 아래로 스크롤하여 **"Callback URL (for OAuth)"** 섹션 찾기
   7. Callback URL 필드에 다음과 같은 URL이 표시됩니다:
      ```
      https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
      ```
      (예: `https://gewhnzsljwravvrxryny.supabase.co/auth/v1/callback`)
   8. 이 URL을 복사하거나 오른쪽의 **"Copy"** 버튼을 클릭하여 복사
   
   **다른 방법: Settings에서 확인**
   
   - Supabase 대시보드 → **Settings** (왼쪽 사이드바 하단)
   - **API** 메뉴 클릭
   - **Project URL** 확인 (예: `https://gewhnzsljwravvrxryny.supabase.co`)
   - Callback URL은 `{Project URL}/auth/v1/callback` 형식입니다
   
   ---
   
   Step 3: Supabase에 Google OAuth 설정
   
   1. Supabase 대시보드 → **Authentication** → **Providers**
   2. **Google** 선택
   3. **Enable Sign in with Google** 토글을 **ON**으로 변경
   4. **Client IDs** 필드에 Google Cloud Console Step 1-12에서 복사한 **Client ID** 입력
      - 예: `123456789-abcdefg.apps.googleusercontent.com`
   5. **Client Secret (for OAuth)** 필드에 Google Cloud Console Step 1-12에서 복사한 **Client Secret** (클라이언트 보안 비밀번호) 입력
      - 예: `GOCSPX-abcdefghijklmnopqrstuvwxyz`
      - ⚠️ 이것이 Google Cloud Console에서 생성한 "클라이언트 보안 비밀번호"입니다
   6. **Callback URL (for OAuth)** 필드에 표시된 URL 확인
      - 이 URL을 Google Cloud Console의 **Authorized redirect URIs**에 정확히 동일하게 입력해야 합니다
      - URL 끝의 슬래시(/)까지 정확히 일치해야 합니다
   7. **Save** 버튼 클릭
   
   **설정 확인:**
   - Client IDs: Google Cloud Console에서 복사한 Client ID
   - Client Secret (for OAuth): Google Cloud Console에서 복사한 Client Secret (클라이언트 보안 비밀번호)
   - Callback URL: Supabase에서 자동으로 생성된 URL (Step 2에서 확인한 URL)
   
   ---
   
   **b) GitHub OAuth 설정**
   
   Step 1: GitHub에서 OAuth App 생성
   
   1. https://github.com 접속 후 로그인
   2. 우측 상단 프로필 클릭 → **Settings** 클릭
   3. 왼쪽 메뉴 하단 → **Developer settings** 클릭
   4. **OAuth Apps** → **New OAuth App** 클릭
   5. 다음 정보 입력:
   - **Application name**: `Easy Count` (또는 원하는 이름)
   - **Homepage URL**: `http://localhost:3000` (개발) 또는 프로덕션 URL
   - **Authorization callback URL**: 
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
     (YOUR_PROJECT_ID는 Supabase 프로젝트 URL에서 확인 가능)
   6. **Register application** 클릭
   7. 생성된 페이지에서 **Client ID**와 **Client Secret** 복사
      - **Client Secret**은 **Generate a new client secret**을 클릭하여 생성할 수 있습니다
   
   Step 2: Supabase에 GitHub OAuth 설정
   
   1. Supabase 대시보드 → **Authentication** → **Providers**
   2. **GitHub** 선택
   3. **Enable Sign in with GitHub** 토글을 **ON**으로 변경
   4. **Client ID (for OAuth)** 필드에 Step 1에서 복사한 **Client ID** 입력
   5. **Client Secret (for OAuth)** 필드에 Step 1에서 복사한 **Client Secret** 입력
   6. **Callback URL (for OAuth)** 필드에 표시된 URL 확인
      - 이 URL이 GitHub OAuth App의 **Authorization callback URL**과 일치하는지 확인
   7. **Save** 버튼 클릭
   
   ---
   
   **설정 완료 확인**
   
   설정이 완료되면:
   1. 웹사이트의 `/auth` 페이지 접속
   2. Google 및 GitHub 로그인 버튼이 표시되는지 확인
   3. 각 버튼을 클릭하여 로그인이 정상적으로 작동하는지 테스트
   
   **문제 해결**
   
   - "redirect_uri_mismatch" 에러: 
     * Google Cloud Console 또는 GitHub OAuth App의 리디렉션 URI가 Supabase의 Callback URL과 정확히 일치하는지 확인
     * 공백이나 슬래시(/) 하나 차이도 오류를 발생시킬 수 있습니다
   
   - "invalid_client" 에러:
     * Client ID와 Client Secret이 정확하게 입력되었는지 확인
     * Client Secret이 만료되지 않았는지 확인 (GitHub의 경우)
   
   - 로그인 후 에러 페이지로 이동:
     * Supabase의 Site URL과 Redirect URLs이 올바르게 설정되었는지 확인

8. 헤더에 로그인 상태 표시 (src/components/Header.tsx)
   ```typescript
   'use client'
   
   import Link from 'next/link'
   import { useAuth } from './AuthProvider'
   import { createClient } from '@/lib/supabase/client'
   import Navigation from './Navigation'
   
   export default function Header() {
     const { user, loading } = useAuth()
     const supabase = createClient()
     
     const handleSignOut = async () => {
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
                 <div className="text-gray-400">로딩중...</div>
               ) : user ? (
                 <div className="flex items-center gap-4">
                   <Link href="/history" className="text-gray-700 hover:text-indigo-600">
                     기록
                   </Link>
                   <span className="text-sm text-gray-600">{user.email}</span>
                   <button
                     onClick={handleSignOut}
                     className="text-sm text-gray-700 hover:text-red-600"
                   >
                     로그아웃
                   </button>
                 </div>
               ) : (
                 <Link
                   href="/auth"
                   className="bg-indigo-600 text-white px-4 py-2 rounded-lg
                            hover:bg-indigo-700"
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
   ```

9. 계산 기록 저장/조회 함수 (src/lib/database/calculations.ts)
   ```typescript
   import { createClient } from '@/lib/supabase/client'
   
   export async function saveCalculation(
     calculatorType: string,
     title: string,
     inputData: any,
     resultData: any
   ) {
     const supabase = createClient()
     
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) throw new Error('로그인이 필요합니다')
     
     const { data, error } = await supabase
       .from('calculations')
       .insert({
         user_id: user.id,
         calculator_type: calculatorType,
         title,
         input_data: inputData,
         result_data: resultData,
       })
       .select()
       .single()
     
     if (error) throw error
     return data
   }
   
   export async function getCalculations(calculatorType?: string) {
     const supabase = createClient()
     
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) throw new Error('로그인이 필요합니다')
     
     let query = supabase
       .from('calculations')
       .select('*')
       .eq('user_id', user.id)
       .order('created_at', { ascending: false })
     
     if (calculatorType) {
       query = query.eq('calculator_type', calculatorType)
     }
     
     const { data, error } = await query
     if (error) throw error
     return data
   }
   
   export async function deleteCalculation(id: string) {
     const supabase = createClient()
     
     const { error } = await supabase
       .from('calculations')
       .delete()
       .eq('id', id)
     
     if (error) throw error
   }
   ```

10. 기록 페이지 (src/app/history/page.tsx)
   ```typescript
   'use client'
   
   import { useEffect, useState } from 'react'
   import { useAuth } from '@/components/AuthProvider'
   import { useRouter } from 'next/navigation'
   import { getCalculations, deleteCalculation } from '@/lib/database/calculations'
   import { formatDate } from '@/lib/utils/format'
   
   export default function HistoryPage() {
     const { user, loading } = useAuth()
     const router = useRouter()
     const [calculations, setCalculations] = useState<any[]>([])
     const [loadingData, setLoadingData] = useState(true)
     
     useEffect(() => {
       if (!loading && !user) {
         router.push('/auth')
       } else if (user) {
         loadData()
       }
     }, [user, loading, router])
     
     const loadData = async () => {
       try {
         const data = await getCalculations()
         setCalculations(data || [])
       } catch (error) {
         console.error('Error loading calculations:', error)
       } finally {
         setLoadingData(false)
       }
     }
     
     const handleDelete = async (id: string) => {
       if (!confirm('정말 삭제하시겠습니까?')) return
       
       try {
         await deleteCalculation(id)
         loadData()
       } catch (error) {
         console.error('Error deleting:', error)
         alert('삭제 실패')
       }
     }
     
     if (loading || loadingData) {
       return <div className="container mx-auto px-4 py-16 text-center">로딩중...</div>
     }
     
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-8">계산 기록</h1>
         
         {calculations.length === 0 ? (
           <div className="text-center text-gray-500 py-16">
             저장된 계산 기록이 없습니다.
           </div>
         ) : (
           <div className="space-y-4">
             {calculations.map((calc) => (
               <div key={calc.id} className="bg-white rounded-lg shadow p-6">
                 <div className="flex justify-between items-start">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                         {calc.calculator_type}
                       </span>
                       <span className="text-sm text-gray-500">
                         {formatDate(new Date(calc.created_at))}
                       </span>
                     </div>
                     <h3 className="font-semibold mb-2">{calc.title}</h3>
                     <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                       {JSON.stringify(calc.result_data, null, 2)}
                     </pre>
                   </div>
                   <button
                     onClick={() => handleDelete(calc.id)}
                     className="text-red-500 hover:text-red-700 ml-4"
                   >
                     🗑️ 삭제
                   </button>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
     )
   }
   ```

11. 계산기에 저장 기능 추가
    
    예: 디데이 계산기에 저장 버튼 추가
    ```typescript
    // src/components/calculators/DDayCalculator.tsx
    import { saveCalculation } from '@/lib/database/calculations'
    import { useAuth } from '@/components/AuthProvider'
    
    export default function DDayCalculator() {
      const { user } = useAuth()
      // ... 기존 코드 ...
      
      const handleSave = async () => {
        if (!user) {
          alert('로그인이 필요합니다!')
          return
        }
        
        if (!result) {
          alert('먼저 계산을 해주세요!')
          return
        }
        
        try {
          await saveCalculation(
            'dday',
            `디데이 계산 - ${startDate}`,
            { startDate },
            result
          )
          alert('저장되었습니다!')
        } catch (error) {
          console.error('Error:', error)
          alert('저장 실패')
        }
      }
      
      return (
        <div className="max-w-2xl mx-auto">
          {/* ... 기존 UI ... */}
          {result && user && (
            <button
              onClick={handleSave}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg
                       font-semibold hover:bg-green-700"
            >
              💾 저장하기
            </button>
          )}
        </div>
      )
    }
    ```

실행 및 테스트:
```bash
pnpm dev
```

