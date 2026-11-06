-- ========================================================
-- 마이그레이션: public.inspections 테이블에 inspection_type 컬럼 추가
-- 파일명: migration_add_inspection_type.sql
-- 적용 방법: Supabase 대시보드 -> SQL Editor -> 쿼리 붙여넣기 후 [Run] 실행
-- 데이터 무결성 보장: inspector, notes, 검사일, 상태 등 기존 데이터 일체 덮어쓰기 없음
-- ========================================================

-- [실행 전 검증 쿼리] 마이그레이션 전 원본 데이터 상태 확인
-- SELECT id, corp, equipment_name, location, last_date, next_date, status, inspector, notes FROM public.inspections ORDER BY id ASC;

-- 1. inspection_type 컬럼 추가 (기존 데이터 100% 보존, 기본값: '적용 여부 확인 필요')
ALTER TABLE public.inspections
ADD COLUMN IF NOT EXISTS inspection_type TEXT
DEFAULT '적용 여부 확인 필요';

-- 2. 기존 데이터의 분류값 설정 (원자적 CASE WHEN 업데이트)
-- 주의: inspector, notes, last_date, next_date, status 등 기존 기록은 절대 변경하지 않습니다.
UPDATE public.inspections
SET inspection_type = CASE
    -- 2-1. 지게차: 산안법 제93조 안전검사 제외 -> 안전보건규칙 제35조 '작업 시작 전 점검'
    WHEN equipment_name ILIKE '%지게차%'
        THEN '작업 시작 전 점검'

    -- 2-2. 컨베이어: 시행령 제78조 및 고시 제2020-42호(1.2kW 이하, 10m 이하 제외) 제원 확인 전 -> '적용 여부 확인 필요'
    WHEN equipment_name ILIKE '%컨베이어%'
        THEN '적용 여부 확인 필요'

    -- 2-3. 국소배기장치: 산안법 시행령 제78조제1항제7호에 따른 '법정 안전검사'
    WHEN equipment_name ILIKE '%국소배기장치%'
        THEN '법정 안전검사'

    -- 2-4. 공기압축기: 압축기 본체 제외, 압력용기 게이지 압력(0.2MPa 초과) 확인 전 -> '적용 여부 확인 필요'
    WHEN equipment_name ILIKE '%공기압축기%'
        THEN '적용 여부 확인 필요'

    -- 2-5. 프레스 방호장치: 광전자식 방호장치 등 설비 자체점검 항목 -> '사업장 자체점검'
    WHEN equipment_name ILIKE '%프레스%'
        OR equipment_name ILIKE '%방호장치%'
        THEN '사업장 자체점검'

    ELSE '적용 여부 확인 필요'
END
WHERE inspection_type IS NULL
   OR inspection_type = ''
   OR inspection_type = '적용 여부 확인 필요';

-- 3. 결과 확인 (실제 컬럼명 'corp' 사용 및 기존 필드 보존 대조)
SELECT
    id,
    corp,
    equipment_name,
    inspection_type,
    inspector,
    notes,
    last_date,
    next_date,
    status
FROM public.inspections
ORDER BY id ASC;

-- 4. 유형별 건수 확인 (예상: 법정 안전검사 1, 사업장 자체점검 1, 작업 시작 전 점검 1, 적용 여부 확인 필요 2 -> 총 5건)
SELECT
    inspection_type,
    COUNT(*) AS equipment_count
FROM public.inspections
GROUP BY inspection_type
ORDER BY inspection_type ASC;
