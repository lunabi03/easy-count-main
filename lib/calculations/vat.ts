import type { VATResult } from '@/types';

const VAT_RATE = 0.1; // 10%

/**
 * 부가세 계산
 */
export function calculateVAT(amount: number, includesVAT: boolean = false): VATResult {
  if (includesVAT) {
    // 부가세 포함 금액 → 공급가액, 부가세 분리
    const supplyAmount = Math.floor(amount / 1.1);
    const vatAmount = amount - supplyAmount;
    
    return {
      type: '부가세 포함',
      totalAmount: amount,
      supplyAmount,
      vatAmount,
      vatRate: VAT_RATE
    };
  } else {
    // 공급가액 → 부가세, 총액 계산
    const supplyAmount = amount;
    const vatAmount = Math.floor(amount * VAT_RATE);
    const totalAmount = supplyAmount + vatAmount;
    
    return {
      type: '공급가액',
      supplyAmount,
      vatAmount,
      totalAmount,
      vatRate: VAT_RATE
    };
  }
}

