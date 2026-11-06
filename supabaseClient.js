/**
 * Supabase 클라이언트 연동 모듈
 * 프로젝트 URL: https://yqvkcejsmitfyzewtrrk.supabase.co
 * Publishable Key: sb_publishable_pHr5nXlzh6IG2Xruhxr_4g_tjXalPaB
 */

const SUPABASE_CONFIG = {
  url: "https://yqvkcejsmitfyzewtrrk.supabase.co",
  key: "sb_publishable_pHr5nXlzh6IG2Xruhxr_4g_tjXalPaB"
};

// Supabase 클라이언트 초기화
let supabaseClient = null;
if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    console.log("✅ Supabase 클라이언트가 성공적으로 초기화되었습니다.");
  } catch (err) {
    console.warn("⚠️ Supabase 클라이언트 초기화 실패:", err);
  }
} else {
  console.warn("⚠️ @supabase/supabase-js 라이브러리가 로드되지 않았습니다.");
}

// 기본 초기 데이터 (DB 테이블 미생성 또는 오프라인 Fallback용)
const DEFAULT_SITE_CONFIG = {
  id: 1,
  system_name: "3사 통합 산업안전보건 관제 시스템",
  subtitle: "(주)케이프라이드 · (주)보담 · (주)케이펙",
  urgent_notice: "🚨 2026년 하반기 정부합동 안전보건 이행점검 대비 - 각 법인별 법정 점검필증 및 위탁서류 편철 필수",
  base_date: "",
  admin_pin: "1234",
  auto_refresh_sec: 30,
  show_org_contacts: false
};

const DEFAULT_ALERTS = [
  {
    id: 1,
    level: "critical",
    title: "안전관리 위탁계약 갱신 및 연장 확인",
    corp: "케이프라이드 / 보담",
    dday: "만기 도래 (2026.10.31)",
    desc: "대한안전관리본부(주) 계약기간 만료(2026.10.31). 자동연장 또는 갱신 계약서 작성 여부 및 6~10월 순회점검표 편철 확인 필요.",
    action_text: "대행기관(대한안전관리본부)에 연락하여 2026년 계약 자동연장 확인 공문을 수령하고, 월별 방문기술지도 일지 바인더 편철을 확인하세요.",
    status: "대기"
  },
  {
    id: 2,
    level: "warning",
    title: "차기 작업환경측정 예정일",
    corp: "케이프라이드",
    dday: "2026.12.18",
    desc: "2026년 상반기 패티가공실 최고 89.8 dB(A) 측정 결과에 따라 반기 측정 기준으로 관리. 건강한일터환경보건컨설팅과 차기 측정 일정 확인 요망.",
    action_text: "패티실 소음 89.8dB(A)는 연 1회 특례 기준을 충족하지 않으므로 반기 측정 기준으로 관리하세요. 통상적인 작업조건이 반영될 수 있도록 측정기관(건강한일터)과 사전에 일정을 조율하세요.",
    status: "진행중"
  },
  {
    id: 3,
    level: "warning",
    title: "컨베이어 2기 안전검사 대상 여부 및 검사 이력 확인",
    corp: "케이프라이드",
    dday: "확인 요망",
    desc: "N-1, N-2 컨베이어의 구동부 모터 정격출력(1.2kW 이하 제외) 및 총 이송거리 합계(10m 이하 제외) 등 법정 제외 조건을 확인하고, 대상 설비인 경우 검사 이력 및 차기 검사일을 확인해야 합니다.",
    action_text: "산업안전보건법 시행령 제78조 및 안전검사 절차에 관한 고시(고용노동부고시 제2020-42호 별표 1 제12호)의 구동부 출력(1.2kW 초과)과 구동 연속 이송거리(10m 이상)를 확인하여 대상 여부를 확정하고 차기 검사를 관리하세요.",
    status: "조치필요"
  },
  {
    id: 4,
    level: "info",
    title: "2026년 4분기 산업안전보건위원회 정기회의 개최",
    corp: "전 법인",
    dday: "2026.11.25",
    desc: "노사 동수로 구성된 산업안전보건위원회 4분기 정기회의 안건 취합 및 개최 준비 (동절기 한파 방한용품 및 난방설비 안전점검 안건 상정).",
    action_text: "노사 위원들과 회의 일정 및 안건을 사전에 조율하고, 회의록 양식을 구비하여 의결사항 및 이행 결과를 기록·관리하세요.",
    status: "예정"
  }
];

