import { createClient } from '@/lib/supabase/client'

// 계산 결과 저장 함수
export async function saveCalculation(
  calculatorType: string,
  title: string,
  inputData: unknown,
  resultData: unknown
) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다')
  }

  const { data, error } = await supabase
    .from('calculations')
    .insert({
      user_id: user.id,
      calculator_type: calculatorType,
      title,
      input_data: inputData,
      result_data: resultData
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// 계산 기록 조회 함수
export async function getCalculations(calculatorType?: string) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다')
  }

  let query = supabase
    .from('calculations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (calculatorType) {
    query = query.eq('calculator_type', calculatorType)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

// 계산 기록 삭제 함수
export async function deleteCalculation(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('calculations').delete().eq('id', id)

  if (error) {
    throw error
  }
}

