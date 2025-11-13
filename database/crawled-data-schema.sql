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

-- 관리자만 삽입/수정/삭제 가능하도록 설정하려면 아래 주석을 해제하세요
-- CREATE POLICY "Only admins can insert crawled data"
--   ON crawled_data
--   FOR INSERT
--   WITH CHECK (auth.jwt() ->> 'role' = 'admin');


