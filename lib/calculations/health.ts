import type { BMIResult, CalorieResult } from '@/types'

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

// 기초대사량(BMR) 계산 (Mifflin-St Jeor 공식)
export function calculateBMR(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number
): number {
  // weight는 kg, height는 cm
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// 활동대사량(TDEE) 계산
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
): number {
  const activityMultipliers = {
    sedentary: 1.2,    // 거의 운동 안 함
    light: 1.375,      // 가벼운 운동 (주 1-3일)
    moderate: 1.55,    // 적당한 운동 (주 3-5일)
    active: 1.725,     // 적극적인 운동 (주 6-7일)
    veryActive: 1.9,   // 매우 적극적인 운동 (하루 2회 이상)
  }
  
  return bmr * activityMultipliers[activityLevel]
}

// 칼로리 계산 (BMR, TDEE, 목표 칼로리)
export function calculateCalories(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
): CalorieResult {
  const bmr = calculateBMR(gender, weight, height, age)
  const tdee = calculateTDEE(bmr, activityLevel)
  
  const activityLabels = {
    sedentary: '거의 운동 안 함',
    light: '가벼운 운동 (주 1-3일)',
    moderate: '적당한 운동 (주 3-5일)',
    active: '적극적인 운동 (주 6-7일)',
    veryActive: '매우 적극적인 운동 (하루 2회 이상)',
  }
  
  // 목표 칼로리 계산
  // 체중 유지: TDEE
  // 체중 감량: TDEE - 500kcal (주당 0.5kg 감량)
  // 체중 증량: TDEE + 500kcal (주당 0.5kg 증량)
  const goalCalories = {
    maintain: Math.round(tdee),
    loseWeight: Math.round(tdee - 500),
    gainWeight: Math.round(tdee + 500),
  }
  
  let recommendation = ''
  if (goalCalories.loseWeight < 1200) {
    recommendation = '⚠️ 체중 감량 목표 칼로리가 너무 낮습니다. 건강한 감량을 위해 전문가와 상담하세요.'
  } else if (goalCalories.gainWeight > 4000) {
    recommendation = '⚠️ 체중 증량 목표 칼로리가 매우 높습니다. 점진적으로 증가시키는 것을 권장합니다.'
  } else {
    recommendation = '균형잡힌 식사와 규칙적인 운동으로 목표를 달성하세요!'
  }
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    activityLevel: activityLabels[activityLevel],
    goalCalories,
    recommendation,
  }
}

