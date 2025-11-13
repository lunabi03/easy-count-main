import type { ExerciseResult } from '@/types'

// 운동별 MET 값 (Metabolic Equivalent of Task)
// MET × 체중(kg) × 시간(시간) = 칼로리 소모량
const MET_VALUES: Record<string, number> = {
  // 걷기
  'walking-slow': 2.0,        // 느린 걷기 (3.2km/h)
  'walking-normal': 3.5,      // 보통 걷기 (4.8km/h)
  'walking-fast': 5.0,        // 빠른 걷기 (6.4km/h)
  'walking-uphill': 6.0,      // 오르막 걷기
  
  // 달리기
  'running-slow': 6.0,        // 느린 달리기 (6.4km/h)
  'running-normal': 8.3,      // 보통 달리기 (8km/h)
  'running-fast': 9.8,        // 빠른 달리기 (9.6km/h)
  'running-very-fast': 11.5,  // 매우 빠른 달리기 (11.2km/h)
  
  // 자전거
  'cycling-slow': 4.0,        // 느린 자전거 (10km/h)
  'cycling-normal': 6.0,      // 보통 자전거 (16km/h)
  'cycling-fast': 8.0,        // 빠른 자전거 (20km/h)
  
  // 수영
  'swimming-slow': 5.8,       // 느린 수영
  'swimming-normal': 7.0,    // 보통 수영
  'swimming-fast': 10.0,      // 빠른 수영
  
  // 기타 운동
  'yoga': 2.5,
  'pilates': 3.0,
  'weight-training': 5.0,
  'aerobics': 6.5,
  'jumping-rope': 10.0,
  'climbing': 8.0,
  'dancing': 4.8,
}

// 운동별 한글 이름
const EXERCISE_NAMES: Record<string, string> = {
  'walking-slow': '느린 걷기',
  'walking-normal': '보통 걷기',
  'walking-fast': '빠른 걷기',
  'walking-uphill': '오르막 걷기',
  'running-slow': '느린 달리기',
  'running-normal': '보통 달리기',
  'running-fast': '빠른 달리기',
  'running-very-fast': '매우 빠른 달리기',
  'cycling-slow': '느린 자전거',
  'cycling-normal': '보통 자전거',
  'cycling-fast': '빠른 자전거',
  'swimming-slow': '느린 수영',
  'swimming-normal': '보통 수영',
  'swimming-fast': '빠른 수영',
  'yoga': '요가',
  'pilates': '필라테스',
  'weight-training': '근력 운동',
  'aerobics': '에어로빅',
  'jumping-rope': '줄넘기',
  'climbing': '등산',
  'dancing': '댄스',
}

// 칼로리 소모량 계산
export function calculateCaloriesBurned(
  exerciseType: string,
  weight: number,
  duration: number // 분 단위
): number {
  const met = MET_VALUES[exerciseType] || 3.5
  const hours = duration / 60
  return met * weight * hours
}

// 달리기 속도 계산 (km/h)
export function calculateRunningSpeed(
  distance: number, // km
  duration: number  // 분
): number {
  if (duration <= 0) return 0
  const hours = duration / 60
  return distance / hours
}

// 목표 칼로리 소모를 위한 운동 시간 계산 (분)
export function calculateTargetDuration(
  exerciseType: string,
  weight: number,
  targetCalories: number
): number {
  const met = MET_VALUES[exerciseType] || 3.5
  if (met * weight <= 0) return 0
  const hours = targetCalories / (met * weight)
  return Math.round(hours * 60)
}

// 운동 계산 (종합)
export function calculateExercise(
  exerciseType: string,
  weight: number,
  duration?: number,      // 분
  distance?: number,      // km
  targetCalories?: number // 목표 칼로리
): ExerciseResult {
  const met = MET_VALUES[exerciseType] || 3.5
  const exerciseName = EXERCISE_NAMES[exerciseType] || exerciseType
  
  let caloriesBurned = 0
  let speed: number | undefined
  let targetDuration: number | undefined
  
  // 칼로리 소모량 계산
  if (duration) {
    caloriesBurned = calculateCaloriesBurned(exerciseType, weight, duration)
  }
  
  // 달리기/자전거인 경우 속도 계산
  if (distance && duration) {
    speed = calculateRunningSpeed(distance, duration)
  }
  
  // 목표 칼로리를 위한 운동 시간 계산
  if (targetCalories) {
    targetDuration = calculateTargetDuration(exerciseType, weight, targetCalories)
  }
  
  return {
    exerciseType: exerciseName,
    caloriesBurned: Math.round(caloriesBurned),
    speed: speed ? Math.round(speed * 10) / 10 : undefined,
    distance,
    duration,
    metValue: met,
    targetDuration,
  }
}

// 사용 가능한 운동 목록 반환
export function getAvailableExercises(): Array<{ value: string; label: string }> {
  return Object.keys(EXERCISE_NAMES).map(key => ({
    value: key,
    label: EXERCISE_NAMES[key],
  }))
}


