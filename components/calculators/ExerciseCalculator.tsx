'use client'

import { useState } from 'react'
import { calculateExercise, getAvailableExercises } from '@/lib/calculations/exercise'
import { saveCalculation } from '@/lib/database/calculations'
import { useAuth } from '@/components/AuthProvider'
import type { ExerciseResult } from '@/types'

export default function ExerciseCalculator() {
  const { user } = useAuth()
  const [exerciseType, setExerciseType] = useState('running-normal')
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [targetCalories, setTargetCalories] = useState('')
  const [calculationMode, setCalculationMode] = useState<'calories' | 'target'>('calories')
  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  const exercises = getAvailableExercises()
  
  // 운동 계산 실행
  const handleCalculate = () => {
    const w = parseFloat(weight)
    
    if (!w || w <= 0) {
      alert('체중을 올바르게 입력해주세요!')
      return
    }
    
    if (calculationMode === 'calories') {
      const d = parseFloat(duration)
      if (!d || d <= 0) {
        alert('운동 시간을 올바르게 입력해주세요!')
        return
      }
      
      const dist = distance ? parseFloat(distance) : undefined
      const calculated = calculateExercise(exerciseType, w, d, dist)
      setResult(calculated)
    } else {
      const target = parseFloat(targetCalories)
      if (!target || target <= 0) {
        alert('목표 칼로리를 올바르게 입력해주세요!')
        return
      }
      
      const calculated = calculateExercise(exerciseType, w, undefined, undefined, target)
      setResult(calculated)
    }
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
        'exercise',
        `운동 계산 - ${result.exerciseType}`,
        {
          exerciseType,
          weight: Number(weight),
          duration: duration ? Number(duration) : undefined,
          distance: distance ? Number(distance) : undefined,
          targetCalories: targetCalories ? Number(targetCalories) : undefined,
          calculationMode
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
  
  const isRunningOrCycling = exerciseType.includes('running') || exerciseType.includes('cycling')
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <label className="block text-black font-medium mb-2">
            계산 모드
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCalculationMode('calories')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                ${calculationMode === 'calories' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              칼로리 소모량 계산
            </button>
            <button
              type="button"
              onClick={() => setCalculationMode('target')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors
                ${calculationMode === 'target' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              목표 운동 시간 계산
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-black font-medium mb-2">
              운동 종류
            </label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {exercises.map((ex) => (
                <option key={ex.value} value={ex.value}>
                  {ex.label}
                </option>
              ))}
            </select>
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
          
          {calculationMode === 'calories' ? (
            <>
              <div>
                <label className="block text-black font-medium mb-2">
                  운동 시간 (분)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {isRunningOrCycling && (
                <div>
                  <label className="block text-black font-medium mb-2">
                    거리 (km) <span className="text-gray-500 text-sm">(선택사항)</span>
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="5"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-black font-medium mb-2">
                목표 칼로리 (kcal)
              </label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                placeholder="300"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
        
        <button
          onClick={handleCalculate}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg
                   font-semibold hover:bg-indigo-700 transition-colors"
        >
          {calculationMode === 'calories' ? '칼로리 계산하기' : '운동 시간 계산하기'}
        </button>
        
        {result && (
          <div className="mt-8">
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-4 text-lg">
                {result.exerciseType} 계산 결과
              </h3>
              
              {calculationMode === 'calories' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-800">칼로리 소모량</span>
                    <span className="text-3xl font-bold text-indigo-600">
                      {result.caloriesBurned.toLocaleString()} kcal
                    </span>
                  </div>
                  
                  {result.speed && (
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-800">평균 속도</span>
                      <span className="text-xl font-bold text-indigo-600">
                        {result.speed} km/h
                      </span>
                    </div>
                  )}
                  
                  {result.distance && (
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-800">거리</span>
                      <span className="text-xl font-bold text-indigo-600">
                        {result.distance} km
                      </span>
                    </div>
                  )}
                  
                  {result.duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-800">운동 시간</span>
                      <span className="text-xl font-bold text-indigo-600">
                        {result.duration} 분
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-indigo-200">
                    <div className="text-sm text-indigo-700">
                      MET 값: {result.metValue} (운동 강도 지표)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-800">필요한 운동 시간</span>
                    <span className="text-3xl font-bold text-indigo-600">
                      {result.targetDuration} 분
                    </span>
                  </div>
                  
                  {result.targetDuration && result.targetDuration > 60 && (
                    <div className="text-sm text-indigo-700">
                      약 {Math.round(result.targetDuration / 60 * 10) / 10} 시간
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-indigo-200">
                    <div className="text-sm text-indigo-700">
                      MET 값: {result.metValue} (운동 강도 지표)
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">
                      💡 목표 칼로리를 소모하기 위해 필요한 운동 시간입니다.
                    </div>
                  </div>
                </div>
              )}
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


