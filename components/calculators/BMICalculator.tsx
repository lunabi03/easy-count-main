'use client'

import { useState } from 'react'
import { calculateBMI } from '@/lib/calculations/health'
import { saveCalculation } from '@/lib/database/calculations'
import { useAuth } from '@/components/AuthProvider'
import type { BMIResult } from '@/types'

export default function BMICalculator() {
  const { user } = useAuth()
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<BMIResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  // BMI 계산 수행
  const handleCalculate = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    
    if (!h || h <= 0 || !w || w <= 0) {
      alert('키와 몸무게를 올바르게 입력해주세요!')
      return
    }
    
    const calculated = calculateBMI(h, w)
    setResult(calculated)
  }
  
  const getStatusColor = (status: BMIResult['status']) => {
    const colors = {
      underweight: 'bg-blue-100 text-blue-800',
      normal: 'bg-green-100 text-green-800',
      overweight: 'bg-yellow-100 text-yellow-800',
      obese: 'bg-red-100 text-red-800',
    } as const
    return colors[status]
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
        'bmi',
        `BMI 계산 - 키 ${height}cm, 몸무게 ${weight}kg`,
        {
          height: Number(height),
          weight: Number(weight)
        },
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-black font-medium mb-2">
              키 (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-black font-medium mb-2">
              몸무게 (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={handleCalculate}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg
                   font-semibold hover:bg-indigo-700 transition-colors"
        >
          BMI 계산하기
        </button>
        
        {result && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {result.bmi}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold
                            ${getStatusColor(result.status)}`}>
                {result.category}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-black mb-1">적정 체중 범위</div>
                <div className="font-semibold">
                  {result.healthyWeightRange.min}kg ~ {result.healthyWeightRange.max}kg
                </div>
              </div>
              
              {result.weightDifference > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="font-medium text-yellow-800">
                    {result.status === 'underweight' 
                      ? `${result.weightDifference}kg 증량 권장`
                      : `${result.weightDifference}kg 감량 권장`
                    }
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  💡 {result.recommendation}
                </div>
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
          </div>
        )}
      </div>
    </div>
  )
}

