import type { Metadata } from 'next'
import ExerciseCalculator from '@/components/calculators/ExerciseCalculator'

export const metadata: Metadata = {
  title: '운동 계산기 - 칼로리 소모량 및 운동 시간 계산',
  description: '운동 종류, 체중, 시간을 입력하면 칼로리 소모량을 계산할 수 있습니다. 목표 칼로리를 입력하면 필요한 운동 시간도 계산할 수 있습니다.',
  keywords: ['운동계산기', '칼로리소모량', '운동시간', '달리기속도', '운동칼로리', 'MET'],
}

export default function ExercisePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        🏃 운동 계산기
      </h1>
      <ExerciseCalculator />
    </div>
  )
}


