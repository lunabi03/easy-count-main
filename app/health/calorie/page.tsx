import type { Metadata } from 'next'
import CalorieCalculator from '@/components/calculators/CalorieCalculator'

export const metadata: Metadata = {
  title: '칼로리 계산기 - 기초대사량 및 활동대사량 계산',
  description: '키, 몸무게, 나이, 활동 수준을 입력하면 기초대사량(BMR)과 활동대사량(TDEE)을 계산할 수 있습니다. 체중 유지, 감량, 증량 목표 칼로리도 함께 제공합니다.',
  keywords: ['칼로리계산기', 'BMR', 'TDEE', '기초대사량', '활동대사량', '칼로리', '다이어트'],
}

export default function CaloriePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        🔥 칼로리 계산기
      </h1>
      <CalorieCalculator />
    </div>
  )
}


