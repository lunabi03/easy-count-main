# 데이터 수집 시스템 설정 가이드

이 프로젝트는 [superkts.com/cal/](https://superkts.com/cal/) 사이트에서 데이터를 수집하여 자동으로 갱신하는 시스템을 포함합니다.

## 📋 목차

1. [데이터베이스 설정](#1-데이터베이스-설정)
2. [수동 크롤링 실행](#2-수동-크롤링-실행)
3. [자동 갱신 설정](#3-자동-갱신-설정)
4. [데이터 조회](#4-데이터-조회)
5. [주의사항](#5-주의사항)

## 1. 데이터베이스 설정

### Supabase에서 테이블 생성

Supabase 대시보드 → SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 수집된 데이터를 저장할 테이블
CREATE TABLE IF NOT EXISTS crawled_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_crawled_data_date ON crawled_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_data_timestamp ON crawled_data(timestamp DESC);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_crawled_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_crawled_data_updated_at ON crawled_data;
CREATE TRIGGER update_crawled_data_updated_at
  BEFORE UPDATE ON crawled_data
  FOR EACH ROW
  EXECUTE FUNCTION update_crawled_data_updated_at();

-- RLS 정책 (공개 데이터이므로 모든 사용자가 조회 가능)
ALTER TABLE crawled_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crawled data"
  ON crawled_data
  FOR SELECT
  USING (true);
```

또는 `database/crawled-data-schema.sql` 파일의 내용을 복사하여 실행하세요.

## 2. 수동 크롤링 실행

### 방법 1: 웹 인터페이스 사용

1. 개발 서버 실행: `pnpm dev`
2. 브라우저에서 `/data` 페이지 방문
3. "수동 갱신" 버튼 클릭

### 방법 2: API 엔드포인트 직접 호출

```bash
# GET 요청
curl http://localhost:3000/api/crawl

# POST 요청
curl -X POST http://localhost:3000/api/crawl
```

### 방법 3: 스크립트 실행

```bash
# 개발 서버가 실행 중이어야 함
pnpm dev

# 다른 터미널에서
pnpm crawl
```

## 3. 자동 갱신 설정

### Vercel (프로덕션)

`vercel.json` 파일이 이미 설정되어 있습니다. Vercel에 배포하면 자동으로 매일 자정에 크롤링이 실행됩니다.

```json
{
  "crons": [
    {
      "path": "/api/crawl",
      "schedule": "0 0 * * *"  // 매일 자정 (UTC)
    }
  ]
}
```

### 다른 호스팅 환경

#### GitHub Actions

`.github/workflows/crawler.yml` 파일 생성:

```yaml
name: Daily Crawler

on:
  schedule:
    - cron: '0 0 * * *'  # 매일 자정 (UTC)
  workflow_dispatch:  # 수동 실행 가능

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: |
          curl -X POST https://your-domain.com/api/crawl
```

#### 별도 서버 (node-cron 사용)

```typescript
import { startCrawlerJob } from './lib/cron/crawler-job'

// 서버 시작 시
startCrawlerJob()
```

## 4. 데이터 조회

### 웹 인터페이스

- URL: `/data`
- 카테고리별 필터링 가능
- 수동 갱신 버튼 제공

### API 사용

```typescript
// 최신 데이터 조회
GET /api/data

// 특정 날짜 데이터 조회
GET /api/data?date=2025-01-01
```

## 5. 주의사항

### ⚠️ 법적 고려사항

1. **robots.txt 확인**: 크롤링 전에 대상 사이트의 robots.txt를 확인하세요
2. **이용약관 확인**: 사이트의 이용약관을 확인하여 크롤링이 허용되는지 확인하세요
3. **요청 간격**: 과도한 요청은 서버에 부하를 줄 수 있으므로 적절한 간격을 유지하세요

### 🔧 기술적 고려사항

1. **사이트 구조 변경**: 대상 사이트의 HTML 구조가 변경되면 크롤러를 업데이트해야 할 수 있습니다
2. **에러 처리**: 네트워크 오류나 타임아웃에 대한 적절한 처리가 필요합니다
3. **데이터 저장**: Supabase의 저장 용량 제한을 확인하고, 오래된 데이터는 주기적으로 정리하세요

### 📊 데이터 관리

- 매일 자동으로 새로운 데이터가 수집됩니다
- 같은 날짜의 데이터가 있으면 업데이트됩니다
- 데이터는 JSONB 형식으로 저장되어 유연한 쿼리가 가능합니다

## 6. 문제 해결

### 크롤링이 실패하는 경우

1. 네트워크 연결 확인
2. 대상 사이트 접근 가능 여부 확인
3. User-Agent 헤더 확인
4. 타임아웃 설정 확인 (현재 10초)

### 데이터가 표시되지 않는 경우

1. 데이터베이스에 데이터가 저장되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. API 라우트가 정상 작동하는지 확인
4. 브라우저 콘솔에서 에러 확인

## 7. 향후 개선 사항

- [ ] 더 많은 데이터 소스 추가
- [ ] 데이터 분석 및 시각화
- [ ] 알림 시스템 (새로운 데이터 수집 시)
- [ ] 데이터 검색 기능
- [ ] 데이터 내보내기 기능 (CSV, JSON)
- [ ] 데이터 비교 기능 (날짜별)
