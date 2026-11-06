/**
 * 산업안전보건법·중대재해처벌법 법령 및 초보 담당자 실무 가이드 데이터
 */

const SAFETY_TIPS_DATA = {
  // 1. 작년 vs 올해 산안법·중처법 주요 변동점 비교
  lawChanges: [
    {
      category: "중대재해처벌법",
      title: "50인 미만 사업장 전면 적용 및 처벌 강화",
      past: "50인 미만(5~49인) 사업장 유예 기간 적용 중이었음",
      current: "5인 이상 모든 사업장 전면 적용 (도급·용역 수급업체 포함). 안전보건관리체계 구축 9대 의무 미이행 시 경영책임자 1년 이상 징역",
      keyAction: "반기별(연 2회) 안전보건 이행점검 보고서 작성 및 대표이사 결재 필수",
      badge: "중대위험"
    },
    {
      category: "위험성평가",
      title: "상시평가(TBM 연계) 및 근로자 참여 의무화",
      past: "정량적 빈도·강도 3x3, 5x5 행렬 중심의 복잡한 연 1회 평가",
      current: "체크리스트법, 위험기반법 등 간편법 공식 인정 + 작업 전 안전점검(TBM)을 통한 일상/수시 위험성평가 상시화",
      keyAction: "평가 전 과정에 현장 근로자 참여 및 결과 공유(TBM 일지 서명) 필수",
      badge: "핵심개정"
    },
    {
      category: "근로자 정기교육",
      title: "교육 주기 및 이수시간 산정 기준 개편",
      past: "매분기 6시간 (사무직 3시간) 중심의 획일적 운영",
      current: "반기별 12시간 (사무직 6시간) 이수 가능 및 특별교육 분할 실시 유연화, 체험형 교육 인정",
      keyAction: "교육일지 작성 시 참석자 자필 서명부 및 교안 사본 3년 보존",
      badge: "행정개편"
    },
    {
      category: "휴게시설 설치",
      title: "제재 기준 및 정기 점검 확대",
      past: "20인 이상 사업장 설치 의무화 초기 계도 중심",
      current: "면적(최소 6㎡, 천장 2.2m), 적정 온도(18~28℃), 습도, 냉난방기 구비 미흡 시 즉시 1,500만원 이하 과태료",
      keyAction: "휴게시설 내 온도계 비치 및 환기/청결 관리 체크리스트 상시 비치",
      badge: "시설규정"
    },
    {
      category: "폭염·한파 건강장해",
      title: "동절기 한파 및 하절기 온열질환 관리 법제화",
      past: "권고 수준의 가이드라인 중심",
      current: "체감온도 기준 온열·한랭질환 예방수칙(물·그늘·바람, 핫팩·온열쉼터) 미조치 시 노동부 시정명령 및 즉시 과태료",
      keyAction: "기온 급강하 시 야외 상하차 작업자 1시간당 10~15분 휴식 부여 및 기록 유지",
      badge: "보건관리"
    }
  ],

  // 2. 초보 안전보건 담당자를 위한 영역별 실무 팁 & 실수 방지 체크포인트
  practicalTips: [
    {
      domain: "위탁관리 대행",
      icon: "file-check",
      badge: "가장 흔한 실수 1위",
      summary: "대행기관(대한안전, 보건연구원) 보고서에 도장만 찍고 편철하면 무조건 적발됩니다!",
      mistake: "대행기관 직원이 방문 후 점검표를 주면 서명만 하고 화일에 꽂아둠 → 노동부 점검 시 '개선 조치 미이행'으로 1건당 수백만원 과태료 처분",
      solution: "보고서 접수 즉시 ① 지적사항 발췌 → ② 공무팀/생산팀에 '개선 요청서' 발행 → ③ 개선 전/후 사진 확보 → ④ '개선완료 확인서'에 안전책임자 서명 결재 완료 후 편철",
      checklist: [
        "월별 안전대행 순회점검표 누락 없는지 확인 (격주 방문)",
        "보건관리 상태보고서(월 1회) 분기별 묶음 확인",
        "지적사항에 대한 사내 조치결과 증빙사진(Before/After) 첨부"
      ]
    },
    {
      domain: "법정 안전검사 (설비)",
      icon: "truck",
      badge: "대상 설비별 검사 관리",
      summary: "산업안전보건법상 안전검사 대상 기계는 시행령 제78조 및 관련 고시의 적용범위에 따라 판단해야 합니다.",
      mistake: "지게차와 컨베이어를 모두 법정 안전검사 대상으로 분류하거나, 설비 종류와 적용범위를 확인하지 않고 일률적으로 검사 주기를 적용함",
      solution: "설비별 종류·규격·설치 상태와 법정 제외 조건을 확인한 후 안전검사 대상 여부 및 검사 이력을 관리합니다. 대상 설비는 차기 검사일을 사전에 등록하고 검사 결과를 보관합니다.",
      checklist: [
        "지게차: 법정 안전검사 대상과 구분하여 작업 시작 전 점검 실시",
        "컨베이어: 시행령 제78조 및 관련 고시의 적용범위와 제외 조건 확인",
        "압력용기: 해당 설비의 안전검사 대상 여부와 검사 유효기간 확인",
        "검사 대상 설비: 검사 결과 및 차기 검사 예정일 관리"
      ]
    },
    {
      domain: "작업환경측정",
      icon: "activity",
      badge: "반기 측정 및 특례 확인",
      summary: "작업환경측정은 원칙적으로 반기별 1회 이상 실시합니다. 법정 요건을 충족하는 경우 일부 측정 대상에 연 1회 특례가 적용될 수 있습니다.",
      mistake: "소음 80dB 초과만으로 측정 주기가 3~6개월로 단축된다고 판단하거나, 80% 생산 가동률과 근로자대표 입회 서명을 일률적인 법정 의무로 오인함",
      solution: "산업안전보건법 시행규칙 제190조에 따라 측정 주기를 판단합니다. 소음은 최근 2회 연속 85dB 미만 등 법정 요건을 충족해야 연 1회 특례를 검토할 수 있습니다. 측정은 통상적인 작업조건을 반영할 수 있도록 실시합니다.",
      checklist: [
        "작업환경측정 대상 유해인자 및 공정 확인",
        "시행규칙 제190조에 따른 측정 주기 확인",
        "측정 시 통상적인 작업조건과 작업상태가 반영되는지 확인",
        "측정 결과의 근로자 안내 및 초과 공정 개선조치 확인"
      ]
    },
    {
      domain: "건강검진 (일반/특수)",
      icon: "heart-pulse",
      badge: "1인당 과태료 부과",
      summary: "퇴사자 또는 휴직자가 검진을 안 받으면 회사와 근로자 모두에게 과태료가 나옵니다.",
      mistake: "미수검자를 방치하다가 연말에 병원 예약이 꽉 차서 수검 실패",
      solution: "상반기에 일반검진 명단 취합 후 10월까지 90% 수검 완료 유도. 특수건강진단은 배치전(입사 전) / 배치후(정기) 구분하여 인사팀과 채용 단계부터 사전 협의",
      checklist: [
        "특수검진 대상 유해요인(소음, 야간작업, 분진, 화학물질) 부서 명단 최신화",
        "유소견자(C, D 판정자)에 대한 의사 상담 및 사후관리소견서 편철",
        "검진 공가 부여 및 미수검자 재안내 확인서 서명 수령"
      ]
    },
    {
      domain: "산재 발생 시 골든타임",
      icon: "alert-octagon",
      badge: "가장 치명적 (1개월)",
      summary: "휴업 3일 이상 재해는 발생일로부터 1개월 이내에 무조건 고용노동부에 보고해야 합니다.",
      mistake: "'공상 처리(회사 비용 치료)'로 구두 합의했다가 나중에 근로자가 산재 신청 시 '산재 은폐'로 형사입건(1년 이하 징역) 또는 1,500만원 과태료 처분",
      solution: "사고 발생 즉시 치료 우선 후, 의사 진단서상 '3일 이상 휴업' 예상 시 지체없이 고용노동부에 '산업재해조사표' 제출. 근로자 대표 서명 필수",
      checklist: [
        "사고 발생 시 현장 보존 및 사고 원인 사진 촬영",
        "산업재해조사표 작성 후 근로자 대표 서명 수령",
        "관할 노동지청 산재예방지도과에 1개월 이내 팩스/인터넷 제출 및 접수증 보관",
        "재발방지대책 수립 및 수시 위험성평가 즉시 실시"
      ]
    },
    {
      domain: "산업안전보건위원회",
      icon: "users-round",
      badge: "사업장별 설치 기준 확인",
      summary: "산업안전보건위원회 설치 여부는 사업의 종류와 사업장의 상시근로자 수를 기준으로 판단합니다.",
      mistake: "모든 제조업 사업장에 50인 기준을 일률적으로 적용하거나, 회의록 게시 사진이 없으면 곧바로 과태료 대상이라고 오인함",
      solution: "산업안전보건법 제24조 및 시행령 제34조·별표 9에 따라 설치 대상 여부를 확인합니다. 식료품 제조업은 원칙적으로 상시근로자 100명 이상인 사업장이 설치 대상이며, 위원회는 노사 동수로 구성하고 정기회의는 분기마다 개최합니다.",
      checklist: [
        "사업장 업종 및 법정 상시근로자 수에 따른 설치 대상 여부 확인",
        "근로자위원과 사용자위원의 노사 동수 구성 확인",
        "시행령 제35조에 따른 위원 자격 및 구성 확인",
        "분기별 정기회의 개최 및 회의록 작성",
        "의결사항과 이행 결과를 근로자에게 안내하고 후속조치 관리"
      ]
    }
  ],

  // 3. 까먹기 쉬운 주요 법정 제출 기한 & 과태료 요약
  deadlineGuide: [
    { target: "산업재해조사표", deadline: "휴업 3일 이상 재해 발생 후 1개월 이내", penalty: "최대 1,500만원 (은폐 시 1년 징역)", authority: "관할 노동지청" },
    { target: "작업환경측정 결과보고", deadline: "측정 완료일로부터 30일 이내", penalty: "최대 1,000만원", authority: "관할 노동지청" },
    { target: "특수건강진단 결과보고", deadline: "검진 완료일로부터 30일 이내 (검진기관 대행)", penalty: "1인당 10~15만원", authority: "안전보건공단" },
    { target: "중대재해 발생 보고", deadline: "사망 1인 or 3개월 요양 2인 발생 시 '지체 없이(즉시)'", penalty: "최대 3,000만원", authority: "노동지청 / 경찰" },
    { target: "안전보건관리책임자 선임", deadline: "선임 사유 발생일로부터 14일 이내", penalty: "최대 500만원", authority: "관할 노동지청" }
  ]
};

