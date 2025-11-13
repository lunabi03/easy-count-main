import { NextResponse } from 'next/server'
import { getCrawledData } from '@/lib/database/crawled-data'

/**
 * 수집된 데이터 조회 API
 * GET /api/data?date=2025-01-01 - 특정 날짜의 데이터 조회
 * GET /api/data - 최신 데이터 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || undefined

    const data = await getCrawledData(date)

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('데이터 조회 오류:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '데이터 조회 실패'
      },
      { status: 500 }
    )
  }
}


