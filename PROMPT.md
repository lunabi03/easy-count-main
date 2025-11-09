# Lesson 08: Vercel 배포 + 학점 계산기

## 🎯 학습 목표
- Vercel로 실제 배포하기
- 환경 변수 관리하기
- 프로덕션 최적화하기
- 도메인 연결 이해하기
- Analytics 설정하기
- GPA 계산기 추가하기

## 📚 배울 내용
1. 로컬 vs 프로덕션 환경
2. 환경 변수의 중요성
3. Vercel 배포 프로세스
4. 성능 최적화 설정
5. 모니터링 도구
6. 학점 계산 로직

## 🚀 실습 프롬프트

```
lesson-08 폴더에 Lesson 07을 복사하고 Vercel에 배포 준비를 하며 
GPA 계산기를 추가하세요.

요구사항:

1. 프로젝트 준비
   ```bash
   cp -r lesson-07 lesson-08
   cd lesson-08
   pnpm install
   ```

2. 환경 변수 설정
   
   a) .env.example 파일 생성
   ```env
   # 이 파일을 복사해서 .env.local 생성
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
   
   b) .env.local 파일 생성 (Git에 커밋하지 않음!)
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_GA_ID=G-YOUR-REAL-GA-ID
   ```
   
   c) .gitignore 확인
   ```
   # See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
   
   # dependencies
   /node_modules
   /.pnp
   .pnp.js
   
   # testing
   /coverage
   
   # next.js
   /.next/
   /out/
   
   # production
   /build
   
   # misc
   .DS_Store
   *.pem
   
   # debug
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   pnpm-debug.log*
   
   # local env files
   .env*.local
   .env.production
   
   # vercel
   .vercel
   
   # typescript
   *.tsbuildinfo
   next-env.d.ts
   ```

3. next.config.js 최적화
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // 이미지 최적화
     images: {
       formats: ['image/webp', 'image/avif'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
     },
     
     // 압축 활성화
     compress: true,
     
     // 성능 최적화
     swcMinify: true,
     
     // 보안 헤더
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'X-DNS-Prefetch-Control',
               value: 'on'
             },
             {
               key: 'X-Frame-Options',
               value: 'DENY'
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff'
             },
             {
               key: 'Referrer-Policy',
               value: 'origin-when-cross-origin'
             },
           ],
         },
       ]
     },
     
     // PWA 지원 준비 (선택사항)
     // experimental: {
     //   pwa: true,
     // },
   }
   
   module.exports = nextConfig
   ```

