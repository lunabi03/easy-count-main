import type { DiscountResult } from '@/types';

/**
 * 할인율 계산
 */
export function calculateDiscount(originalPrice: number, discountRate: number): DiscountResult {
  // 할인 금액 계산
  const discountAmount = Math.floor(originalPrice * (discountRate / 100));
  
  // 최종 가격 계산
  const finalPrice = originalPrice - discountAmount;
  
  return {
    originalPrice,
    discountRate,
    discountAmount,
    finalPrice,
    savedAmount: discountAmount
  };
}