const DEFAULT_INSPECTIONS = [
  {
    id: 1,
    corp: "케이프라이드",
    inspection_type: "작업 시작 전 점검",
    equipment_name: "전동 지게차 (도요타 2.5톤)",
    location: "횡성 사업장 입출하장",
    last_date: "2026-05-15",
    next_date: "2027-05-14",
    status: "정상(양호)",
    inspector: "대한산업안전협회",
    notes: "작업시작 전 점검표 일일 작성 완료"
  },
  {
    id: 2,
    corp: "케이프라이드",
    inspection_type: "적용 여부 확인 필요",
    equipment_name: "원료 이송용 수평 컨베이어 (N-1)",
    location: "가공실(1층) 성형·배합 라인",
    last_date: "2024-03-10",
    next_date: "2026-03-09",
    status: "검사도래/서류점검",
    inspector: "한국안전기술협회",
    notes: "차기 정기 안전검사 필증 사본 편철 필요"
  },
  {
    id: 3,
    corp: "보담",
    inspection_type: "법정 안전검사",
    equipment_name: "지하 폐수처리장 국소배기장치",
    location: "횡성 사업장 폐수처리장",
    last_date: "2025-11-20",
    next_date: "2027-11-19",
    status: "정상(양호)",
    inspector: "산업안전보건공단",
    notes: "풍속 및 후드 흡입력 적정 유지 중"
  },
  {
    id: 4,
    corp: "케이펙",
    inspection_type: "적용 여부 확인 필요",
    equipment_name: "고압 공기압축기 (에어 컴프레셔)",
    location: "기계실 A구역",
    last_date: "2025-08-10",
    next_date: "2027-08-09",
    status: "정상(양호)",
    inspector: "한국에너지공단",
    notes: "압력용기 안전밸브 작동테스트 완료"
  },
  {
    id: 5,
    corp: "케이프라이드",
    inspection_type: "사업장 자체점검",
    equipment_name: "자동 포장기계 프레스 방호장치",
    location: "완제품 포장실",
    last_date: "2026-02-18",
    next_date: "2027-02-17",
    status: "정상(양호)",
    inspector: "자체 정밀점검",
    notes: "광전자식 방호장치 감응 속도 정상"
  }
];

const DEFAULT_NOTICES = [
  {
    id: 1,
    title: "[공지] 2026년 동절기 한파 및 폭설 대비 사업장 안전관리 행동요령",
    corp: "전 법인",
    author: "안전보건관리팀",
    date: "2026-11-03",
    is_pinned: true,
    content: "동절기 기온 급강하에 따른 야외 상하차 작업자 온열쉼터 운영, 핫팩 지급 및 빙판길 미끄럼 방지용 모래/염화칼슘 사전 비치를 완료해주시기 바랍니다."
  },
  {
    id: 2,
    title: "[교육] 관리감독자 정기 안전보건교육 (연간 16시간) 이수 현황 보고",
    corp: "전 법인",
    author: "보건관리자",
    date: "2026-10-25",
    is_pinned: false,
    content: "각 부서 관리감독자 분들께서는 11월 30일까지 대한안전보건연구원 온라인 교육 수료증 사본을 안전팀으로 제출해 주시기 바랍니다."
  },
  {
    id: 3,
    title: "[보건] 특수건강진단 대상자 2차 정밀검진 일정 안내",
    corp: "케이프라이드",
    author: "보건관리대행",
    date: "2026-10-18",
    is_pinned: false,
    content: "소음 및 분진 유해요인 종사자 대상 2차 추적검사가 11월 둘째 주 관내 원주의료원(검진센터)에서 진행됩니다. 해당 부서장은 공가 일정을 조율해 주시기 바랍니다."
  }
];

const DEFAULT_CORP_STATS = [
  {
    id: 1,
    corp_name: "케이프라이드",
    worker_count: 225,
    zero_accident_days: 418,
    risk_assessment_rate: 94,
    health_check_rate: 98,
    status_summary: "정상 가동 (최신 사원연명부 기준: 정규직 133명 / 계약직 91명)"
  },
  {
    id: 2,
    corp_name: "보담",
    worker_count: 99,
    zero_accident_days: 620,
    risk_assessment_rate: 91,
    health_check_rate: 100,
    status_summary: "우수 사업장 (최신 사원연명부 기준: 남 34명 / 여 65명)"
  },
  {
    id: 3,
    corp_name: "케이펙",
    worker_count: 28,
    zero_accident_days: 285,
    risk_assessment_rate: 88,
    health_check_rate: 96,
    status_summary: "정상 가동 (최신 사원연명부 기준: 남 15명 / 여 13명)"
  }
];