4. Google Analytics 설정 (선택사항)
   
   a) Google Analytics 컴포넌트 생성 (src/components/Analytics.tsx)
   ```typescript
   'use client'
   
   import Script from 'next/script'
   
   export default function Analytics() {
     const GA_ID = process.env.NEXT_PUBLIC_GA_ID
     
     if (!GA_ID) return null
     
     return (
       <>
         <Script
           strategy="afterInteractive"
           src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
         />
         <Script id="google-analytics" strategy="afterInteractive">
           {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${GA_ID}');
           `}
         </Script>
       </>
     )
   }
   ```
   
   b) 레이아웃에 추가 (src/app/layout.tsx)
   ```typescript
   import Analytics from '@/components/Analytics'
   
   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="ko">
         <body className={inter.className}>
           <Analytics />
           <Header />
           <main className="min-h-screen">{children}</main>
           <Footer />
         </body>
       </html>
     )
   }
   ```

5. GPA 계산기 추가
   
   a) 타입 정의 (src/types/index.ts에 추가)
   ```typescript
   export interface Course {
     id: string;
     name: string;
     credit: number;
     grade: string;
   }
   
   export interface GPAResult {
     totalCredits: number;
     earnedCredits: number;
     gpa: number;
     totalGradePoints: number;
     letterGrade: string;
   }
   ```
   
   b) GPA 계산 로직 (src/lib/calculations/academic.ts)
   ```typescript
   import type { Course, GPAResult } from '@/types'
   
   // 학점을 점수로 변환
   export function gradeToPoint(grade: string): number {
     const gradeMap: { [key: string]: number } = {
       'A+': 4.5, 'A': 4.0,
       'B+': 3.5, 'B': 3.0,
       'C+': 2.5, 'C': 2.0,
       'D+': 1.5, 'D': 1.0,
       'F': 0.0,
       'P': 0.0, // Pass (학점 포함 안 됨)
     }
     return gradeMap[grade] ?? 0
   }
   
   // GPA 계산
   export function calculateGPA(courses: Course[]): GPAResult {
     let totalCredits = 0
     let earnedCredits = 0
     let totalGradePoints = 0
     
     courses.forEach(course => {
       // P(ass) 학점은 제외
       if (course.grade === 'P') {
         earnedCredits += course.credit
         return
       }
       
       const point = gradeToPoint(course.grade)
       totalCredits += course.credit
       totalGradePoints += point * course.credit
       
       // F가 아니면 이수 학점에 포함
       if (course.grade !== 'F') {
         earnedCredits += course.credit
       }
     })
     
     const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0
     
     // 평점을 등급으로 변환
     let letterGrade: string
     if (gpa >= 4.2) letterGrade = 'A+'
     else if (gpa >= 3.7) letterGrade = 'A'
     else if (gpa >= 3.2) letterGrade = 'B+'
     else if (gpa >= 2.7) letterGrade = 'B'
     else if (gpa >= 2.2) letterGrade = 'C+'
     else if (gpa >= 1.7) letterGrade = 'C'
     else if (gpa >= 1.2) letterGrade = 'D+'
     else if (gpa >= 0.7) letterGrade = 'D'
     else letterGrade = 'F'
     
     return {
       totalCredits,
       earnedCredits,
       gpa: Math.round(gpa * 100) / 100,
       totalGradePoints: Math.round(totalGradePoints * 100) / 100,
       letterGrade,
     }
   }
   ```
   
   c) GPA 페이지 (src/app/academic/gpa/page.tsx)
   ```typescript
   import type { Metadata } from 'next'
   import GPACalculator from '@/components/calculators/GPACalculator'
   
   export const metadata: Metadata = {
     title: '학점 계산기 - GPA 평점 계산',
     description: '과목별 학점과 성적을 입력하면 평균 학점(GPA)을 자동으로 계산해드립니다. 대학생 필수 도구!',
     keywords: ['학점계산기', 'GPA', '평점계산', '대학교', '성적'],
   }
   
   export default function GPAPage() {
     return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-8 text-center">
           📚 학점 계산기 (GPA)
         </h1>
         <GPACalculator />
       </div>
     )
   }
   ```
   
   d) GPA 계산기 컴포넌트 (src/components/calculators/GPACalculator.tsx)
   ```typescript
   'use client'
   
   import { useState } from 'react'
   import { calculateGPA, gradeToPoint } from '@/lib/calculations/academic'
   import type { Course, GPAResult } from '@/types'
   
   export default function GPACalculator() {
     const [courses, setCourses] = useState<Course[]>([
       { id: '1', name: '', credit: 3, grade: 'A' }
     ])
     const [result, setResult] = useState<GPAResult | null>(null)
     
     const addCourse = () => {
       setCourses([...courses, {
         id: Date.now().toString(),
         name: '',
         credit: 3,
         grade: 'A'
       }])
     }
     
     const removeCourse = (id: string) => {
       if (courses.length > 1) {
         setCourses(courses.filter(c => c.id !== id))
       }
     }
     
     const updateCourse = (id: string, field: keyof Course, value: any) => {
       setCourses(courses.map(c =>
         c.id === id ? { ...c, [field]: value } : c
       ))
     }
     
     const handleCalculate = () => {
       const calculated = calculateGPA(courses)
       setResult(calculated)
     }
     
     const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'P']
     
     return (
       <div className="max-w-4xl mx-auto">
         <div className="bg-white rounded-2xl shadow-lg p-8">
           <div className="space-y-4 mb-6">
             {courses.map((course, index) => (
               <div key={course.id} className="grid grid-cols-12 gap-4 items-center">
                 <div className="col-span-1 text-center font-semibold">
                   {index + 1}
                 </div>
                 <div className="col-span-5">
                   <input
                     type="text"
                     value={course.name}
                     onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                     placeholder="과목명"
                     className="w-full px-3 py-2 border rounded-lg"
                   />
                 </div>
                 <div className="col-span-2">
                   <input
                     type="number"
                     value={course.credit}
                     onChange={(e) => updateCourse(course.id, 'credit', parseInt(e.target.value))}
                     min="1"
                     max="6"
                     className="w-full px-3 py-2 border rounded-lg"
                   />
                 </div>
                 <div className="col-span-3">
                   <select
                     value={course.grade}
                     onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                     className="w-full px-3 py-2 border rounded-lg"
                   >
                     {grades.map(g => (
                       <option key={g} value={g}>{g} ({gradeToPoint(g)})</option>
                     ))}
                   </select>
                 </div>
                 <div className="col-span-1">
                   <button
                     onClick={() => removeCourse(course.id)}
                     className="text-red-500 hover:text-red-700"
                     disabled={courses.length === 1}
                   >
                     🗑️
                   </button>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="flex gap-4 mb-6">
             <button
               onClick={addCourse}
               className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg
                        font-semibold hover:bg-gray-300"
             >
               + 과목 추가
             </button>
             <button
               onClick={handleCalculate}
               className="flex-1 bg-indigo-600 text-white py-3 rounded-lg
                        font-semibold hover:bg-indigo-700"
             >
               학점 계산하기
             </button>
           </div>
           
           {result && (
             <div className="mt-8 border-t pt-6">
               <div className="text-center mb-6">
                 <div className="text-6xl font-bold text-indigo-600 mb-2">
                   {result.gpa}
                 </div>
                 <div className="text-2xl font-semibold text-gray-600">
                   {result.letterGrade} 등급
                 </div>
               </div>
               
               <div className="grid grid-cols-3 gap-4">
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                   <div className="text-sm text-gray-600 mb-1">신청 학점</div>
                   <div className="text-2xl font-semibold">{result.totalCredits}</div>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                   <div className="text-sm text-gray-600 mb-1">취득 학점</div>
                   <div className="text-2xl font-semibold">{result.earnedCredits}</div>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                   <div className="text-sm text-gray-600 mb-1">총 평점</div>
                   <div className="text-2xl font-semibold">{result.totalGradePoints}</div>
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     )
   }
   ```

6. Vercel 배포 단계
   
   Step 1: GitHub에 코드 푸시
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/easy-count.git
   git push -u origin main
   ```
   
   Step 2: Vercel 계정 생성
   - https://vercel.com 접속
   - GitHub 계정으로 가입
   
   Step 3: 프로젝트 Import
   - "New Project" 클릭
   - GitHub 저장소 선택
   - Framework Preset: Next.js (자동 인식)
   
   Step 4: 환경 변수 설정
   - Environment Variables에 추가:
     * NEXT_PUBLIC_SITE_URL: https://your-project.vercel.app
     * NEXT_PUBLIC_GA_ID: G-YOUR-GA-ID
   
   Step 5: 배포
   - "Deploy" 버튼 클릭
   - 2-3분 대기
   - 배포 완료!

7. 배포 후 확인 사항
   ```bash
   # 로컬에서 프로덕션 빌드 테스트
   pnpm build
   pnpm start
   ```
   
   확인 항목:
   - [ ] 모든 페이지가 정상 작동하는가?
   - [ ] sitemap.xml 접근 가능한가?
   - [ ] robots.txt 접근 가능한가?
   - [ ] 이미지가 최적화되어 로드되는가?
   - [ ] 모바일에서도 잘 보이는가?

8. Google Search Console 등록
   ```
   1. https://search.google.com/search-console 접속
   2. 속성 추가 → URL 접두어 입력
   3. 소유권 확인 (HTML 태그 또는 DNS)
   4. sitemap.xml 제출:
      https://your-domain.vercel.app/sitemap.xml
   ```

9. Naver Search Advisor 등록
   ```
   1. https://searchadvisor.naver.com 접속
   2. 웹마스터 도구 → 사이트 등록
   3. 사이트 소유 확인
   4. 사이트맵 제출
   ```

배포 URL 예시:
https://easy-count.vercel.app
```

## ✅ 완성 확인 사항

- [ ] 프로덕션 빌드가 성공하는가?
- [ ] Vercel에 배포되었는가?
- [ ] 배포된 사이트가 정상 작동하는가?
- [ ] GPA 계산기가 정상 작동하는가?
- [ ] Google Analytics가 작동하는가? (선택)
- [ ] sitemap.xml이 접근 가능한가?

## 🚀 성능 최적화 팁

### Lighthouse 점수 확인
1. Chrome 개발자 도구 (F12)
2. Lighthouse 탭
3. "Generate report" 클릭
4. 90점 이상 목표!

### Core Web Vitals
- LCP (Largest Contentful Paint): 2.5초 이내
- FID (First Input Delay): 100ms 이내
- CLS (Cumulative Layout Shift): 0.1 이하

## ⏭️ 다음 단계
Lesson 09에서는 Supabase로 회원가입 및 계산 기록 저장 기능을 구현합니다!

