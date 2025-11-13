import axios from 'axios'
import * as cheerio from 'cheerio'

export interface SuperKTSData {
  category: string
  title: string
  url: string
  description?: string
  lastUpdated?: Date
}

export interface CrawledData {
  date: string
  data: SuperKTSData[]
  timestamp: Date
}

/**
 * superkts.com/cal/ 사이트에서 데이터 수집
 */
export async function crawlSuperKTS(): Promise<CrawledData> {
  try {
    const response = await axios.get('https://superkts.com/cal/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(response.data)
    const data: SuperKTSData[] = []

    // 메인 카테고리별로 데이터 수집
    const categories = [
      { name: '나이/띠', selector: 'ul:contains("나이")' },
      { name: '날짜', selector: 'ul:contains("날짜")' },
      { name: '통계', selector: 'ul:contains("통계")' }
    ]

    // 메인 컨텐츠 영역에서 링크 수집
    $('body a').each((index, element) => {
      const $el = $(element)
      const href = $el.attr('href')
      const text = $el.text().trim()

      // 유효한 링크만 수집
      if (href && text && text.length > 0 && text.length < 100) {
        // 상대 경로를 절대 경로로 변환
        let fullUrl = href
        if (href.startsWith('/')) {
          fullUrl = `https://superkts.com${href}`
        } else if (!href.startsWith('http')) {
          fullUrl = `https://superkts.com/cal/${href}`
        } else if (!href.includes('superkts.com')) {
          // 외부 링크는 제외
          return
        }

        // 카테고리 판별
        let category = '기타'
        const lowerText = text.toLowerCase()
        
        if (lowerText.includes('나이') || lowerText.includes('띠') || lowerText.includes('만나이') || 
            lowerText.includes('성년') || lowerText.includes('동갑')) {
          category = '나이/띠'
        } else if (lowerText.includes('날짜') || lowerText.includes('디데이') || 
                   lowerText.includes('기념일') || lowerText.includes('음력') || 
                   lowerText.includes('양력') || lowerText.includes('100일')) {
          category = '날짜'
        } else if (lowerText.includes('통계') || lowerText.includes('인구') || 
                   lowerText.includes('임금') || lowerText.includes('로또')) {
          category = '통계'
        }

        // 중복 체크
        const exists = data.some(item => item.title === text && item.url === fullUrl)
        if (!exists) {
          data.push({
            category,
            title: text,
            url: fullUrl,
            lastUpdated: new Date()
          })
        }
      }
    })

    // 최종 중복 제거 (제목과 URL 기준)
    const uniqueData = Array.from(
      new Map(
        data.map(item => [`${item.title}-${item.url}`, item])
      ).values()
    )

    console.log(`수집 완료: ${uniqueData.length}개 항목`)

    return {
      date: new Date().toISOString().split('T')[0],
      data: uniqueData,
      timestamp: new Date()
    }
  } catch (error) {
    console.error('크롤링 오류:', error)
    throw new Error(`크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

/**
 * 특정 페이지의 상세 정보 수집
 */
export async function crawlPageDetail(url: string): Promise<Record<string, any>> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(response.data)
    const result: Record<string, any> = {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      content: $('main, .content, article').first().text().trim().substring(0, 1000)
    }

    return result
  } catch (error) {
    console.error(`페이지 상세 정보 수집 오류 (${url}):`, error)
    return {}
  }
}

