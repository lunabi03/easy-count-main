 'use client'

import { useState } from 'react'
import { calculateVAT } from '@/lib/calculations/vat'
import { formatCurrency } from '@/lib/utils/format'
import { saveCalculation } from '@/lib/database/calculations'
import { useAuth } from '@/components/AuthProvider'
import type { VATResult } from '@/types'

export default function VATCalculator() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [vatType, setVatType] = useState<'exclude' | 'include'>('exclude')
  const [result, setResult] = useState<VATResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  // 부가세 계산 실행
  const handleCalculate = () => {
    const price = parseInt(amount)
    
    if (!price || price <= 0) {
      alert('금액을 올바르게 입력해주세요!')
      return
    }
    
    const calculated = calculateVAT(price, vatType === 'include')
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
        'vat',
        `부가세 계산 - 금액 ${amount}원`,
        {
          amount: Number(amount),
          vatType
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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">🧾 부가세 계산기</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-black font-medium mb-2">
            금액
          </label>
          <div className="flex">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg
                       focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
              원
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-black font-medium mb-3">
            계산 방식
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="vatType"
                value="exclude"
                checked={vatType === 'exclude'}
                onChange={() => setVatType('exclude')}
                className="mr-3"
              />
              <span>공급가액 (부가세 별도)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="vatType"
                value="include"
                checked={vatType === 'include'}
                onChange={() => setVatType('include')}
                className="mr-3"
              />
              <span>부가세 포함 금액</span>
            </label>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleCalculate}
        className="w-full bg-orange-600 text-white py-3 rounded-lg
                 font-semibold hover:bg-orange-700 transition-colors"
      >
        계산하기
      </button>
      
      {result && (
        <div className="mt-6 space-y-3">
          <h4 className="font-bold text-lg text-center">
            📊 계산 결과 ({result.type})
          </h4>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>공급가액</span>
              <span className="font-semibold">{formatCurrency(result.supplyAmount)}</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>부가세 (10%)</span>
              <span className="font-semibold">{formatCurrency(result.vatAmount)}</span>
            </div>
            <hr className="my-2"/>
            <div className="flex justify-between text-xl font-bold">
              <span>총 금액</span>
              <span>{formatCurrency(result.totalAmount)}</span>
            </div>
          </div>

          {user && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? '저장 중...' : '💾 계산 결과 저장'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

