// 날짜 계산 결과 타입
export interface DDayResult {
  day100: Date;
  day200: Date;
  day500: Date;
  day1000: Date;
  daysTo100: number;
  daysTo200: number;
  daysTo500: number;
  daysTo1000: number;
}

export interface BirthdayResult {
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalYears: number;
  daysToNextBirthday: number;
}

// 연봉 계산 결과 타입
export interface InsuranceResult {
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  total: number;
}

export interface TaxResult {
  incomeTax: number;
  localTax: number;
  total: number;
}

export interface SalaryResult {
  monthlySalary: number;
  insurance: InsuranceResult;
  tax: TaxResult;
  totalDeduction: number;
  netSalary: number;
  annualNet: number;
}

// 할인/부가세 타입
export interface DiscountResult {
  originalPrice: number;
  discountRate: number;
  discountAmount: number;
  finalPrice: number;
  savedAmount: number;
}

export interface VATResult {
  type: string;
  supplyAmount: number;
  vatAmount: number;
  totalAmount: number;
  vatRate: number;
}

// BMI 결과 타입
export interface BMIResult {
  bmi: number;
  category: string;
  status: 'underweight' | 'normal' | 'overweight' | 'obese';
  healthyWeightRange: {
    min: number;
    max: number;
  };
  weightDifference: number;
  recommendation: string;
}

// GPA 타입
export interface Course {
  id: string;
  name: string;
  credit: number;
  grade: string;
}

export interface GPAResult {
  totalCredits: number;
  earnedCredits: number;
  gpa: number;
  totalGradePoints: number;
  letterGrade: string;
}

// 칼로리 계산 결과 타입
export interface CalorieResult {
  bmr: number;
  tdee: number;
  activityLevel: string;
  goalCalories: {
    maintain: number;
    loseWeight: number;
    gainWeight: number;
  };
  recommendation: string;
}

// 운동 계산 결과 타입
export interface ExerciseResult {
  exerciseType: string;
  caloriesBurned: number;
  speed?: number;
  distance?: number;
  duration?: number;
  metValue: number;
  targetDuration?: number;
}

// 크롤링 데이터 타입
export interface SuperKTSData {
  category: string;
  title: string;
  url: string;
  description?: string;
  lastUpdated?: Date;
}

export interface CrawledData {
  date: string;
  data: SuperKTSData[];
  timestamp: Date;
}