window.SAFETY_TIPS_DATA = SAFETY_TIPS_DATA;

// ==============================================
// 4. 주기별(일·주·월·분기·연간) 실무 체크리스트 및 꿀팁
// ==============================================
const PERIODIC_CHECKLISTS = {
  daily: [
    {
      id: "chk-d-1",
      title: "작업 전 10분 안전미팅(TBM) 일지 확인",
      corp: "공통",
      desc: "생산부서 관리감독자가 주관하는 TBM 실시 여부 및 근로자 서명부 확인",
      tip: "💡 담당자가 매일 현장마다 다 돌아다닐 필요 없습니다! 생산팀 관리감독자에게 매일 아침 실시하게 하고, 우리는 '주 1회 일지 취합 및 서명 누락'만 점검하세요.",
      badge: "매일 아침"
    },
    {
      id: "chk-d-2",
      title: "전동지게차 운전자 작업 시작 전 점검 실시 확인",
      corp: "케이프라이드 / 보담",
      desc: "산업안전보건기준에 관한 규칙 제35조에 따라 제동·조종·하역·유압장치 등 이상 유무 점검",
      tip: "💡 작업 시작 전 지게차의 주요 안전장치 이상 유무를 점검하도록 관리합니다. 점검표 작성 및 보관은 사업장의 점검 이력 관리 방법으로 운영하며, 법정 의무 점검표 서식 미작성 자체를 관리감독자 과태료 대상으로 단정하지 않도록 유의하세요.",
      badge: "설비점검"
    },
    {
      id: "chk-d-3",
      title: "신규 입사자 발생 시 '신규채용자 안전교육' 일정 확인",
      corp: "공통",
      desc: "인사팀 채용 통보 즉시 현장 투입 전 1시간(일용직) / 8시간(정규직) 교육 실시",
      tip: "💡 현장 반장이 '급하니까 먼저 일 시키고 나중에 교육하자'고 할 때 절대 넘어가면 안 됩니다! 교육일지 서명 전에 다치면 100% 회사 책임(산재 및 중대재해)이 됩니다.",
      badge: "교육필수"
    },
    {
      id: "chk-d-4",
      title: "(주)보담 사내도급 공정(조인테크 등) 2일 1회 순회점검",
      corp: "보담",
      desc: "사내 상주 협력업체 도급 작업장 순회점검 일지 작성",
      tip: "💡 산안법 제64조에 따라 도급인(보담)은 수급인 작업장을 '2일에 1회 이상' 순회점검해야 합니다. 순회일지에 조인테크 현장 확인 서명을 꼭 남겨두세요.",
      badge: "도급의무"
    },
    {
      id: "chk-d-5",
      title: "현장 기본 보호구(안전모, 귀마개, 안전화) 착용 상태 지도",
      corp: "공통",
      desc: "패티가공실 소음구역 귀마개 및 상하차장 안전모·안전화 착용 모니터링",
      tip: "💡 귀마개를 턱에 걸치거나 안 끼는 작업자가 많습니다. 귀마개 미착용 적발 시 1차 경고, 3차 적발 시 근로자에게도 5만원 과태료가 부과됨을 안내하세요.",
      badge: "보건관리"
    }
  ],

  weekly: [
    {
      id: "chk-w-1",
      title: "현장 비상구 및 주통로 장애물 적재 점검",
      corp: "공통",
      desc: "비상탈출구 앞 파렛트 적재 여부 및 피난통로 80cm 이상 유효폭 확보",
      tip: "💡 비상구 앞에 파렛트나 박스를 임시로라도 쌓아두면 소방법 및 산안법 위반으로 즉시 시정명령 대상입니다. 발견 즉시 관리감독자에게 사진 전송해 치우게 하세요.",
      badge: "화재소방"
    },
    {
      id: "chk-w-2",
      title: "주간 TBM 일지 및 설비점검표 회수/편철",
      corp: "공통",
      desc: "각 생산라인 및 물류팀에서 작성된 1주일 치 TBM 및 점검표 회수",
      tip: "💡 금요일 오후에 수거함을 정해두고 한 번에 회수하세요. 빈칸이나 서명 누락이 있으면 바로 해당 반장에게 반려하고 보완받아야 밀리지 않습니다.",
      badge: "서류관리"
    },
    {
      id: "chk-w-3",
      title: "지게차 주행 통로 바닥 구획선 및 안전표지 점검",
      corp: "케이프라이드",
      desc: "보행자 통로와 지게차 주행로 구분선(황색선) 지워짐 여부 점검",
      tip: "💡 횡성 사업장 입출하장은 지게차 회전 반경이 좁아 충돌 위험이 큽니다. 바닥 황색 테이프가 훼손되었으면 공무팀에 즉시 보수를 요청하세요.",
      badge: "교통안전"
    }
  ],

  monthly: [
    {
      id: "chk-m-1",
      title: "안전관리 대행기관(대한안전관리본부) 격주 방문 동행 및 결과서 결재",
      corp: "케이프라이드 / 보담",
      desc: "월 2회 기술지도 동행, 현장 지적사항 접수 후 조치 전/후 사진 첨부하여 책임자 결재",
      tip: "💡 가장 중요한 업무! 대행기관 요원이 점검표를 주면 그냥 파일에 꽂아두지 마시고, '개선요청서'를 발행해 생산팀에서 조치 전/후 사진을 받아 서명 결재까지 끝내야 완결됩니다.",
      badge: "대행점검"
    },
    {
      id: "chk-m-2",
      title: "보건관리 대행기관(더케이) 월 1회 방문 및 유소견자 건강상담",
      corp: "케이프라이드 / 보담",
      desc: "월 1회 간호사/의사 방문 시 건강검진 요관찰자(C/D판정자) 상담 명단 사전 준비",
      tip: "💡 방문 3일 전에 인사팀에서 특수검진 유소견자 명단을 받아 상담 대상자를 지정해두세요. 상담일지에 근로자 서명을 받아두면 보건관리 의무가 입증됩니다.",
      badge: "보건대행"
    },
    {
      id: "chk-m-3",
      title: "AED(자동심장충격기) 매월 1일 정기점검표 작성 및 편철",
      corp: "공통",
      desc: "패드 유효기간(통상 2년), 배터리 녹색 정상 램프 점등 여부 점검",
      tip: "💡 매월 1일 점검표를 작성해 응급의료포털(E-Gen)에 입력하거나 사내 바인더에 편철하세요. 패드 유효기간 만료 1개월 전 미리 부품을 주문해야 합니다.",
      badge: "응급장비"
    },
    {
      id: "chk-m-4",
      title: "도급 안전보건협의체 월 1회 정기회의 실시 (보담-조인테크 등)",
      corp: "보담 / 케이프라이드",
      desc: "사내 수급업체 대표와 월 1회 회의 실시, 회의록 작성 및 서명 날인 보존",
      tip: "💡 협의체 회의를 거르면 500만원 과태료입니다. 도급업체 소장과 월말 고정 요일을 정해두고, 작업공정 간 간섭 위험(예: 지게차 동선, 청소시간)을 안건으로 다루세요.",
      badge: "도급관리"
    },
    {
      id: "chk-m-5",
      title: "월간 근로자 정기안전보건교육 실시 및 일지 정리",
      corp: "공통",
      desc: "반기 12시간을 채우기 위해 매월 1~2시간씩 분산 교육 실시 (서명부+교안 3년 보관)",
      tip: "💡 반기 말에 몰아서 12시간을 하려면 생산 차질이 생깁니다. 매월 2시간씩 분산 실시하고, 교안 1부와 자필 서명부를 반드시 3년간 보관하세요.",
      badge: "법정교육"
    }
  ],

  quarterly: [
    {
      id: "chk-q-1",
      title: "산업안전보건위원회 분기 정기회의 개최 (설치 대상 사업장)",
      corp: "케이프라이드(설치 대상 여부 확인 후 적용)",
      desc: "설치 대상 사업장은 근로자위원과 사용자위원을 노사 동수로 구성하고 분기별 정기회의 개최 및 회의록을 작성합니다.",
      tip: "💡 회의록을 작성하고 의결사항 및 이행 결과를 근로자에게 안내하세요. 게시판 게시나 사진 촬영은 회사의 기록·소통 관리 방법으로 활용할 수 있으나, 사진 보관을 일률적인 법정 의무로 표현하지 않습니다.",
      badge: "산보위"
    },
    {
      id: "chk-q-2",
      title: "도급인·수급인 합동 안전보건점검 (분기 1회 이상)",
      corp: "보담 / 케이프라이드",
      desc: "도급인 사업주(공장장)와 수급인 사업주(조인테크 대표 등)가 함께 현장 점검 실시",
      tip: "💡 월별 협의체 회의와는 별개로, 현장을 함께 돌며 점검하는 '합동점검표'를 분기 1회 작성해야 합니다. 점검자 란에 양사 대표/책임자 서명이 필수입니다.",
      badge: "합동점검"
    },
    {
      id: "chk-q-3",
      title: "관리감독자 정기교육(연 16시간) 분기별 이수 진도율 점검",
      corp: "공통",
      desc: "생산/공무/품질 부서장 및 팀장의 온라인/집합 교육 이수 현황 추적",
      tip: "💡 11월에 부랴부랴 챙기면 미이수자가 꼭 발생합니다. 상반기에 8시간, 하반기에 8시간 나눠서 듣도록 분기별로 이수증을 취합하세요.",
      badge: "관리감독자"
    }
  ],

  yearly: [
    {
      id: "chk-y-1",
      title: "연간 안전보건 목표 및 경영방침 수립 (대표이사 결재 및 사내 게시)",
      corp: "공통",
      desc: "중대재해처벌법 제4조 제1호에 따른 전사 안전보건 방침 결재 및 게시판 게시 (1월)",
      tip: "💡 중처법 수사의 1번 체크 항목입니다. 대표이사 서명이 들어간 경영방침 문서를 본관 로비와 현장 입구에 액자로 게시해 두어야 합니다.",
      badge: "중처법"
    },
    {
      id: "chk-y-2",
      title: "정기 위험성평가 실시 및 감소대책 수립 (연 1회 전 공정)",
      corp: "공통",
      desc: "유해요인 파악, 현장 근로자 의견 청취, 위험성 감소대책 실행 및 대표이사 결재",
      tip: "💡 평가서만 만들면 인정 안 됩니다! 평가 과정에 '현장 근로자가 참여한 서명부'와 감소대책에 따른 '개선 완료 사진'이 반드시 붙어 있어야 합니다.",
      badge: "위험성평가"
    },
    {
      id: "chk-y-3",
      title: "작업환경측정 실시 (원칙적으로 반기별 1회 이상)",
      corp: "케이프라이드 / 보담",
      desc: "소음, 분진 등 작업환경측정 대상 유해인자 확인 및 법정 주기에 따른 측정 실시",
      tip: "💡 패티가공실의 89.8dB(A) 측정 결과는 소음 연 1회 측정 특례 기준인 최근 2회 연속 85dB 미만에 해당하지 않습니다. 반기 측정 기준으로 관리하고, 측정 시 통상적인 작업조건이 반영되도록 측정기관과 일정을 조율하세요.",
      badge: "작업환경"
    },
    {
      id: "chk-y-4",
      title: "일반 및 특수건강진단 실시 및 유소견자 사후관리 (연 1회)",
      corp: "공통",
      desc: "일반검진(연 1회, 사무직 2년 1회) 및 소음·야간작업 특수건강진단 실시",
      tip: "💡 10월까지 미수검자가 없도록 독려하세요. 퇴사자도 퇴사 전에 검진을 받아야 과태료를 피할 수 있습니다. D1/D2 유소견자는 의사 사후관리 조치를 문서로 남기세요.",
      badge: "건강검진"
    },
    {
      id: "chk-y-5",
      title: "중대재해처벌법 반기별(연 2회: 6월, 12월) 이행점검 보고서 결재",
      corp: "공통",
      desc: "안전보건 관계법령 의무이행 반기 점검 보고서 작성 및 대표이사 최종 결재",
      tip: "💡 6월 말, 12월 말 기준으로 상·하반기 각 1회씩 대표이사에게 공식 보고서를 올려 서명을 받아두어야 합니다. 서명 문서가 없으면 중처법 1년 이상 징역 리스크가 발생합니다.",
      badge: "중처법반기"
    },
    {
      id: "chk-y-6",
      title: "법정 안전검사 대상 설비의 검사 이력 및 차기 검사일 관리",
      corp: "사업장별 대상 설비 확인 후 적용",
      desc: "시행령 제78조 및 관련 고시에 따라 안전검사 대상 여부와 설비별 검사 유효기간을 확인하고 관리",
      tip: "💡 지게차는 산업안전보건법상 안전검사 대상 기계에 포함되지 않습니다. 컨베이어 등은 설비별 적용범위와 제외 조건을 확인한 뒤 대상 설비에 한해 법정 검사 주기를 적용하세요.",
      badge: "설비검사"
    }
  ]
};

