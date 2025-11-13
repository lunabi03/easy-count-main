/**
 * 크롤러 스크립트
 * 이 스크립트는 API 엔드포인트를 호출하여 크롤링을 실행합니다.
 * 
 * 사용법:
 * - 로컬: pnpm crawl (개발 서버가 실행 중이어야 함)
 * - 또는 직접 API 호출: curl http://localhost:3000/api/crawl
 */

async function main() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/crawl`

    console.log('크롤링 API 호출:', apiUrl)
    console.log('시작 시간:', new Date().toISOString())

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ 크롤링 완료!')
      console.log('수집된 항목 수:', result.data.count)
      console.log('날짜:', result.data.date)
      console.log('타임스탬프:', result.data.timestamp)
      process.exit(0)
    } else {
      console.error('❌ 크롤링 실패:', result.message)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    console.error('개발 서버가 실행 중인지 확인하세요: pnpm dev')
    process.exit(1)
  }
}

main()

