-- ========================================================
-- 마이그레이션: public.inspections 테이블에 inspection_type 컬럼 추가
-- 파일명: migration_add_inspection_type.sql
-- 적용 방법: Supabase 대시보드 -> SQL Editor -> 쿼리 붙여넣기 후 Run
-- ========================================================

-- 1. inspection_type 컬럼 추가 (기존 데이터 100% 보존)
ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS inspection_type TEXT DEFAULT '적용 여부 확인 필요';

-- 2. 기존 설비 데이터에 대한 법령 및 제원 기준 유형 분류
-- 2-1. 지게차: 산안법 제93조 및 시행령 제78조 안전검사 대상 제외 설비
--      -> 안전보건규칙 제35조 및 별표 3에 따른 '작업 시작 전 점검'으로 분류
UPDATE public.inspections 
SET inspection_type = '작업 시작 전 점검',
    inspector = '자체 점검 (운전자/관리감독자)',
    notes = '작업 시작 전 점검표 작성 및 일일 안전점검 실시'
WHERE equipment_name ILIKE '%지게차%';

-- 2-2. 컨베이어: 시행령 제78조 및 고시 제2020-42호(연속 이송거리 10m 이상 등) 세부 규격 확인 전이므로
--      일괄적으로 법정 안전검사로 단정하지 않고 '적용 여부 확인 필요'로 분류
UPDATE public.inspections 
SET inspection_type = '적용 여부 확인 필요',
    notes = '시행령 제78조 및 고시 적용범위(이송거리 10m 이상 등) 확인 후 차기 검사 관리'
WHERE equipment_name ILIKE '%컨베이어%';

-- 2-3. 국소배기장치 및 압력용기(공기압축기): 산안법 시행령 제78조 대상 설비
UPDATE public.inspections 
SET inspection_type = '법정 안전검사'
WHERE equipment_name ILIKE '%국소배기장치%' OR equipment_name ILIKE '%공기압축기%';

-- 2-4. 자동 포장기계 프레스 방호장치: 자체 정밀점검 관리 설비
UPDATE public.inspections 
SET inspection_type = '사업장 자체점검'
WHERE equipment_name ILIKE '%방호장치%' OR inspector ILIKE '%자체%';

-- 3. 확인되지 않은 나머지 설비는 일괄 법정 안전검사로 지정하지 않고 '적용 여부 확인 필요' 유지
UPDATE public.inspections 
SET inspection_type = '적용 여부 확인 필요'
WHERE inspection_type IS NULL OR inspection_type = '';

-- ========================================================
-- 마이그레이션 확인 쿼리
-- ========================================================
SELECT id, corp, equipment_name, inspection_type, last_date, next_date, status, inspector 
FROM public.inspections 
ORDER BY id ASC;