window.SAFETY_TIPS_DATA.periodicChecklists = PERIODIC_CHECKLISTS;

// ==============================================
// 5. 최신 사원연명부 및 법정 의무이행 실적 (2026년 실시간 vs 2025년 결산)
// ==============================================
const CORP_STATS_BY_YEAR = {
  '2026': [
    {
      corp_name: "케이프라이드",
      year: "2026",
      worker_count: 225,
      gender_male: 78,
      gender_female: 147,
      regular_workers: 133,
      contract_workers: 91,
      risk_assessment_rate: 94,
      risk_assessment_status: "편철 준비 중 (11.20 마감)",
      health_check_rate: 98,
      health_check_status: "가을 출장검진 완료 / 2차 정밀검진 추적 관리 중",
      status_summary: "2026년 10월 최신 사원연명부 기준: 225명 (정규직 133 / 계약직 91)"
    },
    {
      corp_name: "보담",
      year: "2026",
      worker_count: 99,
      gender_male: 34,
      gender_female: 65,
      regular_workers: 62,
      contract_workers: 37,
      risk_assessment_rate: 91,
      risk_assessment_status: "정기 이행 중 (도급 합동점검 완비)",
      health_check_rate: 100,
      health_check_status: "가을 출장검진 완료 / 11월 수검 독려 진행 중",
      status_summary: "2026년 10월 최신 사원연명부 기준: 99명 (정규직 62 / 계약직 37)"
    },
    {
      corp_name: "케이펙",
      year: "2026",
      worker_count: 28,
      gender_male: 15,
      gender_female: 13,
      regular_workers: 18,
      contract_workers: 10,
      risk_assessment_rate: 88,
      risk_assessment_status: "2026년 자체 관리",
      health_check_rate: 96,
      health_check_status: "2026년 수검 진행 중",
      status_summary: "2026년 최신 사원연명부 기준: 28명 (남 15 / 여 13)"
    }
  ],
  '2025': [
    {
      corp_name: "케이프라이드",
      year: "2025",
      worker_count: 324,
      gender_male: 113,
      gender_female: 211,
      regular_workers: 212,
      contract_workers: 112,
      risk_assessment_rate: 94,
      risk_assessment_status: "2025년 정기 위험성평가표 및 감소대책 완료 (확정)",
      health_check_rate: 98,
      health_check_status: "2025년 일반·특수건강진단 사후관리소견서 완비 (확정)",
      status_summary: "2025년 결산 사원연명부 기준: 324명 (정규직 212 / 계약직 112)"
    },
    {
      corp_name: "보담",
      year: "2025",
      worker_count: 280,
      bodam_own: 111,
      baekdu_merge: 169,
      gender_male: 73,
      gender_female: 207,
      regular_workers: 178,
      contract_workers: 102,
      risk_assessment_rate: 91,
      risk_assessment_status: "2025년 정기 위험성평가 개선대책 완결 (확정)",
      health_check_rate: 100,
      health_check_status: "2025년 일반·특수건강진단 전원 수검 완료 (확정)",
      status_summary: "2025년 결산 기준: 280명 [보담 111명 + 백두대간 169명 통합 집계]"
    },
    {
      corp_name: "케이펙",
      year: "2025",
      worker_count: 34,
      gender_male: 21,
      gender_female: 13,
      regular_workers: 22,
      contract_workers: 12,
      risk_assessment_rate: 88,
      risk_assessment_status: "2025년 완결",
      health_check_rate: 96,
      health_check_status: "2025년 완결",
      status_summary: "2025년 결산 사원연명부 기준: 34명 (남 21 / 여 13)"
    }
  ]
};

const ROSTER_STATS = {
  byYear: {
    '2026': {
      baseDate: "2026-10 최신본",
      totalWorkers: 324,
      kpride: {
        corpName: "(주)케이프라이드",
        total: 225,
        gender: { male: 78, female: 147 },
        employment: { regular: 133, contract: 91, other: 1 },
        departments: [
          { dept: "M본부 (영업/매장/유통)", count: 104, riskLevel: "보통" },
          { dept: "가공생산과 (제조)", count: 27, riskLevel: "주의 (소음/회전체)" },
          { dept: "식육생산과 (제조)", count: 26, riskLevel: "주의 (육절/골절기)" },
          { dept: "SCM팀 (물류/상하차)", count: 25, riskLevel: "주의 (지게차/중량물)" },
          { dept: "경영자원본부 (인적자원/안전)", count: 22, riskLevel: "일반" },
          { dept: "가열생산과 (제조)", count: 10, riskLevel: "주의 (고열/화상)" },
          { dept: "자금회계팀", count: 5, riskLevel: "일반" },
          { dept: "품질관리팀 (실험/검사)", count: 4, riskLevel: "보통 (화학/검사)" },
          { dept: "상품생산과", count: 1, riskLevel: "보통" },
          { dept: "대표이사(CEO)", count: 1, riskLevel: "총괄" }
        ]
      },
      bodam: {
        corpName: "(주)보담",
        total: 99,
        gender: { male: 34, female: 65 },
        employment: { regular: 62, contract: 37 },
        departments: [
          { dept: "생산부 (신선생산/가공)", count: 58, riskLevel: "주의 (기계설비)" },
          { dept: "식육사업본부", count: 18, riskLevel: "주의 (식육가공)" },
          { dept: "SCM/물류팀", count: 12, riskLevel: "주의 (지게차 운행)" },
          { dept: "관리/회계/계열화", count: 10, riskLevel: "일반" },
          { dept: "대표이사(CEO)", count: 1, riskLevel: "총괄" }
        ]
      },
      kpec: {
        corpName: "(주)케이펙",
        total: 28,
        gender: { male: 15, female: 13 },
        employment: { regular: 18, contract: 10 }
      }
    },
    '2025': {
      baseDate: "2025-12 결산본",
      totalWorkers: 604,
      kpride: {
        corpName: "(주)케이프라이드",
        total: 324,
        gender: { male: 113, female: 211 },
        employment: { regular: 212, contract: 112 },
        departments: [
          { dept: "M본부 (영업/매장/유통)", count: 146, riskLevel: "보통" },
          { dept: "가공생산부 (제조)", count: 44, riskLevel: "주의 (소음/회전체)" },
          { dept: "식육사업본부 (제조)", count: 40, riskLevel: "주의 (육절/골절기)" },
          { dept: "신선생산팀", count: 28, riskLevel: "주의" },
          { dept: "경영자원본부 (인적자원/안전)", count: 23, riskLevel: "일반" },
          { dept: "SCM팀 (물류/상하차)", count: 23, riskLevel: "주의 (지게차)" },
          { dept: "상품팀", count: 7, riskLevel: "보통" },
          { dept: "품질관리팀", count: 5, riskLevel: "보통" },
          { dept: "자금회계담당", count: 4, riskLevel: "일반" },
          { dept: "CEO/임원", count: 4, riskLevel: "총괄" }
        ]
      },
      bodam: {
        corpName: "(주)보담 (백두대간 합산)",
        total: 280,
        gender: { male: 73, female: 207 },
        employment: { regular: 178, contract: 102 },
        mergeDetail: "보담(111명) + 백두대간(169명) 통합",
        departments: [
          { dept: "백두대간 식육가공/생산 (합산)", count: 169, riskLevel: "주의 (식육/가공)" },
          { dept: "보담 본사 생산부 (가공제조)", count: 68, riskLevel: "주의 (기계설비)" },
          { dept: "보담 식육사업본부", count: 22, riskLevel: "주의" },
          { dept: "보담 관리/물류/영업", count: 21, riskLevel: "일반/주의" }
        ]
      },
      kpec: {
        corpName: "(주)케이펙",
        total: 34,
        gender: { male: 21, female: 13 },
        employment: { regular: 22, contract: 12 }
      }
    }
  }
};

// 레거시 호환
ROSTER_STATS.baseDate = ROSTER_STATS.byYear['2026'].baseDate;
ROSTER_STATS.totalWorkers = ROSTER_STATS.byYear['2026'].totalWorkers;
ROSTER_STATS.kpride = ROSTER_STATS.byYear['2026'].kpride;
ROSTER_STATS.bodam = ROSTER_STATS.byYear['2026'].bodam;

window.SAFETY_TIPS_DATA.corpStatsByYear = CORP_STATS_BY_YEAR;
window.SAFETY_TIPS_DATA.rosterStats = ROSTER_STATS;

