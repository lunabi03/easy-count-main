import { NextResponse } from 'next/server'
import { crawlSuperKTS } from '@/lib/crawler/superkts'
import { saveCrawledData } from '@/lib/database/crawled-data'

/**
 * 수동으로 크롤링 실행하는 API
 * GET /api/crawl - 크롤링 실행
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // 크롤링 실행
    const crawledData = await crawlSuperKTS()

    // 데이터베이스에 저장
    await saveCrawledData(crawledData)

    return NextResponse.json({
      success: true,
      message: '크롤링 완료',
      data: {
        date: crawledData.date,
        count: crawledData.data.length,
        timestamp: crawledData.timestamp
      }
    })
  } catch (error) {
    console.error('크롤링 API 오류:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '크롤링 실패'
      },
      { status: 500 }
    )
  }
}

/**
 * POST 요청으로도 크롤링 실행 가능
 */
export async function POST(request: Request) {
  return GET(request)
}


