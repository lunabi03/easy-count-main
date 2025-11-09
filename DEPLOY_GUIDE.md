# Vercel 배포 가이드

## 1단계: GitHub 저장소 준비

### 1-1. Git 저장소 초기화 및 첫 커밋

PowerShell에서 다음 명령어를 순서대로 실행하세요:

```powershell
# lesson-08 폴더로 이동
cd C:\Projects\web-easy-count-main\lesson-08

# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Easy Count 계산기 앱"

# 기본 브랜치를 main으로 설정
git branch -M main
```

### 1-2. GitHub에 새 저장소 생성

1. https://github.com 접속
2. 로그인 후 우측 상단 **+** 버튼 클릭
3. **New repository** 선택
4. 저장소 설정:
   - **Repository name**: `easy-count` (또는 원하는 이름)
   - **Description**: `일상생활 계산기 모음`
   - **Public** 또는 **Private** 선택 (Public 권장)
   - **❌ Add a README file 체크 해제** (이미 파일이 있으므로)
   - **❌ Add .gitignore 체크 해제**
   - **❌ Choose a license 체크 해제**
5. **Create repository** 버튼 클릭

### 1-3. GitHub에 코드 푸시

GitHub 저장소 생성 후 나오는 화면에서 **"…or push an existing repository from the command line"** 섹션의 명령어를 복사하거나, 아래 명령어를 사용:

```powershell
# GitHub 저장소 주소를 본인의 것으로 변경하세요!
# 예: https://github.com/your-username/easy-count.git

git remote add origin https://github.com/YOUR_USERNAME/easy-count.git
git push -u origin main
```

**참고**: 
- `YOUR_USERNAME`을 본인의 GitHub 사용자명으로 변경하세요
- GitHub 인증이 필요하면 브라우저에서 로그인하거나 Personal Access Token을 사용하세요

---

## 2단계: Vercel 계정 생성

### 2-1. Vercel 가입

1. https://vercel.com 접속
2. **Sign Up** 클릭
3. **Continue with GitHub** 선택 (GitHub 계정으로 가입 권장)
4. GitHub 인증 완료

---

## 3단계: 프로젝트 배포

### 3-1. 새 프로젝트 생성

1. Vercel 대시보드에서 **Add New...** → **Project** 클릭
2. **Import Git Repository** 섹션에서 방금 만든 GitHub 저장소 찾기
   - 저장소가 보이지 않으면 **Configure GitHub App** 클릭하여 권한 허용
3. 저장소 선택 후 **Import** 클릭

### 3-2. 프로젝트 설정

다음 정보를 확인/설정:

**Framework Preset**
- ✅ **Next.js** (자동 인식됨)

**Root Directory**
- 기본값 유지 (`.`)

**Build Command**
- 기본값: `next build` (변경 불필요)

**Output Directory**
- 기본값: `.next` (변경 불필요)

**Install Command**
- 기본값: `pnpm install` (변경 불필요)

**Environment Variables**
- 나중에 설정 가능 (3-4단계 참고)

### 3-3. 배포 시작

1. **Deploy** 버튼 클릭
2. 2-3분 대기 (빌드 진행 중)
3. 배포 완료!

---

## 4단계: 환경 변수 설정 (선택사항)

Google Analytics를 사용하려면:

### 4-1. Google Analytics 설정

1. https://analytics.google.com 접속
2. 계정 생성 및 속성 추가
3. 측정 ID 확인 (예: `G-XXXXXXXXXX`)

### 4-2. Vercel에 환경 변수 추가

1. Vercel 대시보드에서 배포된 프로젝트 선택
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Environment Variables** 클릭
4. 다음 변수 추가:

   **변수 1:**
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://your-project-name.vercel.app` (실제 배포 URL로 변경)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **변수 2 (선택):**
   - Key: `NEXT_PUBLIC_GA_ID`
   - Value: `G-XXXXXXXXXX` (Google Analytics 측정 ID)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **Save** 클릭
6. **Redeploy** 클릭하여 변경사항 반영

---

## 5단계: 배포 확인

### 5-1. 배포 상태 확인

1. Vercel 대시보드에서 프로젝트 클릭
2. **Deployments** 탭에서 배포 상태 확인
   - ✅ **Ready**: 배포 성공
   - ❌ **Error**: 오류 확인 필요

### 5-2. 사이트 접속 확인

1. 배포 완료 후 생성된 URL 클릭
   - 예: `https://easy-count-abc123.vercel.app`
2. 모든 페이지가 정상 작동하는지 확인:
   - 홈페이지 (`/`)
   - 디데이 계산기 (`/date/dday`)
   - 생일 계산기 (`/date/birthday`)
   - 연봉 계산기 (`/salary`)
   - 쇼핑 계산기 (`/shopping`)
   - BMI 계산기 (`/health/bmi`)
   - GPA 계산기 (`/academic/gpa`)
3. Sitemap 확인: `https://your-url.vercel.app/sitemap.xml`
4. Robots.txt 확인: `https://your-url.vercel.app/robots.txt`

---

## 6단계: 커스텀 도메인 연결 (선택사항)

### 6-1. 도메인 추가

1. Vercel 프로젝트 → **Settings** → **Domains**
2. 원하는 도메인 입력 (예: `easycount.com`)
3. **Add** 클릭
4. DNS 설정 안내 따라하기

---

## 7단계: 자동 배포 확인

이제부터는:
- GitHub에 코드를 푸시하면
- Vercel이 자동으로 감지하여
- 새 버전을 배포합니다!

**테스트 방법:**
```powershell
# 코드 수정 후
git add .
git commit -m "Update: 새로운 기능 추가"
git push

# Vercel이 자동으로 배포 시작!
```

---

## 🐛 문제 해결

### 빌드 오류가 발생하면?

1. **로컬에서 먼저 테스트:**
   ```powershell
   pnpm build
   ```
   
2. **Vercel 로그 확인:**
   - 프로젝트 → Deployments → 실패한 배포 클릭 → **View Function Logs**

### 환경 변수가 작동하지 않으면?

- 환경 변수 추가 후 **반드시 Redeploy 필요**
- 변수명 앞에 `NEXT_PUBLIC_` 접두사 확인

### 도메인 연결이 안 되면?

- DNS 설정이 완료되었는지 확인
- 24-48시간 소요될 수 있음

---

## 📚 유용한 링크

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Google Analytics 설정](https://support.google.com/analytics/answer/9304153)