// ==============================================
// 6. ISO 45001 안전보건경영시스템 현황 및 전용 체크리스트
// ==============================================
const ISO45001_DATA = {
  meta: {
    standard: "ISO 45001:2018 / KS Q ISO 45001:2018",
    certBody: "한국기업인증원 (KOCI, 심사원 김용식)",
    kprideCert: "kociO-2d45211 (유효기간: 2024.11.28 ~ 2027.11.27)",
    bodamCert: "kociO-2d45213 (유효기간: 2024.12.02 ~ 2027.12.01)",
    status: "2차 사후심사 수검 완료 (결과서 및 조치 대기)",
    scope: "(주)케이프라이드 · (주)보담 2사 통합 관리 (백두대간 제외 완료)"
  },
  orgAlert: {
    title: "현장 관리감독자 2명 및 안전보건총괄책임자 공석 발생",
    desc: "윤현구 부장(책임자) 및 김지혜·김가현 과장(관리감독자) 퇴사로 인한 공석 발생. 김희영 팀장(인적자원팀장) 및 김계원 과장(가공) 중심 대응 중",
    action: "현장 반장/조장 2명 신규 관리감독자 지정서 발급 및 연 16시간 교육 필수"
  },
  checklists: [
    {
      id: "iso-chk-1",
      title: "ISO 45001 최초 인증 취득 완료 (케이프라이드, 보담)",
      desc: "2024년 11월 한국기업인증원(KOCI) 공식 인증서 취득 및 심사보고서 편철",
      tip: "💡 인증 유효기간은 3년(2027년 11월 말까지)이며, 매년 1회씩 사후심사를 받아야 유효성이 유지됩니다.",
      badge: "최초인증",
      initialDone: true
    },
    {
      id: "iso-chk-2",
      title: "1차 사후심사 수검 및 설문서 완료 (2025년)",
      desc: "2025년 2월 1차 사후심사 수검 및 심사 만족도 설문서 완료",
      tip: "💡 1차 사후심사 관련 세금계산서 및 계획확인서가 보관되어 있습니다.",
      badge: "1차사후",
      initialDone: true
    },
    {
      id: "iso-chk-3",
      title: "2026년 2차 사후심사 현장 수검 완료 (10.26~10.29)",
      desc: "보담(10.26~27) 및 케이프라이드(10.28~29) KOCI 김용식 심사원 현장 실사 수검 완료",
      tip: "💡 현장 실사는 무사히 끝났으며, 심사결과보고서 및 시정조치요구서 수령 단계입니다.",
      badge: "2차사후",
      initialDone: true
    },
    {
      id: "iso-chk-4",
      title: "백두대간영농조합법인 공식 제외 및 2사 통합 체제 개편",
      desc: "인력 타법인 이동에 따라 백두대간은 심사 및 관리 대상에서 영구 제외 정리",
      tip: "💡 향후 케이프라이드와 보담 2개 사업장만 집중 관리하시면 됩니다.",
      badge: "체제개편",
      initialDone: true
    },
    {
      id: "iso-chk-5",
      title: "최신 위험성평가표(2026.10.28) 심사본 반영 및 편철",
      desc: "심사 당일 제출된 2026년 10월 최신 위험성평가표 최종본 보관 완료",
      tip: "💡 위험성평가 담당자가 전임 심연석에서 김희영 인적자원팀장으로 명의 교체 반영되었습니다.",
      badge: "위험성평가",
      initialDone: true
    },
    {
      id: "iso-chk-6",
      title: "2차 사후심사 결과보고서 및 시정조치요구서 확인",
      desc: "김희영 팀장님께 확인: KOCI 김용식 심사원이 전달한 심사결과서 또는 지적사항(NC/OBS) 수령 확인",
      tip: "💡 통상 심사 후 1~2주 이내에 개선계획서 및 증빙 사진을 인증원에 제출해야 인증이 최종 유지됩니다. (한국기업인증원 김용식 심사원 010-5394-2619)",
      badge: "긴급(1~2일)"
    },
    {
      id: "iso-chk-7",
      title: "신규 관리감독자 2명 선임 및 지정서 발급",
      desc: "퇴사한 김지혜, 김가현 과장 공석을 대체할 현장 반장/조장 2명 선임",
      tip: "💡 ISO 지침서(QESH-PI-02 안전보건 인원선임) 양식으로 '관리감독자 지정서'를 발급하고 법정 직무교육(연 16시간) 수강을 안내하세요.",
      badge: "조직공백해소"
    },
    {
      id: "iso-chk-8",
      title: "안전보건관리책임자 갱신 선임 및 서류 명의 반영",
      desc: "퇴사한 윤현구 부장 공석 ➡️ 공장장 또는 총괄 임원 명의로 관리책임자 선임 확인",
      tip: "💡 관할 노동지청 선임 보고 및 위험성평가표 조직도에 신규 책임자 이름을 반영해 두어야 합니다.",
      badge: "조직공백해소"
    },
    {
      id: "iso-chk-9",
      title: "심사 당일 제출했던 현장 실물 서류 바인더 회수",
      desc: "심사 테이블에 올렸던 안전교육일지, 점검표, 보호구 지급대장, 근골격계 조사표 등 출력본 회수",
      tip: "💡 심사 서류철이 흩어지면 다음 심사 때 다시 찾아야 하므로, 'ISO45001 전용 서류함'에 묶음으로 보관하세요.",
      badge: "서류정리"
    },
    {
      id: "iso-chk-10",
      title: "연간 내부심사 계획 수립 및 경영검토보고서 작성 준비",
      desc: "사내 표준양식(SH-11 내부심사, SH-12 경영검토)에 따른 정기 내부 점검 프로세스 가동",
      tip: "💡 ISO 45001 규정상 1년에 최소 1회 이상 전사 내부심사와 대표이사 경영검토 보고가 이루어져야 합니다.",
      badge: "내부심사"
    },
    {
      id: "iso-chk-11",
      title: "2027년 말 3년 주기 갱신심사(Recertification) 대비 일정 확인",
      desc: "인증 만료일(케이프라이드: 2027.11.27 / 보담: 2027.12.01) 3개월 전 갱신심사 신청",
      tip: "💡 2027년 하반기에는 사후심사가 아니라 '갱신심사'이므로 사전 계약 연장이 필요합니다.",
      badge: "갱신심사"
    }
  ]
};

window.SAFETY_TIPS_DATA.isoData = ISO45001_DATA;
PERIODIC_CHECKLISTS.iso = ISO45001_DATA.checklist;
window.SAFETY_TIPS_DATA.periodicChecklists = PERIODIC_CHECKLISTS;

// ==========================================
// 6. 월간 법정 안전보건 캘린더 데이터 (Option 3)
// ==========================================
const SAFETY_CALENDAR_EVENTS = [
  {
    id: "cal-1",
    date: "2026-11-06",
    title: "컨베이어 2기 재검사 합격필증 확인 마감",
    type: "critical",
    corp: "케이프라이드",
    category: "법정안전검사",
    desc: "N-1, N-2 수평 컨베이어 검사유효기간(2024.03.03) 경과. 공무팀 확인 및 안전보건공단 포털(kosa.kosha.or.kr) 재발급 편철.",
    tip: "💡 노동부 불시감독 시 미검사 설비 사용은 즉시 사용중지 명령 및 1,000만 원 이하 과태료 대상입니다.",
    ddayText: "오늘 마감 (D-Day)"
  },
  {
    id: "cal-2",
    date: "2026-11-06",
    title: "안전보건관리책임자 교육 수료증 회수",
    type: "warning",
    corp: "케이프라이드/보담",
    category: "법정교육",
    desc: "이승수(10.15 보수), 김태열(10.28 신규) 관리책임자 교육 수료증 사본 출력 및 바인더 편철.",
    tip: "💡 수강 통지서만으로는 노동부 점검 시 인정되지 않으므로 온라인 수료증 원본 사본을 반드시 편철해야 합니다.",
    ddayText: "오늘 마감"
  },
  {
    id: "cal-3",
    date: "2026-11-10",
    title: "ISO 45001 사후심사 결과보고서 수령",
    type: "info",
    corp: "전 법인",
    category: "ISO45001",
    desc: "한국기업인증원(KOCI) 김용식 심사원으로부터 2차 사후심사 결과보고서 수령 및 부적합 시정조치서 작성 준비.",
    tip: "💡 지적된 경부적합/권고사항은 접수 후 30일 이내에 시정조치 결과서를 제출해야 인증이 유지됩니다.",
    ddayText: "D-4"
  },
  {
    id: "cal-4",
    date: "2026-11-10",
    title: "대한안전관리본부 안전대행 계약 연장 확인",
    type: "warning",
    corp: "공통",
    category: "전문기관위탁",
    desc: "10.31 계약기간 만료에 따른 2026년 계약 자동연장 확인 공문 수령 및 6~10월 방문기술지도 일지 편철.",
    tip: "💡 위탁계약 공백 시 안전관리자 미선임으로 간주되어 500만 원 이하 과태료가 부과될 수 있습니다.",
    ddayText: "D-4"
  },
  {
    id: "cal-5",
    date: "2026-11-15",
    title: "사내도급업체 협의체 회의 및 점검표 확인",
    type: "warning",
    corp: "보담(조인테크) / 케이프라이드(케이펙)",
    category: "도급관리",
    desc: "도급인-수급인 11월 안전보건협의체 정기회의록 및 2일에 1회 작업장 순회점검 일지 누락 점검.",
    tip: "💡 산안법 제64조에 따라 사내도급이 상주하는 경우 월 1회 협의체 회의 및 분기 1회 합동점검이 법적 강행규정입니다.",
    ddayText: "D-9"
  },
  {
    id: "cal-6",
    date: "2026-11-20",
    title: "중처법 상반기 반기점검 결재문서 보관 확인",
    type: "warning",
    corp: "전 법인",
    category: "중대재해처벌법",
    desc: "중대재해처벌법상 반기 1회 이상 안전보건 관계법령 의무이행 점검 보고서 경영책임자 결재문서 편철 점검.",
    tip: "💡 중처법 조사 시 가장 먼저 확인하는 문서입니다. 대표이사 서명 결재본이 바인더에 보관되어 있어야 합니다.",
    ddayText: "D-14"
  },
  {
    id: "cal-7",
    date: "2026-11-25",
    title: "2026년 4분기 산업안전보건위원회 정기회의",
    type: "info",
    corp: "전 법인",
    category: "회의체",
    desc: "노사 동수로 구성된 산업안전보건위원회 4분기 정기회의 개최 (동절기 한파 방한용품 및 난방설비 안전점검 안건 상정).",
    tip: "💡 시행령 제35조에 따른 위원 구성과 분기별 정기회의 개최 여부를 확인하고, 회의록과 의결사항 이행 결과를 관리하세요.",
    ddayText: "D-19"
  },
  {
    id: "cal-8",
    date: "2026-12-18",
    title: "하반기 작업환경측정 예정일",
    type: "warning",
    corp: "케이프라이드",
    category: "작업환경측정",
    desc: "상반기(06.18) 패티가공실 소음 89.8 dB(A) 측정 결과에 따라 반기 측정 기준으로 관리하는 차기 측정 예정일. 건강한일터와 일정 확인 요망.",
    tip: "💡 작업환경측정은 시행규칙 제190조에 따라 실시합니다. 측정 당일에는 통상적인 작업조건과 유해인자 노출 상태가 대표성 있게 반영되도록 측정기관과 사전 조율하세요.",
    ddayText: "D-42"
  }
];

