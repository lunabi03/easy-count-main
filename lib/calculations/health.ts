import type { BMIResult } from '@/types'

export function calculateBMI(height: number, weight: number): BMIResult {
  // height는 cm, weight는 kg
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters ** 2)
  
  // BMI 분류 (WHO 기준)
  let category: string
  let status: BMIResult['status']
  let recommendation: string
  
  if (bmi < 18.5) {
    category = '저체중'
    status = 'underweight'
    recommendation = '균형잡힌 식사와 근력 운동을 통해 건강한 체중을 유지하세요.'
  } else if (bmi < 23) {
    category = '정상'
    status = 'normal'
    recommendation = '현재 체중을 잘 유지하고 있습니다. 꾸준한 운동과 건강한 식습관을 이어가세요!'
  } else if (bmi < 25) {
    category = '과체중'
    status = 'overweight'
    recommendation = '규칙적인 운동과 식이 조절로 건강한 체중으로 돌아가세요.'
  } else {
    category = '비만'
    status = 'obese'
    recommendation = '건강을 위해 체중 감량을 권장합니다. 전문가와 상담하세요.'
  }
  
  // 건강 체중 범위 (BMI 18.5 ~ 23)
  const healthyWeightRange = {
    min: Math.round(18.5 * (heightInMeters ** 2)),
    max: Math.round(23 * (heightInMeters ** 2)),
  }
  
  // 적정 체중과의 차이
  let weightDifference: number
  if (weight < healthyWeightRange.min) {
    weightDifference = healthyWeightRange.min - weight
  } else if (weight > healthyWeightRange.max) {
    weightDifference = weight - healthyWeightRange.max
  } else {
    weightDifference = 0
  }
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    status,
    healthyWeightRange,
    weightDifference,
    recommendation,
  }
}

