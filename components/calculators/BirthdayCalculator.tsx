'use client'

import { useState } from 'react'
import { calculateBirthday } from '@/lib/calculations/date'
import { formatNumber } from '@/lib/utils/format'
import { saveCalculation } from '@/lib/database/calculations'
import { useAuth } from '@/components/AuthProvider'
import type { BirthdayResult } from '@/types'

export default function BirthdayCalculator() {
  const { user } = useAuth()
  const [birthday, setBirthday] = useState('')
  const [result, setResult] = useState<BirthdayResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  // 생년월일 계산 버튼 클릭 시 수행
  const handleCalculate = () => {
    if (!birthday) {
      alert('생년월일을 입력해주세요!')
      return
    }
    
    const calculated = calculateBirthday(new Date(birthday))
    setResult(calculated)
  }

  // 계산 결과 저장 처리
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
      setSaving(true)
      await saveCalculation(
        'birthday',
        `살아온 날 계산 - ${birthday}`,
        { birthday },
        result
      )
      alert('저장되었습니다!')
    } catch (error) {
      console.error('Error:', error)
      alert('저장 실패')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            생년월일
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={handleCalculate}
          className="w-full bg-purple-600 text-white py-3 rounded-lg
                   font-semibold hover:bg-purple-700 transition-colors"
        >
          살아온 날 계산하기
        </button>
        
        {result && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-center mb-4">
              🎂 당신은 지금까지...
            </h3>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg space-y-3">
              <p className="text-lg">
                📅 총 <strong className="text-purple-600 text-2xl">{formatNumber(result.totalDays)}일</strong>을 살았습니다
              </p>
              <p className="text-lg">
                📆 약 <strong className="text-purple-600 text-2xl">{formatNumber(result.totalWeeks)}주</strong>를 살았습니다
              </p>
              <p className="text-lg">
                🗓️ 약 <strong className="text-purple-600 text-2xl">{result.totalMonths}개월</strong>을 살았습니다
              </p>
              <p className="text-lg">
                🎉 약 <strong className="text-purple-600 text-2xl">{result.totalYears}년</strong>을 살았습니다
              </p>
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center font-semibold">
              다음 생일까지 {result.daysToNextBirthday}일 남았습니다! 🎂
            </div>
            {user && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? '저장 중...' : '💾 계산 결과 저장'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

