import DDayCalculator from '@/components/calculators/DDayCalculator'

export default function DDayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        💕 커플 디데이 계산기
      </h1>
      <DDayCalculator />
    </div>
  )
}

