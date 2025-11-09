import type { DDayResult, BirthdayResult } from '@/types';

/**
 * 디데이 계산 (100일, 200일, 500일, 1000일)
 */
export function calculateDDay(startDate: Date): DDayResult {
  const today = new Date();
  
  const day100 = new Date(startDate);
  day100.setDate(startDate.getDate() + 100);
  
  const day200 = new Date(startDate);
  day200.setDate(startDate.getDate() + 200);
  
  const day500 = new Date(startDate);
  day500.setDate(startDate.getDate() + 500);
  
  const day1000 = new Date(startDate);
  day1000.setDate(startDate.getDate() + 1000);
  
  const getDaysTo = (targetDate: Date) => {
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  return {
    day100,
    day200,
    day500,
    day1000,
    daysTo100: getDaysTo(day100),
    daysTo200: getDaysTo(day200),
    daysTo500: getDaysTo(day500),
    daysTo1000: getDaysTo(day1000),
  };
}

/**
 * 살아온 날 계산
 */
export function calculateBirthday(birthday: Date): BirthdayResult {
  const today = new Date();
  const diff = today.getTime() - birthday.getTime();
  
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = Math.floor(totalDays / 30.44);
  const totalYears = Math.floor(totalDays / 365.25);
  
  // 다음 생일까지 남은 일수
  const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    totalDays,
    totalWeeks,
    totalMonths,
    totalYears,
    daysToNextBirthday,
  };
}

