import BirthdayCalculator from '@/components/calculators/BirthdayCalculator'

export default function BirthdayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎂 살아온 날 계산기
      </h1>
      <BirthdayCalculator />
    </div>
  )
}

