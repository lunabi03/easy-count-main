import cron from 'node-cron'
import { crawlSuperKTS } from '@/lib/crawler/superkts'
import { saveCrawledData } from '@/lib/database/crawled-data'

let isRunning = false

/**
 * 매일 자정에 크롤링 실행
 */
export function startCrawlerJob() {
  // 매일 자정 (00:00)에 실행
  cron.schedule('0 0 * * *', async () => {
    if (isRunning) {
      console.log('크롤링 작업이 이미 실행 중입니다.')
      return
    }

    try {
      isRunning = true
      console.log('크롤링 작업 시작:', new Date().toISOString())

      const crawledData = await crawlSuperKTS()
      await saveCrawledData(crawledData)

      console.log('크롤링 작업 완료:', {
        date: crawledData.date,
        count: crawledData.data.length
      })
    } catch (error) {
      console.error('크롤링 작업 오류:', error)
    } finally {
      isRunning = false
    }
  })

  console.log('크롤링 스케줄러가 시작되었습니다. (매일 자정 실행)')
}

/**
 * 수동으로 크롤링 실행
 */
export async function runCrawlerManually() {
  if (isRunning) {
    throw new Error('크롤링 작업이 이미 실행 중입니다.')
  }

  try {
    isRunning = true
    const crawledData = await crawlSuperKTS()
    await saveCrawledData(crawledData)
    return crawledData
  } finally {
    isRunning = false
  }
}


