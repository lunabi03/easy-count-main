'use client'

import { useState } from 'react'
import { calculateNetSalary } from '@/lib/calculations/salary'
import { formatCurrency } from '@/lib/utils/format'
import { saveCalculation } from '@/lib/database/calculations'
import { useAuth } from '@/components/AuthProvider'
import type { SalaryResult } from '@/types'

export default function SalaryCalculator() {
  const { user } = useAuth()
  const [annualSalary, setAnnualSalary] = useState('')
  const [dependents, setDependents] = useState('1')
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  // 실수령액 계산 실행
  const handleCalculate = () => {
    const salary = parseInt(annualSalary)
    const deps = parseInt(dependents)
    
    if (!salary || salary <= 0) {
      alert('연봉을 올바르게 입력해주세요!')
      return
    }
    
    if (!deps || deps < 1) {
      alert('부양가족 수는 최소 1명(본인)입니다!')
      return
    }
    
    const calculated = calculateNetSalary(salary, deps)
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
        'salary',
        `연봉 계산 - 연봉 ${annualSalary}원`,
        {
          annualSalary: Number(annualSalary),
          dependents: Number(dependents)
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
              연봉 (세전)
            </label>
            <div className="flex">
              <input
                type="number"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                placeholder="50000000"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                원
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-black font-medium mb-2">
              부양가족 수 (본인 포함)
            </label>
            <input
              type="number"
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={handleCalculate}
          className="w-full bg-blue-600 text-white py-3 rounded-lg
                   font-semibold hover:bg-blue-700 transition-colors"
        >
          실수령액 계산하기
        </button>
        
        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-center mb-4">
              📊 계산 결과
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between text-lg">
                <span>월 세전 급여</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(result.monthlySalary)}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">항목</th>
                    <th className="px-4 py-3 text-right">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">국민연금 (4.5%)</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(result.insurance.nationalPension)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">건강보험 (3.545%)</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(result.insurance.healthInsurance)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">장기요양보험</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(result.insurance.longTermCare)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">고용보험 (0.9%)</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(result.insurance.employmentInsurance)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">소득세</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(result.tax.incomeTax)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">지방소득세</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(result.tax.localTax)}</td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td className="px-4 py-3">총 공제액</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(result.totalDeduction)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg">💰 월 실수령액</span>
                  <span className="text-3xl font-bold">{formatCurrency(result.netSalary)}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg">💵 연 실수령액</span>
                  <span className="text-3xl font-bold">{formatCurrency(result.annualNet)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-yellow-800">
                ※ 2025년 기준 간이세액표 적용<br/>
                ※ 실제 금액과 다소 차이가 있을 수 있습니다
              </p>
            </div>

            {user && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
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