// ==========================================
// 7. 법정 필수 서식 및 일지 다운로드 허브 (Option 1)
// ==========================================
const SAFETY_FORMS_DATA = [
  {
    id: "form-tbm",
    category: "일일 현장 점검",
    title: "작업 전 10분 안전미팅(TBM) 일지",
    format: "HWP / XLSX / PDF",
    lawRef: "고용노동부 TBM 가이드라인 및 중처법",
    retention: "3년 보존",
    cycle: "매일 작업 전 (10분)",
    desc: "생산 공정별 관리감독자가 주관하여 당일 작업 위험요인을 공유하고 근로자 참석 서명을 받는 법정 표준 양식",
    items: ["일시 및 작업장소", "공정별 작업내용", "주요 유해·위험요인 (끼임/미끄러짐/소음)", "보호구 착용 점검", "참석 근로자 서명란"],
    previewHtml: `
      <div class="border border-slate-300 p-6 bg-white text-slate-800 font-sans text-xs space-y-4">
        <div class="text-center border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">작업 전 10분 안전미팅(TBM) 활동 일지</h2>
          <p class="text-[11px] text-slate-500 mt-1">(주)케이프라이드 · (주)보담 횡성 사업장</p>
        </div>
        <table class="w-full border-collapse border border-slate-300 text-center text-[11px]">
          <tr class="bg-slate-100">
            <th class="border border-slate-300 p-1.5 w-24">실시 일자</th>
            <td class="border border-slate-300 p-1.5">2026년 &nbsp;&nbsp;월 &nbsp;&nbsp;일 ( &nbsp; )</td>
            <th class="border border-slate-300 p-1.5 w-24">실시 시간</th>
            <td class="border border-slate-300 p-1.5"> &nbsp;:&nbsp; ~ &nbsp;:&nbsp; (10분)</td>
          </tr>
          <tr>
            <th class="border border-slate-300 p-1.5 bg-slate-100">소속 부서</th>
            <td class="border border-slate-300 p-1.5">생산부 ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) 라인</td>
            <th class="border border-slate-300 p-1.5 bg-slate-100">진행자(관리감독자)</th>
            <td class="border border-slate-300 p-1.5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (서명/인)</td>
          </tr>
        </table>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">1. 당일 작업 내용 및 중점 위험요인 공유</h4>
          <div class="border border-slate-300 p-3 min-h-[60px] text-slate-600 bg-slate-50/50">
            • 가공육 원료 이송 컨베이어 투입 시 회전체 접촉/끼임 주의<br>
            • 바닥 물기 및 기름기로 인한 미끄러짐 방지 (위생안전화 착용 철저)<br>
            • 패티 성형기 및 포장 프레스 가동 중 안전센서/인터록 해제 절대 금지
          </div>
        </div>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">2. 개인보호구 착용 및 건강상태 확인</h4>
          <div class="border border-slate-300 p-2.5 flex justify-around text-slate-700 bg-slate-50/50">
            <span>[ ] 위생모/안전모</span>
            <span>[ ] 안전화 (미끄럼방지)</span>
            <span>[ ] 방음 귀마개</span>
            <span>[ ] 위생장갑/방진마스크</span>
            <span>[ ] 작업자 건강 이상 무</span>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">3. 참석 근로자 서명부 (총 &nbsp;&nbsp;&nbsp; 명 참석)</h4>
          <table class="w-full border-collapse border border-slate-300 text-center text-[10px]">
            <tr class="bg-slate-100 font-bold">
              <td class="border border-slate-300 p-1 w-10">No</td><td class="border border-slate-300 p-1">성명</td><td class="border border-slate-300 p-1 w-20">서명</td>
              <td class="border border-slate-300 p-1 w-10">No</td><td class="border border-slate-300 p-1">성명</td><td class="border border-slate-300 p-1 w-20">서명</td>
            </tr>
            <tr><td class="border border-slate-300 p-1.5">1</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5">5</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td></tr>
            <tr><td class="border border-slate-300 p-1.5">2</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5">6</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td></tr>
            <tr><td class="border border-slate-300 p-1.5">3</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5">7</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td></tr>
            <tr><td class="border border-slate-300 p-1.5">4</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5">8</td><td class="border border-slate-300 p-1.5"></td><td class="border border-slate-300 p-1.5"></td></tr>
          </table>
        </div>
      </div>
    `
  },
  {
    id: "form-forklift",
    category: "일일 현장 점검",
    title: "전동지게차 작업시작 전 일일점검표",
    format: "HWP / XLSX / PDF",
    lawRef: "산업안전보건기준에 관한 규칙 제35조 및 별표 3",
    retention: "3년 보존",
    cycle: "매일 1회 운행 전 (운전자 직접 작성)",
    desc: "작업 시작 전 지게차의 제동장치·조종장치·하역장치·유압장치·바퀴 및 경보장치 등의 이상 유무를 점검합니다. 점검표 작성 및 보관은 점검 이력 관리 방법으로 운영할 수 있습니다.",
    items: ["제동장치 및 조종장치 기능", "하역장치 및 유압장치 이상 유무", "전조등·후미등·후진경보기 및 안전벨트", "타이어 공기압 및 휠 마모 상태"],
    previewHtml: `
      <div class="border border-slate-300 p-6 bg-white text-slate-800 font-sans text-xs space-y-4">
        <div class="text-center border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">전동지게차 작업시작 전 점검표</h2>
          <p class="text-[11px] text-slate-500 mt-1">산업안전보건기준에 관한 규칙 제35조 및 별표 3 관련 / 횡성 사업장</p>
        </div>
        <table class="w-full border-collapse border border-slate-300 text-center text-[11px]">
          <tr class="bg-slate-100">
            <th class="border border-slate-300 p-1.5 w-24">차량 번호(호기)</th><td class="border border-slate-300 p-1.5">도요타 2.5톤 (1호기)</td>
            <th class="border border-slate-300 p-1.5 w-24">점검 일자</th><td class="border border-slate-300 p-1.5">2026년 &nbsp;&nbsp;월 &nbsp;&nbsp;일</td>
          </tr>
          <tr>
            <th class="border border-slate-300 p-1.5 bg-slate-100">운전자 성명</th><td class="border border-slate-300 p-1.5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (서명)</td>
            <th class="border border-slate-300 p-1.5 bg-slate-100">관리감독자 확인</th><td class="border border-slate-300 p-1.5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (인)</td>
          </tr>
        </table>
        <table class="w-full border-collapse border border-slate-300 text-[11px]">
          <tr class="bg-slate-100 font-bold text-center">
            <td class="border border-slate-300 p-1.5 w-12">No</td><td class="border border-slate-300 p-1.5">점검 항목</td><td class="border border-slate-300 p-1.5 w-20">판정 (O/X)</td><td class="border border-slate-300 p-1.5">조치 내용 및 비고</td>
          </tr>
          <tr><td class="border border-slate-300 p-1.5 text-center">1</td><td class="border border-slate-300 p-1.5">제동장치(브레이크) 및 조향장치 기능 이상 유무</td><td class="border border-slate-300 p-1.5 text-center">[ 양호 ]</td><td class="border border-slate-300 p-1.5">밀림 없음 확인</td></tr>
          <tr><td class="border border-slate-300 p-1.5 text-center">2</td><td class="border border-slate-300 p-1.5">하역장치(포크, 마스트, 체인) 균열 및 변형 유무</td><td class="border border-slate-300 p-1.5 text-center">[ 양호 ]</td><td class="border border-slate-300 p-1.5">체인 장력 정상</td></tr>
          <tr><td class="border border-slate-300 p-1.5 text-center">3</td><td class="border border-slate-300 p-1.5">유압계통 오일 누유 여부 및 배터리 충전 상태</td><td class="border border-slate-300 p-1.5 text-center">[ 양호 ]</td><td class="border border-slate-300 p-1.5">누유 없음</td></tr>
          <tr><td class="border border-slate-300 p-1.5 text-center">4</td><td class="border border-slate-300 p-1.5">전조등, 후미등, 경음기, 후진경보음 및 경광등 작동</td><td class="border border-slate-300 p-1.5 text-center">[ 양호 ]</td><td class="border border-slate-300 p-1.5">경보음 음량 적정</td></tr>
          <tr><td class="border border-slate-300 p-1.5 text-center">5</td><td class="border border-slate-300 p-1.5">헤드가드, 백레스트 손상 유무 및 좌석 안전벨트</td><td class="border border-slate-300 p-1.5 text-center">[ 양호 ]</td><td class="border border-slate-300 p-1.5">벨트 체결 정상</td></tr>
          <tr><td class="border border-slate-300 p-1.5 text-center">6</td><td class="border border-slate-300 p-1.5">타이어 손상, 균열 및 마모 상태</td><td class="border border-slate-300 p-1.5 text-center">[ 양호 ]</td><td class="border border-slate-300 p-1.5">공기압 적정</td></tr>
        </table>
      </div>
    `
  },
  {
    id: "form-hire-training",
    category: "안전보건 교육",
    title: "신규채용자 안전보건교육 일지 및 서명부",
    format: "HWP / PDF",
    lawRef: "산업안전보건법 제29조 (채용 시 8시간 교육)",
    retention: "3년 보존",
    cycle: "신규 입사자 발생 시 현장 투입 전",
    desc: "신규 입사자 발생 즉시 8시간(일용직 1시간) 교육을 실시하고 노동부 감독 시 과태료를 방어하는 법정 필수 서식",
    items: ["교육 일시 및 장소", "교육 강사 (안전관리자/관리감독자)", "교육 과목 (산안법, 설비 위험성, 비상대피)", "피교육자 명단 및 자필 서명"],
    previewHtml: `
      <div class="border border-slate-300 p-6 bg-white text-slate-800 font-sans text-xs space-y-4">
        <div class="text-center border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">신규채용자 정기 안전보건교육 실시 결과보고서</h2>
          <p class="text-[11px] text-slate-500 mt-1">산업안전보건법 제29조제2항 관련 (정규직·계약직 8시간 의무교육)</p>
        </div>
        <table class="w-full border-collapse border border-slate-300 text-center text-[11px]">
          <tr class="bg-slate-100">
            <th class="border border-slate-300 p-1.5 w-24">교육 일자</th><td class="border border-slate-300 p-1.5">2026년 &nbsp;&nbsp;월 &nbsp;&nbsp;일 ~ &nbsp;&nbsp;월 &nbsp;&nbsp;일 (총 8시간)</td>
            <th class="border border-slate-300 p-1.5 w-24">교육 장소</th><td class="border border-slate-300 p-1.5">횡성 본사 교육실 / 현장실습</td>
          </tr>
          <tr>
            <th class="border border-slate-300 p-1.5 bg-slate-100">교육 실시자</th><td class="border border-slate-300 p-1.5">소속: 인적자원팀 &nbsp; 직위: 팀장/담당 &nbsp; 성명: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (인)</td>
            <th class="border border-slate-300 p-1.5 bg-slate-100">교육 구분</th><td class="border border-slate-300 p-1.5">[v] 신규채용시 교육 (8시간)</td>
          </tr>
        </table>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">■ 주요 교육 내용</h4>
          <table class="w-full border-collapse border border-slate-300 text-[11px]">
            <tr class="bg-slate-100"><td class="border border-slate-300 p-1.5 w-24 font-bold text-center">교과목</td><td class="border border-slate-300 p-1.5 font-bold text-center">교육 세부 항목 (산안법 시행규칙 별표 4)</td><td class="border border-slate-300 p-1.5 w-16 text-center font-bold">시간</td></tr>
            <tr><td class="border border-slate-300 p-1.5 text-center">기계·기구</td><td class="border border-slate-300 p-1.5">• 육가공 기계(컨베이어, 육절기, 혼합기, 포장기)의 위험성과 안전작업방법</td><td class="border border-slate-300 p-1.5 text-center">3시간</td></tr>
            <tr><td class="border border-slate-300 p-1.5 text-center">물질안전보건</td><td class="border border-slate-300 p-1.5">• 소독세척제 등 화학물질 유해·위험성(MSDS) 및 취급 시 주의사항</td><td class="border border-slate-300 p-1.5 text-center">2시간</td></tr>
            <tr><td class="border border-slate-300 p-1.5 text-center">보건관리</td><td class="border border-slate-300 p-1.5">• 중량물 취급 및 근골격계질환 예방, 소음작업장 방음보호구 착용법</td><td class="border border-slate-300 p-1.5 text-center">2시간</td></tr>
            <tr><td class="border border-slate-300 p-1.5 text-center">비상조치</td><td class="border border-slate-300 p-1.5">• 화재 및 비상시 대피요령, 사업장 비상연락망 및 응급처치 요령</td><td class="border border-slate-300 p-1.5 text-center">1시간</td></tr>
          </table>
        </div>
      </div>
    `
  },
  {
    id: "form-committee",
    category: "회의체 & 협의체",
    title: "산업안전보건위원회 분기 정기회의록",
    format: "HWP / XLSX / PDF",
    lawRef: "산업안전보건법 제24조",
    retention: "2년 보존",
    cycle: "매 분기 1회 이상 (연 4회)",
    desc: "근로자 대표와 사용자 대표 동수 참석하여 안전보건 예산, 한파 대책, 현장 개선안을 의결하는 법정 공식 회의록",
    items: ["일시 및 회의장소", "사용자위원 / 근로자위원 참석 서명부", "부의 안건 및 심의·의결 사항", "결정사항 이행 계획"],
    previewHtml: `
      <div class="border border-slate-300 p-6 bg-white text-slate-800 font-sans text-xs space-y-4">
        <div class="text-center border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">2026년도 제 &nbsp; 분기 산업안전보건위원회 정기회의록</h2>
          <p class="text-[11px] text-slate-500 mt-1">산업안전보건법 제24조 관련 / (주)케이프라이드 · (주)보담</p>
        </div>
        <table class="w-full border-collapse border border-slate-300 text-center text-[11px]">
          <tr class="bg-slate-100">
            <th class="border border-slate-300 p-1.5 w-24">회의 일시</th><td class="border border-slate-300 p-1.5">2026년 &nbsp;&nbsp;월 &nbsp;&nbsp;일 ( &nbsp; ) &nbsp;&nbsp;:&nbsp;&nbsp; ~ &nbsp;&nbsp;:&nbsp;&nbsp;</td>
            <th class="border border-slate-300 p-1.5 w-24">회의 장소</th><td class="border border-slate-300 p-1.5">본사 2층 대회의실</td>
          </tr>
          <tr>
            <th class="border border-slate-300 p-1.5 bg-slate-100">위원장</th><td class="border border-slate-300 p-1.5">대표이사 김도영 (인)</td>
            <th class="border border-slate-300 p-1.5 bg-slate-100">근로자대표</th><td class="border border-slate-300 p-1.5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (인)</td>
          </tr>
        </table>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">■ 주요 심의 및 의결 안건</h4>
          <div class="border border-slate-300 p-3 text-slate-700 bg-slate-50/50 space-y-2">
            <p><strong>[제1호 안건] 동절기 한파 및 폭설 대비 현장 안전관리 조치 건</strong><br>
            • 의결결과: 야외 상하차 작업장 온열쉼터 가동, 핫팩 및 방한장갑 전원 지급, 결빙구역 모래/염화칼슘 사전 비치 (원안 가결)</p>
            <p><strong>[제2호 안건] 가공라인 컨베이어 방호가드 보강 및 정기점검의 건</strong><br>
            • 의결결과: 공무팀 주관으로 전동 구동부 덮개 볼트 체결상태 전수 점검 및 개선 완료 (원안 가결)</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "form-accident",
    category: "산재 및 사후관리",
    title: "산업재해 발생경위서 및 재발방지대책서",
    format: "HWP / XLSX / PDF",
    lawRef: "산업안전보건법 제57조",
    retention: "3년 보존",
    cycle: "재해 발생 시 즉시",
    desc: "사고 발생 즉시 6하 원칙에 따라 경위를 조사하고 재발방지대책을 수립하는 사내 공식 보고서",
    items: ["재해자 인적사항 (성명, 입사일, 직무)", "사고 발생 일시 및 구체적 경위", "직접 원인 (불안전한 상태·행동)", "재발방지대책 및 조치 기한"],
    previewHtml: `
      <div class="border border-slate-300 p-6 bg-white text-slate-800 font-sans text-xs space-y-4">
        <div class="text-center border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">산업재해 발생 경위서 및 재발방지 계획서</h2>
          <p class="text-[11px] text-slate-500 mt-1">산업안전보건법 제57조 관련 / 대내외 보고용 표준 서식</p>
        </div>
        <table class="w-full border-collapse border border-slate-300 text-[11px]">
          <tr class="bg-slate-100 text-center font-bold">
            <td class="border border-slate-300 p-1.5 w-20">소속</td><td class="border border-slate-300 p-1.5">생산팀</td>
            <td class="border border-slate-300 p-1.5 w-20">성명</td><td class="border border-slate-300 p-1.5">홍 길 동</td>
            <td class="border border-slate-300 p-1.5 w-20">입사일자</td><td class="border border-slate-300 p-1.5">2025.03.10</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-1.5 bg-slate-100 font-bold text-center">발생 일시</td>
            <td colspan="2" class="border border-slate-300 p-1.5 text-center">2026년 &nbsp;&nbsp;월 &nbsp;&nbsp;일 &nbsp;&nbsp;시 &nbsp;&nbsp;분</td>
            <td class="border border-slate-300 p-1.5 bg-slate-100 font-bold text-center">발생 장소</td>
            <td colspan="2" class="border border-slate-300 p-1.5 text-center">횡성공장 1층 가공실</td>
          </tr>
        </table>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">■ 재해 발생 경위 (6하 원칙 상세 기술)</h4>
          <div class="border border-slate-300 p-3 min-h-[50px] text-slate-600 bg-slate-50/50 leading-relaxed">
            2026년 O월 O일 OO시경 가공실에서 원료육 박스를 해체하여 컨베이어로 투입하던 중, 바닥에 묻은 수분으로 인해 발이 미끄러지며 우측 발목을 접질림. 현장 응급처치 후 관내 정형외과로 후송하여 치료 조치함.
          </div>
        </div>
        <div>
          <h4 class="font-bold text-slate-900 mb-1">■ 재발방지 대책</h4>
          <div class="border border-slate-300 p-3 text-slate-700 bg-slate-50/50 space-y-1">
            <p>1. [환경 개선] 원자재 해동라인 주변 트렌치 배수로 청소 및 논슬립 미끄럼방지 패드 전면 설치</p>
            <p>2. [보호구] 전 작업자 위생화 밑창 마모상태 점검 및 미끄럼방지 1등급 안전화로 일괄 교체</p>
            <p>3. [교육] 매일 아침 TBM 시 보행 중 뛰기 금지 및 이동 통로 수분 제거 지도</p>
          </div>
        </div>
      </div>
    `
  }
];

window.SAFETY_TIPS_DATA.calendarEvents = SAFETY_CALENDAR_EVENTS;
window.SAFETY_TIPS_DATA.safetyForms = SAFETY_FORMS_DATA;


// ==============================================
// 7. 안전보건관리체계 (절차서 · 지침서 체계)
// ==============================================
const SAFETY_SYSTEM_DOCS = [
  {
    "code": "안전-G-01",
    "title": "안전보건관리규정",
    "kind": "지침서",
    "clause": "산안법 제25조",
    "description": "사업장 안전보건관리에 관한 최상위 사내 자율 규범(안전보건관리규정)",
    "isHidden": false,
    "subForms": [],
    "cycle": "상시 (개정 시 산안위 심의)",
    "approver": "경영책임자 (대표이사)",
    "retention": "영구 보존 (산안법 제25조)",
    "checkpoints": [
      "상시 근로자 100인 이상 사업장 필수 제정 규정",
      "근로자 의견 수렴 및 산업안전보건위원회 심의·의결",
      "전 근로자가 열람할 수 있는 장소에 게시 또는 사내망 비치"
    ]
  },
  {
    "code": "안전-G-02",
    "title": "작업장 안전조치",
    "kind": "지침서",
    "clause": "안전보건규칙",
    "description": "추락, 전도, 충돌, 협착 방지 등 제조 현장 필수 안전수칙 및 조치지침",
    "isHidden": false,
    "subForms": [],
    "cycle": "상시 (일일 점검)",
    "approver": "공정별 관리감독자",
    "retention": "1년 (점검일지)",
    "checkpoints": [
      "통로의 바닥 미끄럼 방지 패드 부착 및 수분·유분 제거",
      "기계 설비 방호장치(비상정지장치, 덮개, 인터록) 정상 작동 확인",
      "작업장 조도(75럭스 이상) 및 정리정돈(3정 5S) 상태 유지"
    ]
  },
  {
    "code": "안전-G-03",
    "title": "개인보호구 지급 및 관리",
    "kind": "지침서",
    "clause": "산안법 제114조",
    "description": "공정별 필수 개인보호구(안전화, 방한모, 위생복 등) 지급 기준 및 대장 관리",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-G-03-6-1",
        "title": "보호구의 종류",
        "isHidden": false
      },
      {
        "code": "안전-G-03-6-2",
        "title": "작업종류에 따른 보호구",
        "isHidden": false
      },
      {
        "code": "안전-G-03-6-3",
        "title": "보호구 지급대장",
        "isHidden": false
      }
    ],
    "cycle": "지급 시 수시 / 일일 점검",
    "approver": "관리감독자",
    "retention": "3년 (보호구 지급대장)",
    "checkpoints": [
      "KCS 안전인증 마크가 부착된 규격 보호구(안전화, 방한모 등) 구비",
      "개인별 보호구 지급대장 작성 및 근로자 수령 서명 확보",
      "위생화 및 안전화 밑창 마모 점검 및 즉시 교체"
    ]
  },
  {
    "code": "안전-G-04",
    "title": "물질안전보건자료 관리",
    "kind": "지침서",
    "clause": "산안법 제110조",
    "description": "화학물질 물질안전보건자료(MSDS) 비치, 경고표지 부착 및 취급자 교육",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-G-04-6-1",
        "title": "물질안전보건자료(MSDS) 리스트",
        "isHidden": false
      }
    ],
    "cycle": "신규 물질 반입 시 즉시 / 상시",
    "approver": "보건관리자 / 관리감독자",
    "retention": "3년 (특별관리물질은 30년)",
    "checkpoints": [
      "화학물질(세척제, 살균소독제, 냉매 등) MSDS 16개 항목 비치",
      "소분 용기마다 MSDS 경고표지(그림문자, 신호어) 전면 부착",
      "취급 근로자 대상 반입 시 사전 안전교육 실시 및 교육일지 편철"
    ]
  },
  {
    "code": "안전-G-05",
    "title": "근로자 건강진단 관리지침",
    "kind": "지침서",
    "clause": "산안법 제129조",
    "description": "일반건강검진 및 특수건강진단 주기별 실시, 유소견자 사후관리 지침",
    "isHidden": true,
    "subForms": [],
    "cycle": "일반검진(연 1회) / 특수검진(배치 전 및 반기·연 1회)",
    "approver": "보건관리자 / 안전보건관리책임자",
    "retention": "5년 (산안법 제129조~130조)",
    "checkpoints": [
      "사무직 2년 1회, 비사무직 매년 1회 일반건강검진 수검률 관리",
      "소음, 분진, 야간작업(8시간 기준) 근로자 대상 특수건강진단 실시",
      "검진 결과 D1(직업병), D2(일반질병) 유소견자 사후관리 상담 기록"
    ]
  },
  {
    "code": "안전-G-06",
    "title": "작업환경측정",
    "kind": "지침서",
    "clause": "산안법 제125조",
    "description": "소음, 분진, 화학물질 등 6개월 1회 정기 작업환경측정 실시 및 개선",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-G-06-6-1",
        "title": "작업환경측정 결과보고서",
        "isHidden": false
      }
    ],
    "cycle": "6개월 1회 (상반기, 하반기)",
    "approver": "보건관리전문기관 / 관리책임자",
    "retention": "5년 (발암성 물질은 30년)",
    "checkpoints": [
      "지정 측정기관을 통한 공정별 소음, 분진, 유기화합물 측정",
      "측정 결과보고서 노동부 보고(30일 이내) 및 산안위 보고",
      "노출기준 초과 공정 발생 시 공학적 개선 또는 보호구 강화 조치"
    ]
  },
  {
    "code": "안전-G-07",
    "title": "안전작업허가",
    "kind": "지침서",
    "clause": "산안법 제38조",
    "description": "화기작업, 고소작업, 밀폐공간 등 위험작업 사전 안전작업허가 승인 절차",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-G-07-6-1",
        "title": "안전작업허가서",
        "isHidden": false
      }
    ],
    "cycle": "위험작업 실시 전 수시",
    "approver": "안전보건관리책임자 / 공무팀장",
    "retention": "1년 (허가서 보관)",
    "checkpoints": [
      "화기작업(용접·용단), 고소작업(사다리·렌탈), 밀폐공간 사전 신청",
      "소화기 비치, 가스 농도 측정, 감시인 배치 등 안전조치 현장 확인",
      "승인된 허가서 현장 게시 후 작업 개시 및 작업 종료 후 잔불 확인"
    ]
  },
  {
    "code": "안전-G-08",
    "title": "밀폐공간작업 안전관리지침",
    "kind": "지침서",
    "clause": "안전보건규칙 618조",
    "description": "폐수처리장, 정화조 등 밀폐공간 산소·유해가스 측정 및 환기 안전지침",
    "isHidden": true,
    "subForms": [],
    "cycle": "밀폐공간 작업 시 수시",
    "approver": "안전관리자 / 관리감독자",
    "retention": "3년",
    "checkpoints": [
      "폐수처리조, 정화조, 맨홀 등 밀폐공간 출입 전 산소(18%~23.5%) 측정",
      "유해가스(황화수소 10ppm 이하, 일산화탄소 30ppm 이하) 측정 및 환기",
      "송기마스크, 삼각대, 구조용 로프 비치 및 감시인 상주 배치"
    ]
  },
  {
    "code": "안전-G-09",
    "title": "외주업체 안전관리지침",
    "kind": "지침서",
    "clause": "산안법 제63조",
    "description": "사내 상주 협력업체 및 공사 외주업체 현장 출입 및 안전수칙 준수 지침",
    "isHidden": true,
    "subForms": [],
    "cycle": "상시 (공사 및 용역 계약 시)",
    "approver": "안전보건관리책임자",
    "retention": "3년",
    "checkpoints": [
      "사내 공사 및 설비 보수 외주업체 안전작업계획서 사전 징구",
      "공사 투입 전 외주 근로자 대상 현장 안전수칙 사전 교육",
      "화기·전기 공사 시 사내 실무 관리자 전담 입회"
    ]
  },
  {
    "code": "안전-G-10",
    "title": "산업재해 조사활동",
    "kind": "지침서",
    "clause": "산안법 제57조",
    "description": "산업재해 발생 시 1개월 내 노동부 산재조사표 제출 및 원인조사 지침",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-G-10-6-1",
        "title": "산업재해조사표",
        "isHidden": false
      }
    ],
    "cycle": "산재 발생 시 즉시 (1개월 이내)",
    "approver": "안전보건관리책임자 / 대표이사",
    "retention": "3년 (산안법 제57조)",
    "checkpoints": [
      "휴업 3일 이상 부상·질병 발생 시 1개월 내 고용노동부 산재조사표 제출",
      "산재 발생 보고서 작성 및 근로자대표 참여 원인 규명",
      "산안위 심의 및 동종 설비·유사 공정 개선대책 수립"
    ]
  },
  {
    "code": "안전-P-05-01",
    "title": "리더십 및 방침관리",
    "kind": "절차서",
    "clause": "ISO 45001 제5.2절",
    "description": "최고경영자의 리더십 책무, 안전보건방침 공표 및 전사적 방침 전파 절차",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-05-01-6-1",
        "title": "안전보건방침",
        "isHidden": false
      }
    ],
    "cycle": "연 1회 (필요 시 수시 개정)",
    "approver": "경영책임자 (대표이사)",
    "retention": "5년 (영구 보존 권장)",
    "checkpoints": [
      "대표이사의 안전보건경영방침 서명 및 전사 공표(사내 게시판/홈페이지)",
      "전 근로자 대상 안전보건방침 전달 및 이해도 평가",
      "경영방침에 따른 연간 안전보건 목표 연계성 점검"
    ]
  },
  {
    "code": "안전-P-05-02",
    "title": "안전보건조직 및 역할",
    "kind": "절차서",
    "clause": "ISO 45001 제5.3절",
    "description": "안전보건관리책임자, 관리감독자 선임 및 조직별 안전보건 역할과 업무분장",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-05-02-5-1",
        "title": "산업안전보건 조직도-수정필요",
        "isHidden": false
      },
      {
        "code": "안전-P-05-02-5-2",
        "title": "업무분장표",
        "isHidden": false
      },
      {
        "code": "안전-P-05-02-5-3",
        "title": "안전보건관리책임자 선임서-수정필요",
        "isHidden": false
      },
      {
        "code": "안전-P-05-02-5-4",
        "title": "관리감독자지정서-수정필요",
        "isHidden": false
      },
      {
        "code": "안전-P-05-02-5-5",
        "title": "안전관리자ㆍ보건관리자ㆍ산업보건의 선임 등 보고서",
        "isHidden": false
      }
    ],
    "cycle": "연 1회 (인사 발령 시 수시 갱신)",
    "approver": "경영책임자 (대표이사) / 안전보건관리책임자",
    "retention": "3년 (선임서 및 지정서 철)",
    "checkpoints": [
      "상시 50인 이상 사업장 안전보건관리책임자 선임 및 노동부 보고(14일 이내)",
      "공정별 관리감독자(팀장·직장) 업무분장 및 지정서 교부 완료 여부",
      "안전·보건관리전문기관 위탁 기술지도 계약서 및 위탁 관리감독자 점검표 관리"
    ]
  },
  {
    "code": "안전-P-06-01",
    "title": "위험성평가 관리 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제6.1.2절",
    "description": "유해위험요인 파악, 정기 및 수시 위험성평가 추진체계 및 감소대책 수립 절차",
    "isHidden": true,
    "subForms": [],
    "cycle": "정기(연 1회) 및 수시(기계·설비 도입 또는 사고 발생 시)",
    "approver": "안전보건관리책임자 (위원장)",
    "retention": "3년 이상 (산안법 제36조)",
    "checkpoints": [
      "위험성평가 시 해당 공정 근로자 참여 및 청취조사 실시",
      "평가 결과에 따른 유해위험요인 감소대책 수립 및 실행(개선 조치)",
      "산업안전보건위원회 심의·의결 및 전 근로자 평가 결과 게시·주지"
    ]
  },
  {
    "code": "안전-P-06-02",
    "title": "법규관리",
    "kind": "절차서",
    "clause": "ISO 45001 제6.1.3절",
    "description": "산업안전보건법 및 관계법령 등록부 관리, 제·개정 법규 영향성 검토 및 대응",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-06-02-6-1",
        "title": "산업안전보건법령요지",
        "isHidden": false
      },
      {
        "code": "안전-P-06-02-6-2",
        "title": "법규등록부",
        "isHidden": false
      },
      {
        "code": "안전-P-06-02-6-3",
        "title": "법규검토서",
        "isHidden": false
      },
      {
        "code": "안전-P-06-02-6-4",
        "title": "개정법규 대응방안",
        "isHidden": false
      }
    ],
    "cycle": "반기 1회 (법규 개정 시 즉시)",
    "approver": "안전보건관리책임자",
    "retention": "3년",
    "checkpoints": [
      "산업안전보건법 및 중대재해처벌법 등 관계 법령 등록부 최신화",
      "사업장 적용 법규 요구사항 준수 여부 반기별 자체 평가",
      "법규 위반 또는 미이행 사항 발견 시 즉시 개선 계획 수립"
    ]
  },
  {
    "code": "안전-P-06-03",
    "title": "목표 및 추진계획",
    "kind": "절차서",
    "clause": "ISO 45001 제6.2절",
    "description": "안전보건 목표 수립, 연간 세부 실행 추진계획서 작성 및 모니터링",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-06-03-5-1",
        "title": "안전보건목표",
        "isHidden": false
      },
      {
        "code": "안전-P-06-03-5-2",
        "title": "안전보건 추진계획서",
        "isHidden": false
      },
      {
        "code": "안전-P-06-03-5-3",
        "title": "2025년 안전보건예산 편성 및 집행 내역",
        "isHidden": false
      },
      {
        "code": "안전-P-06-03-5-4",
        "title": "안전보건교육 계획표",
        "isHidden": false
      },
      {
        "code": "안전-P-06-03-5-5",
        "title": "안전보건교육 일지",
        "isHidden": false
      }
    ],
    "cycle": "연 1회 (매년 1월 수립)",
    "approver": "경영책임자 (대표이사)",
    "retention": "5년",
    "checkpoints": [
      "사고 사망자 Zero 및 재해율 감축 등 정량적 안전목표 설정",
      "목표 달성을 위한 안전예산(교육, 시설개선, 보호구) 편성 및 집행 내역",
      "분기별 추진 실적 점검 및 산안위 보고"
    ]
  },
  {
    "code": "안전-P-06-04",
    "title": "안전보건관리책임자등의 업무수행 평가 절차서",
    "kind": "절차서",
    "clause": "중대재해처벌법 제4조",
    "description": "안전보건관리책임자 및 관리감독자의 업무수행 충실성 반기별 평가 절차",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-06-04-01",
        "title": "안전보건관리책임자등 평가기준 및 평가표",
        "isHidden": false
      }
    ],
    "cycle": "반기 1회 (상반기 6월, 하반기 12월)",
    "approver": "경영책임자 (대표이사)",
    "retention": "5년 (중처법 시행령 제4조)",
    "checkpoints": [
      "관리책임자 및 관리감독자가 부여된 법정 안전보건 업무를 충실히 수행하는지 평가",
      "평가 기준 및 점수표에 따른 객관적 평가 증빙 바인더 보관",
      "평가 결과 미흡 사항에 대한 조치(예산 지원, 교육, 시정 지시)"
    ]
  },
  {
    "code": "안전-P-07-01",
    "title": "자원 및 교육훈련 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제7.2절",
    "description": "법정 안전보건교육(정기/신규/특별/관리감독자) 연간 계획 수립 및 이행",
    "isHidden": true,
    "subForms": [],
    "cycle": "월 1회 / 분기 1회 / 신규 입사 시",
    "approver": "안전보건관리책임자",
    "retention": "3년 (교육일지 및 서명부)",
    "checkpoints": [
      "정기안전보건교육(매분기 사무직 3시간, 생산직 6시간 이상) 이수 및 서명 확보",
      "신규 채용 시 교육(8시간) 및 특별안전보건교육(16시간) 해당 공정 실시",
      "관리감독자 연간 16시간 직무교육(공단/협회) 이수 증빙"
    ]
  },
  {
    "code": "안전-P-07-02",
    "title": "의사소통 및 문서기록관리 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제7.5절",
    "description": "안전보건경영시스템 문서 및 기록물의 보존 연한, 등록, 배포, 폐기 절차",
    "isHidden": true,
    "subForms": [],
    "cycle": "상시 (수시)",
    "approver": "안전보건관리책임자",
    "retention": "문서별 3년~5년",
    "checkpoints": [
      "안전보건 관리 시스템 문서의 최신 개정본 번호 관리(색인 목록표)",
      "현장 작업장 내 구버전 문서 회수 및 폐기 처리",
      "근로자 의견 수렴 창구(안전 건의함, TBM 의견) 운영 및 처리 기록"
    ]
  },
  {
    "code": "안전-P-08-01",
    "title": "도급 및 외주업체 안전관리 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제8.1.4절",
    "description": "도급·수급인 적격 수급업체 평가, 안전보건협의체 및 합동점검 운영 관리",
    "isHidden": true,
    "subForms": [],
    "cycle": "월 1회(협의체) / 분기 1회(합동점검)",
    "approver": "안전보건관리책임자 (도급인)",
    "retention": "3년 (산안법 제64조)",
    "checkpoints": [
      "도급인-수급인(케이펙, 조인테크 등) 안전보건협의체 매월 1회 정기회의 실시 및 회의록",
      "도급인 및 수급인 사업주·근로자가 함께하는 분기별 분기 합동점검 실시",
      "위험 작업 시 도급인 안전작업허가 승인 및 입회 감독"
    ]
  },
  {
    "code": "안전-P-08-02",
    "title": "비상시 대비 및 대응",
    "kind": "절차서",
    "clause": "ISO 45001 제8.2절",
    "description": "비상사태(화재, 폭발, 질식, 풍수해, 지진 등) 대비 대응 및 모의훈련 실시",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-08-02-6-1",
        "title": "화재 대피 및 피난 유도 훈련 시나리오",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-10",
        "title": "비상훈련 모의훈련 평가표.hwp-확인필",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-2",
        "title": "재해 발생 훈련 시나리오",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-3",
        "title": "환경오염 방재 시나리오",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-4",
        "title": "화재 및 폭발 시나리오",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-5",
        "title": "풍수해 전개 시나리오",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-6",
        "title": "지진대응 시나리오",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-7",
        "title": "비상통제 조직도",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-8",
        "title": "비상통제 조직별 업무분장",
        "isHidden": false
      },
      {
        "code": "안전-P-08-02-6-9",
        "title": "비상훈련 실시 보고서.hwp-확인필",
        "isHidden": false
      }
    ],
    "cycle": "연 1회 이상 (모의훈련)",
    "approver": "안전보건관리책임자 / 대표이사",
    "retention": "3년 (훈련보고서 및 사진)",
    "checkpoints": [
      "화재, 정전, 암모니아 누출, 지진, 밀폐공간 등 비상 시나리오 수립",
      "비상통제 조직도 및 비상연락망(소방서, 병원, 지자체) 최신화",
      "전 근로자 참여 비상 대피 훈련 실시 및 모의훈련 평가표 작성"
    ]
  },
  {
    "code": "안전-P-09-01",
    "title": "성과측정 및 준수평가",
    "kind": "절차서",
    "clause": "ISO 45001 제9.1절",
    "description": "작업장 안전순회점검, 법규준수 평가 및 계측·측정장비 교정 검사 관리",
    "isHidden": false,
    "subForms": [
      {
        "code": "안전-P-09-01-5-1",
        "title": "성과측정 및 모니터링 기준",
        "isHidden": false
      },
      {
        "code": "안전-P-09-01-5-2",
        "title": "성과측정 및 모니터링 체크리스트 결과보고서",
        "isHidden": false
      },
      {
        "code": "안전-P-09-01-5-3",
        "title": "법규준수 평가서",
        "isHidden": false
      },
      {
        "code": "안전-P-09-01-5-4",
        "title": "측정장비 관리대장",
        "isHidden": false
      }
    ],
    "cycle": "주 1회(순회점검) / 반기 1회(법규준수)",
    "approver": "안전보건관리책임자",
    "retention": "3년",
    "checkpoints": [
      "사업장 안전순회점검 일지 작성 및 지적사항 개선 조치 완료 확인",
      "작업환경측정 및 근로자 건강진단 결과 유소견자 모니터링",
      "가스감지기, 방폭 설비, 계측기기 검교정 주기 준수"
    ]
  },
  {
    "code": "안전-P-09-02",
    "title": "내부심사 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제9.2절",
    "description": "안전보건경영시스템 적합성 및 실행효과 검증을 위한 연간 내부심사 실시",
    "isHidden": true,
    "subForms": [],
    "cycle": "연 1회",
    "approver": "안전보건관리책임자 / 대표이사",
    "retention": "3년",
    "checkpoints": [
      "사내 독립된 내부심사팀 구성 및 연간 심사 계획 수립",
      "ISO 45001 요구사항 및 사내 규정 준수 여부 부서별 심사",
      "심사 결과 부적합 사항에 대한 시정조치 요구 및 완료 확인"
    ]
  },
  {
    "code": "안전-P-09-03",
    "title": "경영검토 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제9.3절",
    "description": "최고경영자 주관 안전보건경영시스템 운영실적 반기 및 연간 경영검토",
    "isHidden": true,
    "subForms": [],
    "cycle": "연 1회 이상",
    "approver": "경영책임자 (대표이사)",
    "retention": "5년",
    "checkpoints": [
      "최고경영자 주관 안전보건 성과, 목표 달성도, 심사 결과 보고",
      "안전보건 자원(예산, 인력)의 적절성 검토 및 경영자 의사결정",
      "경영검토 결과 회의록 작성 및 후속 조치 반영"
    ]
  },
  {
    "code": "안전-P-10-01",
    "title": "사고조사 및 시정조치 절차서",
    "kind": "절차서",
    "clause": "ISO 45001 제10.2절",
    "description": "사고·아차사고 원인 조사, 부적합 사항에 대한 근본 시정조치 및 재발방지",
    "isHidden": true,
    "subForms": [],
    "cycle": "사고 또는 아차사고 발생 시 즉시",
    "approver": "안전보건관리책임자 / 대표이사",
    "retention": "3년 (산안법 제57조)",
    "checkpoints": [
      "사고 발생 1개월 이내 관할 지방고용노동관서 산재조사표 제출",
      "사고 조사 위원회 구성 및 근본 원인(인적·물적·관리적) 분석",
      "동종 사고 재발방지대책 수립 및 이행 확인"
    ]
  }
];

window.SAFETY_TIPS_DATA.systemDocs = SAFETY_SYSTEM_DOCS;
