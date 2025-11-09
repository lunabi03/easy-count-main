/**
 * 숫자를 천단위 콤마가 있는 문자열로 변환
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 숫자를 원화 형식으로 변환
 */
export function formatCurrency(num: number): string {
  return `${formatNumber(num)}원`;
}

/**
 * 날짜를 한글 형식으로 변환
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

