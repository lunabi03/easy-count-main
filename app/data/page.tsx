'use client'

import { useEffect, useState } from 'react'
import { getCrawledData } from '@/lib/database/crawled-data'
import type { SuperKTSData } from '@/lib/crawler/superkts'

export default function DataPage() {
  const [data, setData] = useState<SuperKTSData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data')
      const result = await response.json()

      if (result.success && result.data) {
        const crawledData = result.data[0]
        if (crawledData && crawledData.data) {
          setData(crawledData.data)
          setLastUpdated(
            new Date(crawledData.timestamp).toLocaleString('ko-KR')
          )
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCrawl = async () => {
    try {
      const response = await fetch('/api/crawl', { method: 'POST' })
      const result = await response.json()

      if (result.success) {
        alert('크롤링이 완료되었습니다!')
        loadData()
      } else {
        alert(`크롤링 실패: ${result.message}`)
      }
    } catch (error) {
      console.error('크롤링 오류:', error)
      alert('크롤링 중 오류가 발생했습니다.')
    }
  }

  const categories = ['전체', '나이/띠', '날짜', '통계', '기타']
  const filteredData =
    selectedCategory === '전체'
      ? data
      : data.filter(item => item.category === selectedCategory)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-black">
          📊 수집된 데이터
        </h1>
        <div className="flex items-center justify-between mb-4">
          <div>
            {lastUpdated && (
              <p className="text-sm text-gray-600">
                마지막 업데이트: {lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={handleCrawl}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            🔄 수동 갱신
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="text-gray-500">데이터를 불러오는 중...</div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-500 mb-4">수집된 데이터가 없습니다.</div>
          <button
            onClick={handleCrawl}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            데이터 수집 시작
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                원본 보기 →
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>총 {filteredData.length}개의 항목</p>
        <p className="mt-2">
          데이터는 매일 자정에 자동으로 갱신됩니다.
        </p>
      </div>
    </div>
  )
}


