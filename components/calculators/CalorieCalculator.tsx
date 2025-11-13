'use client'

import { useState } from 'react'
import { calculateCalories } from '@/lib/calculations/health'
import { saveCalculation } from '@/lib/database/calculations'
import { useAuth } from '@/components/AuthProvider'
import type { CalorieResult } from '@/types'

export default function CalorieCalculator() {
  const { user } = useAuth()
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'>('moderate')
  const [result, setResult] = useState<CalorieResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  // 칼로리 계산 실행
  const handleCalculate = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)
    
    if (!w || w <= 0 || !h || h <= 0 || !a || a <= 0) {
      alert('모든 값을 올바르게 입력해주세요!')
      return
    }
    
    if (a < 10 || a > 100) {
      alert('나이는 10세 이상 100세 이하여야 합니다!')
      return
    }
    
    const calculated = calculateCalories(gender, w, h, a, activityLevel)
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
        'calorie',
        `칼로리 계산 - ${gender === 'male' ? '남성' : '여성'}, ${age}세`,
        {
          gender,
          weight: Number(weight),
          height: Number(height),
          age: Number(age),
          activityLevel
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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-black font-medium mb-2">
              성별
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                  ${gender === 'male' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                  ${gender === 'female' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                여성
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-black font-medium mb-2">
              나이 (세)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
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
              체중 (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-black font-medium mb-2">
              활동 수준
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as typeof activityLevel)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="sedentary">거의 운동 안 함</option>
              <option value="light">가벼운 운동 (주 1-3일)</option>
              <option value="moderate">적당한 운동 (주 3-5일)</option>
              <option value="active">적극적인 운동 (주 6-7일)</option>
              <option value="veryActive">매우 적극적인 운동 (하루 2회 이상)</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleCalculate}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg
                   font-semibold hover:bg-indigo-700 transition-colors"
        >
          칼로리 계산하기
        </button>
        
        {result && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800 mb-1">기초대사량 (BMR)</div>
                <div className="text-3xl font-bold text-blue-600">
                  {result.bmr.toLocaleString()} kcal
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  하루 중 아무것도 하지 않아도 소모하는 칼로리
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-sm text-green-800 mb-1">활동대사량 (TDEE)</div>
                <div className="text-3xl font-bold text-green-600">
                  {result.tdee.toLocaleString()} kcal
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {result.activityLevel}
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-4">목표 칼로리</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-800">체중 유지</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {result.goalCalories.maintain.toLocaleString()} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-800">체중 감량 (주당 0.5kg)</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {result.goalCalories.loseWeight.toLocaleString()} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-800">체중 증량 (주당 0.5kg)</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {result.goalCalories.gainWeight.toLocaleString()} kcal
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <div className="text-sm text-yellow-800">
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
        )}
      </div>
    </div>
  )
}


