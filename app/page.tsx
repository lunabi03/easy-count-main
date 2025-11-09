import Link from 'next/link'

export default function Home() {
  const calculators = [
    {
      title: '💕 커플 디데이',
      description: '100일, 500일, 1000일 기념일 계산',
      href: '/date/dday',
      color: 'bg-pink-500'
    },
    {
      title: '🎂 살아온 날',
      description: '생년월일로 총 일수 계산',
      href: '/date/birthday',
      color: 'bg-purple-500'
    },
    {
      title: '💰 연봉 계산기',
      description: '4대보험, 세금 제외 실수령액',
      href: '/salary',
      color: 'bg-blue-500'
    },
    {
      title: '🛍️ 쇼핑 계산기',
      description: '할인율, 부가세 계산',
      href: '/shopping',
      color: 'bg-green-500'
    },
    {
      title: '💪 BMI 계산기',
      description: '체질량지수와 적정 체중 계산',
      href: '/health/bmi',
      color: 'bg-orange-500'
    },
    {
      title: '📚 학점 계산기',
      description: 'GPA 평점 계산',
      href: '/academic/gpa',
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Easy Count
        </h1>
        <p className="text-xl text-black">
          일상생활에 필요한 모든 계산을 한 곳에서
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {calculators.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group"
          >
            <div className={`${calc.color} p-6 rounded-2xl text-white 
                          transition-transform duration-300 
                          hover:scale-105 hover:shadow-xl`}>
              <h2 className="text-2xl font-bold mb-2">{calc.title}</h2>
              <p className="text-white/90">{calc.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

