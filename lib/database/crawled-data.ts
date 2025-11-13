import { createClient } from '@/lib/supabase/server'
import type { CrawledData } from '@/lib/crawler/superkts'

/**
 * 수집된 데이터를 Supabase에 저장
 */
export async function saveCrawledData(data: CrawledData) {
  const supabase = createClient()

  const { data: result, error } = await supabase
    .from('crawled_data')
    .insert({
      date: data.date,
      data: data.data,
      timestamp: data.timestamp.toISOString()
    })
    .select()
    .single()

  if (error) {
    // 이미 해당 날짜의 데이터가 있으면 업데이트
    if (error.code === '23505') { // unique_violation
      const { data: updated, error: updateError } = await supabase
        .from('crawled_data')
        .update({
          data: data.data,
          timestamp: data.timestamp.toISOString()
        })
        .eq('date', data.date)
        .select()
        .single()

      if (updateError) throw updateError
      return updated
    }
    throw error
  }

  return result
}

/**
 * 수집된 데이터 조회
 */
export async function getCrawledData(date?: string) {
  const supabase = createClient()

  let query = supabase
    .from('crawled_data')
    .select('*')
    .order('date', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  } else {
    // 최신 데이터만 조회
    query = query.limit(1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * 특정 카테고리의 데이터 조회
 */
export async function getCrawledDataByCategory(category: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('crawled_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error

  if (data && data.data) {
    const filtered = (data.data as any[]).filter(
      (item: any) => item.category === category
    )
    return filtered
  }

  return []
}


