import DiscountCalculator from '@/components/calculators/DiscountCalculator'
import VATCalculator from '@/components/calculators/VATCalculator'

export default function ShoppingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🛍️ 쇼핑 계산기
      </h1>
      <p className="text-center text-black mb-8">
        할인율과 부가세를 간편하게 계산하세요
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <DiscountCalculator />
        <VATCalculator />
      </div>
    </div>
  )
}