// Supabase DB API Wrapper 객체
const SafetyDB = {
  // 1. Supabase 연결 상태 테스트
  async checkConnection() {
    if (!supabaseClient) return { ok: false, error: "Supabase 라이브러리 미탑재" };
    try {
      // test query
      const { data, error } = await supabaseClient.from("site_config").select("id").limit(1);
      if (error) {
        // 테이블이 아직 없는 경우와 일반 연결 오류 구분
        if (error.code === "PGRST205" || error.message.includes("Could not find the table")) {
          return { ok: false, isTableMissing: true, error: "테이블 미생성 (SQL 스크립트 실행 필요)" };
        }
        return { ok: false, error: error.message };
      }
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // 2. 사이트 기본 설정 (site_config)
  async getSiteConfig() {
    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.from("site_config").select("*").limit(1).single();
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn("DB site_config 조회 실패, 로컬 데이터 사용:", e);
    }
    const local = localStorage.getItem("safety_site_config");
    return local ? JSON.parse(local) : DEFAULT_SITE_CONFIG;
  },

  async updateSiteConfig(configData) {
    localStorage.setItem("safety_site_config", JSON.stringify(configData));
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from("site_config").upsert({ ...configData, id: 1 });
        if (error) throw error;
        return { success: true, dbSynced: true };
      } catch (e) {
        console.warn("Supabase site_config 동기화 오류 (로컬에만 저장됨):", e);
        return { success: true, dbSynced: false, error: e.message };
      }
    }
    return { success: true, dbSynced: false };
  },

  // 3. 긴급 알림 & D-Day (alerts)
  async getAlerts() {
    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.from("alerts").select("*").order("id", { ascending: true });
        if (!error && data && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("DB alerts 조회 실패:", e);
    }
    const local = localStorage.getItem("safety_alerts");
    return local ? JSON.parse(local) : DEFAULT_ALERTS;
  },

  async saveAlerts(alertsList) {
    localStorage.setItem("safety_alerts", JSON.stringify(alertsList));
    if (supabaseClient) {
      try {
        // 일괄 upsert
        const { error } = await supabaseClient.from("alerts").upsert(alertsList);
        if (error) throw error;
        return { success: true, dbSynced: true };
      } catch (e) {
        return { success: true, dbSynced: false, error: e.message };
      }
    }
    return { success: true, dbSynced: false };
  },

  async deleteAlert(id) {
    let list = await this.getAlerts();
    list = list.filter(item => item.id !== id);
    localStorage.setItem("safety_alerts", JSON.stringify(list));
    if (supabaseClient) {
      try {
        await supabaseClient.from("alerts").delete().eq("id", id);
      } catch (e) {
        console.warn("DB alert 삭제 실패:", e);
      }
    }
    return list;
  },

  // 4. 안전검사 및 설비 점검 현황 (inspections)
  async getInspections() {
    let localList = [];
    try {
      const local = localStorage.getItem("safety_inspections");
      if (local) localList = JSON.parse(local);
    } catch (e) {
      console.warn("로컬 스토리지 파싱 실패:", e);
    }

    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.from("inspections").select("*").order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          const localMap = new Map(localList.map(item => [item.id, item]));
          const defaultMap = new Map(DEFAULT_INSPECTIONS.map(item => [item.id, item]));

          // DB 데이터에 inspection_type 병합 (DB 컬럼 미존재 시 localStorage/기본값 보존)
          const mergedFromDb = data.map(dbItem => {
            const localItem = localMap.get(dbItem.id);
            const defItem = defaultMap.get(dbItem.id);

            const inspectionType = dbItem.inspection_type 
              || (localItem && localItem.inspection_type) 
              || (defItem && defItem.inspection_type) 
              || "적용 여부 확인 필요";

            return {
              ...dbItem,
              inspection_type: inspectionType
            };
          });

          // DB에 아직 동기화되지 않은 신규 로컬 등록 항목도 유지
          const dbIds = new Set(data.map(d => d.id));
          const localOnlyItems = localList.filter(l => l && !dbIds.has(l.id));

          return [...mergedFromDb, ...localOnlyItems];
        }
      }
    } catch (e) {
      console.warn("DB inspections 조회 실패:", e);
    }

    return localList.length > 0 ? localList : DEFAULT_INSPECTIONS;
  },

  async saveInspections(inspectionsList) {
    localStorage.setItem("safety_inspections", JSON.stringify(inspectionsList));
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from("inspections").upsert(inspectionsList);
        if (error) throw error;
        return { success: true, dbSynced: true };
      } catch (e) {
        console.warn("DB inspections 저장 실패:", e);
        const isColumnMissing = e.message && (e.message.includes("inspection_type") || e.code === "42703");
        return { 
          success: true, 
          dbSynced: false, 
          isColumnMissing,
          error: isColumnMissing
            ? "Supabase 운영 테이블에 inspection_type 컬럼이 없어 브라우저 로컬에만 저장되었습니다. migration_add_inspection_type.sql을 실행해주세요."
            : e.message
        };
      }
    }
    return { success: true, dbSynced: false };
  },

  async deleteInspection(id) {
    let list = await this.getInspections();
    list = list.filter(item => item.id !== id);
    localStorage.setItem("safety_inspections", JSON.stringify(list));
    if (supabaseClient) {
      try {
        await supabaseClient.from("inspections").delete().eq("id", id);
      } catch (e) {
        console.warn("DB inspection 삭제 실패:", e);
      }
    }
    return list;
  },

  // 5. 공지사항 (safety_notices)
  async getNotices() {
    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.from("safety_notices").select("*").order("is_pinned", { ascending: false }).order("id", { ascending: false });
        if (!error && data && data.length > 0) return data;
      }
    } catch (e) {
      console.warn("DB safety_notices 조회 실패:", e);
    }
    const local = localStorage.getItem("safety_notices");
    return local ? JSON.parse(local) : DEFAULT_NOTICES;
  },

  async saveNotices(noticesList) {
    localStorage.setItem("safety_notices", JSON.stringify(noticesList));
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from("safety_notices").upsert(noticesList);
        if (error) throw error;
        return { success: true, dbSynced: true };
      } catch (e) {
        return { success: true, dbSynced: false, error: e.message };
      }
    }
    return { success: true, dbSynced: false };
  },

  async deleteNotice(id) {
    let list = await this.getNotices();
    list = list.filter(item => item.id !== id);
    localStorage.setItem("safety_notices", JSON.stringify(list));
    if (supabaseClient) {
      try {
        await supabaseClient.from("safety_notices").delete().eq("id", id);
      } catch (e) {
        console.warn("DB notice 삭제 실패:", e);
      }
    }
    return list;
  },

  // 6. 법인별 통계 (corp_stats)
  async getCorpStats() {
    try {
      if (supabaseClient) {
        const { data, error } = await supabaseClient.from("corp_stats").select("*").order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem("safety_corp_stats", JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn("DB corp_stats 조회 실패:", e);
    }
    const local = localStorage.getItem("safety_corp_stats");
    return local ? JSON.parse(local) : DEFAULT_CORP_STATS;
  },

  async saveCorpStats(statsList) {
    localStorage.setItem("safety_corp_stats", JSON.stringify(statsList));
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from("corp_stats").upsert(statsList);
        if (error) throw error;
        return { success: true, dbSynced: true };
      } catch (e) {
        return { success: true, dbSynced: false, error: e.message };
      }
    }
    return { success: true, dbSynced: false };
  },

  // 7. 전체 데이터를 기본 데이터로 리셋
  resetToDefault() {
    localStorage.setItem("safety_site_config", JSON.stringify(DEFAULT_SITE_CONFIG));
    localStorage.setItem("safety_alerts", JSON.stringify(DEFAULT_ALERTS));
    localStorage.setItem("safety_inspections", JSON.stringify(DEFAULT_INSPECTIONS));
    localStorage.setItem("safety_notices", JSON.stringify(DEFAULT_NOTICES));
    localStorage.setItem("safety_corp_stats", JSON.stringify(DEFAULT_CORP_STATS));
  }
};

window.SafetyDB = SafetyDB;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
