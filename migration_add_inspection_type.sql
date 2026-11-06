-- ========================================================
-- 마이그레이션: public.inspections 테이블에 inspection_type 컬럼 추가
-- 파일명: migration_add_inspection_type.sql
-- 적용 방법: Supabase 대시보드 -> SQL Editor -> 쿼리 붙여넣기 후 Run
-- 데이터 무결성 보장: inspector, notes, 검사일, 상태 등 기존 데이터 일체 덮어쓰기 없음
-- ========================================================

-- [실행 전 검증 쿼리] 마이그레이션 전 원본 데이터 상태 확인
-- SELECT id, corp, equipment_name, location, last_date, next_date, status, inspector, notes FROM public.inspections ORDER BY id ASC;

-- 1. inspection_type 컬럼 추가 (기존 데이터 100% 보존, 기본값: '적용 여부 확인 필요')
ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS inspection_type TEXT DEFAULT '적용 여부 확인 필요';

-- 2. 설비별 inspection_type 값 갱신 (주의: inspector, notes, 날짜 등 기존 필드는 절대 변경하지 않음)

-- 2-1. 지게차: 산안법 제93조 및 시행령 제78조 안전검사 대상 제외 -> 안전보건규칙 제35조 '작업 시작 전 점검'
UPDATE public.inspections 
SET inspection_type = '작업 시작 전 점검'
WHERE equipment_name ILIKE '%지게차%';

-- 2-2. 국소배기장치: 산안법 시행령 제78조제1항제7호에 따른 법정 안전검사 대상
UPDATE public.inspections 
SET inspection_type = '법정 안전검사'
WHERE equipment_name ILIKE '%국소배기장치%';

-- 2-3. 컨베이어: 시행령 제78조 및 안전검사 고시(고용노동부고시 제2020-42호) 별표 1 제12호
--      (총 이송거리 합계 10m 이하 제외, 구동부 전동기 정격출력 1.2kW 이하 제외 등)
--      세부 제원 확인 전이므로 일괄 법정검사로 단정하지 않고 '적용 여부 확인 필요'로 분류
UPDATE public.inspections 
SET inspection_type = '적용 여부 확인 필요'
WHERE equipment_name ILIKE '%컨베이어%';

-- 2-4. 공기압축기: 공기압축기 본체는 안전검사 대상이 아니며, 연결된 공기저장탱크(압력용기)의
--      설계압력(0.2MPa 초과) 및 용기 치수·용량 등 안전검사 적용범위 확인 전이므로 '적용 여부 확인 필요'로 분류
UPDATE public.inspections 
SET inspection_type = '적용 여부 확인 필요'
WHERE equipment_name ILIKE '%공기압축기%';

-- 2-5. 자동 포장기계 프레스 방호장치: 광전자식 방호장치 등 설비 자체점검 항목
UPDATE public.inspections 
SET inspection_type = '사업장 자체점검'
WHERE equipment_name ILIKE '%방호장치%';

-- 2-6. 미분류 및 NULL 항목 기본값 안전 처리
UPDATE public.inspections 
SET inspection_type = '적용 여부 확인 필요'
WHERE inspection_type IS NULL OR inspection_type = '';

-- ========================================================
-- [실행 후 검증 쿼리] 마이그레이션 후 데이터 변경 확인
-- (기존 inspector, notes 값이 보존되고 inspection_type만 추가되었는지 대조 확인)
-- ========================================================
SELECT id, corp, inspection_type, equipment_name, location, last_date, next_date, status, inspector, notes 
FROM public.inspections 
ORDER BY id ASC;
