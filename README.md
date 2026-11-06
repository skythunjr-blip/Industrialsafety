# 통합 산업안전보건 관제 시스템 (Safety Dashboard)
> (주)케이프라이드 · (주)보담 산업안전보건 통합 관제 웹 플랫폼 & Supabase 클라우드 실시간 연동

## 📌 주요 기능
1. **실시간 안전보건 관제 대시보드 (`index.html`)**
   - KPI 요약 지표 (총 근로자 수, 최장 무재해 일수, 긴급 D-Day, 법정 검사 설비)
   - 2사(케이프라이드, 보담) 법인별 필터링 및 실시간 동기화
   - 긴급 D-Day 및 법정 이슈 모니터링
   - 위험성평가 이행률 및 건강검진 수검률 비교 차트 (Chart.js)
   - 안전검사 대상 설비(컨베이어, 국소배기장치 등) 및 지게차 작업 시작 전 점검 관리
   - 실시간 로컬 업무 서류 감시 연동
2. **주기별 안전보건 실무 체크리스트 (일·주·월·분기·연간)**
   - 체크 완료 시 자동 숨김(Fade-out) 처리 및 로컬 영구 보존
   - 각 점검 항목별 초보 담당자를 위한 실무 꿀팁(Tip) 제공
3. **2025·2026 산재 법령 변동점 & 초보 실무 팁 가이드**
   - 중대재해처벌법, 위험성평가, 정기교육, 휴게시설, 한파·폭염 법령 개정 비교
   - 놓치면 즉시 과태료인 법정 제출기한 요약표
   - 7대 핵심 실무 영역별 실수 방지 매뉴얼
4. **통합 관리자(Admin) 페이지 (`admin.html`)**
   - 긴급 알림, 설비 검사 현황, 공지사항, 법인 지표, 사이트 설정 직접 수정(CRUD)
   - Supabase 클라우드 실시간 동기화 및 핑 진단
   - 원클릭 DB 스키마 생성 SQL 제공

## 🛠️ 기술 스택
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript, Chart.js, Lucide Icons
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Realtime)
- **Local Server**: Python 3 HTTP Server (`run_dashboard.py`)

<!-- Last synced: 2026-11-05 17:00 KST -->
