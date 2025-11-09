import type { InsuranceResult, TaxResult, SalaryResult } from '@/types';

/**
 * 4대보험 계산 (2025년 기준)
 */
function calculateInsurance(monthlySalary: number): InsuranceResult {
  const rates = {
    nationalPension: 0.045,      // 국민연금 4.5%
    healthInsurance: 0.03545,    // 건강보험 3.545%
    longTermCare: 0.1295,        // 장기요양 (건강보험의 12.95%)
    employmentInsurance: 0.009   // 고용보험 0.9%
  };
  
  const nationalPension = Math.floor(monthlySalary * rates.nationalPension);
  const healthInsurance = Math.floor(monthlySalary * rates.healthInsurance);
  const longTermCare = Math.floor(healthInsurance * rates.longTermCare);
  const employmentInsurance = Math.floor(monthlySalary * rates.employmentInsurance);
  
  return {
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    total: nationalPension + healthInsurance + longTermCare + employmentInsurance
  };
}

/**
 * 소득세 계산 (간이세액표)
 */
function calculateIncomeTax(monthlySalary: number, dependents: number): TaxResult {
  let tax = 0;
  const yearlyIncome = monthlySalary * 12;
  
  // 누진세율 적용
  if (yearlyIncome <= 14000000) {
    tax = yearlyIncome * 0.06;
  } else if (yearlyIncome <= 50000000) {
    tax = 840000 + (yearlyIncome - 14000000) * 0.15;
  } else if (yearlyIncome <= 88000000) {
    tax = 6240000 + (yearlyIncome - 50000000) * 0.24;
  } else if (yearlyIncome <= 150000000) {
    tax = 15360000 + (yearlyIncome - 88000000) * 0.35;
  } else {
    tax = 37060000 + (yearlyIncome - 150000000) * 0.38;
  }
  
  // 부양가족 공제 (간소화)
  const deduction = (dependents - 1) * 150000 * 12;
  tax = Math.max(0, tax - deduction);
  
  const monthlyTax = Math.floor(tax / 12);
  const localTax = Math.floor(monthlyTax * 0.1); // 지방소득세 10%
  
  return {
    incomeTax: monthlyTax,
    localTax: localTax,
    total: monthlyTax + localTax
  };
}

/**
 * 연봉 실수령액 계산
 */
export function calculateNetSalary(annualSalary: number, dependents: number): SalaryResult {
  const monthlySalary = Math.floor(annualSalary / 12);
  
  // 4대보험 계산
  const insurance = calculateInsurance(monthlySalary);
  
  // 소득세 계산
  const tax = calculateIncomeTax(monthlySalary, dependents);
  
  // 총 공제액
  const totalDeduction = insurance.total + tax.total;
  
  // 실수령액
  const netSalary = monthlySalary - totalDeduction;
  
  return {
    monthlySalary,
    insurance,
    tax,
    totalDeduction,
    netSalary,
    annualNet: netSalary * 12
  };
}

