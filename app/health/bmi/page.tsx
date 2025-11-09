import type { Metadata } from 'next'
import BMICalculator from '@/components/calculators/BMICalculator'

export const metadata: Metadata = {
  title: 'BMI 계산기 - 체질량지수 및 적정 체중 계산',
  description: '키와 몸무게를 입력하면 BMI 지수와 건강 상태를 확인할 수 있습니다. 적정 체중 범위도 함께 제공합니다.',
  keywords: ['BMI계산기', '체질량지수', 'BMI', '적정체중', '비만도', '건강'],
}

export default function BMIPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        💪 BMI 계산기
      </h1>
      <BMICalculator />
    </div>
  )
}

