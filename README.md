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
   
   a) .env.local에 추가
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

7. 헤더에 로그인 상태 표시 (src/components/Header.tsx)
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

8. 계산 기록 저장/조회 함수 (src/lib/database/calculations.ts)
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

9. 기록 페이지 (src/app/history/page.tsx)
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

10. 계산기에 저장 기능 추가
    
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

