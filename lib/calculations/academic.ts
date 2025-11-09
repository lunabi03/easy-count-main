import type { Course, GPAResult } from '@/types'

// 학점을 점수로 변환
export function gradeToPoint(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A+': 4.5, 'A': 4.0,
    'B+': 3.5, 'B': 3.0,
    'C+': 2.5, 'C': 2.0,
    'D+': 1.5, 'D': 1.0,
    'F': 0.0,
    'P': 0.0, // Pass (학점 포함 안 됨)
  }
  return gradeMap[grade] ?? 0
}

// GPA 계산
export function calculateGPA(courses: Course[]): GPAResult {
  let totalCredits = 0
  let earnedCredits = 0
  let totalGradePoints = 0
  
  courses.forEach(course => {
    // P(ass) 학점은 제외
    if (course.grade === 'P') {
      earnedCredits += course.credit
      return
    }
    
    const point = gradeToPoint(course.grade)
    totalCredits += course.credit
    totalGradePoints += point * course.credit
    
    // F가 아니면 이수 학점에 포함
    if (course.grade !== 'F') {
      earnedCredits += course.credit
    }
  })
  
  const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0
  
  // 평점을 등급으로 변환
  let letterGrade: string
  if (gpa >= 4.2) letterGrade = 'A+'
  else if (gpa >= 3.7) letterGrade = 'A'
  else if (gpa >= 3.2) letterGrade = 'B+'
  else if (gpa >= 2.7) letterGrade = 'B'
  else if (gpa >= 2.2) letterGrade = 'C+'
  else if (gpa >= 1.7) letterGrade = 'C'
  else if (gpa >= 1.2) letterGrade = 'D+'
  else if (gpa >= 0.7) letterGrade = 'D'
  else letterGrade = 'F'
  
  return {
    totalCredits,
    earnedCredits,
    gpa: Math.round(gpa * 100) / 100,
    totalGradePoints: Math.round(totalGradePoints * 100) / 100,
    letterGrade,
  }
}

