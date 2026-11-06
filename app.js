/**
 * 케이프라이드 · 보담 산업안전보건 관제 시스템 - 사용자 대시보드 스크립트
 * (케이펙 숨김 처리 및 주기별 체크리스트 완료 시 숨김 기능 탑재)
 */

let siteConfig = {};
let allAlerts = [];
let allInspections = [];
let allNotices = [];
let allCorpStats = [];
let selectedCorp = "ALL";
let statsChartInstance = null;

// 연도별 운영지표 / 사원연명부 모달 상태 (Option 1 연도별 탭 분리)
let currentStatsYear = "2026";
let currentRosterModalYear = "2026";

// 주기별 체크리스트 상태
let currentChecklistCycle = "daily";
let hideCompletedChecklist = true; // 체크완료 시 숨김 기본 활성화

// 초기화
document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();
  await loadDashboardData();
  await loadRecentFiles();
  renderPeriodicChecklist();
  renderIsoChecklist();
  renderCalendar();
  renderFormsHub();

  // 30초마다 자동 새로고침
  setInterval(async () => {
    await loadDashboardData(true);
    await loadRecentFiles();
  }, 30000);
});

// 전체 대시보드 데이터 로드
async function loadDashboardData(isSilent = false) {
  try {
    siteConfig = await SafetyDB.getSiteConfig() || {};
    const rawAlerts = await SafetyDB.getAlerts() || [];
    const rawInspections = await SafetyDB.getInspections() || [];
    allNotices = await SafetyDB.getNotices() || [];
    const rawCorpStats = await SafetyDB.getCorpStats() || [];

    // 🔒 케이펙 숨김 처리: 보담과 케이프라이드 2개 사 중심 데이터만 필터링
    allCorpStats = rawCorpStats.filter(s => s && s.corp_name !== "케이펙");
    allAlerts = rawAlerts.filter(a => a && a.corp !== "케이펙");
    allInspections = rawInspections.filter(i => i && i.corp !== "케이펙");

    updateHeaderAndBanner();
    renderKPIs();
    renderAlerts();
    renderHomeUpcomingEvents();
    renderInspectionsTable();
    renderCorpCards();
    renderNotices();
    renderChart();
    renderPeriodicChecklist();
    renderIsoChecklist();
    renderSystemDocs();

    lucide.createIcons();
    if (!isSilent) console.log("대시보드 데이터 갱신 완료 (케이프라이드 · 보담 2사 체계)");
  } catch (err) {
    console.error("데이터 로드 실패:", err);
  }
}

// 수동 새로고침
async function refreshDashboard() {
  const icon = document.querySelector('[title="새로고침"] i');
  if (icon) icon.classList.add("animate-spin");
  await loadDashboardData();
  await loadRecentFiles();
  setTimeout(() => {
    if (icon) icon.classList.remove("animate-spin");
  }, 600);
}

// 상단 헤더 및 긴급 배너 업데이트
function updateHeaderAndBanner() {
  const headerSysTitle = document.getElementById("header-system-title");
  if (headerSysTitle && siteConfig?.system_name) {
    headerSysTitle.textContent = siteConfig.system_name;
  }
  const headerSub = document.getElementById("header-subtitle");
  if (headerSub) {
    headerSub.textContent = "(주)케이프라이드 · (주)보담";
  }

  const banner = document.getElementById("top-urgent-banner");
  const bannerText = document.getElementById("banner-text");
  if (bannerText && siteConfig?.urgent_notice && siteConfig.urgent_notice.trim() !== "") {
    bannerText.textContent = siteConfig.urgent_notice;
    banner?.classList.remove("hidden");
  } else {
    banner?.classList.add("hidden");
  }
}

// 법인 필터 전환 (전체, 케이프라이드, 보담)
function setCompanyFilter(corp) {
  if (!corp || corp.toLowerCase() === 'all') {
    selectedCorp = 'ALL';
  } else {
    selectedCorp = corp;
  }

  const btnAll = document.getElementById("btn-corp-all");
  const btnKpride = document.getElementById("btn-corp-kpride");
  const btnBodam = document.getElementById("btn-corp-bodam");

  const activeClass = "corp-filter-btn px-2.5 sm:px-3 py-1 rounded-md text-white bg-slate-900 shadow-2xs transition font-bold";
  const inactiveClass = "corp-filter-btn px-2.5 sm:px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 transition";

  if (btnAll) btnAll.className = (selectedCorp === 'ALL') ? activeClass : inactiveClass;
  if (btnKpride) btnKpride.className = (selectedCorp === '케이프라이드') ? activeClass : inactiveClass;
  if (btnBodam) btnBodam.className = (selectedCorp === '보담') ? activeClass : inactiveClass;

  // 레거시 필터 버튼 호환
  const legacyButtons = document.querySelectorAll(".corp-tab");
  legacyButtons.forEach(btn => {
    if (btn.id === `filter-btn-${selectedCorp}`) {
      btn.className = "corp-tab px-3 py-1.5 rounded-lg text-sky-700 bg-sky-50 font-bold transition";
    } else {
      btn.className = "corp-tab px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
    }
  });

  renderKPIs();
  renderAlerts();
  renderHomeUpcomingEvents();
  renderInspectionsTable();
  renderCorpCards();
  renderCalendar();
}
window.filterCorp = setCompanyFilter;

// KPI 요약 카드 계산 및 렌더링
function renderKPIs() {
  const filteredAlerts = selectedCorp === "ALL" 
    ? allAlerts 
    : allAlerts.filter(a => a.corp.includes(selectedCorp) || a.corp.includes("전 법인") || a.corp.includes("공통"));

  const filteredInspections = selectedCorp === "ALL"
    ? allInspections
    : allInspections.filter(i => i.corp === selectedCorp);

  // 연도별(2026 실시간 vs 2025 결산) 통계 데이터 소스 선택 (케이펙 제외)
  const yearStatsSource = (window.SAFETY_TIPS_DATA?.corpStatsByYear && window.SAFETY_TIPS_DATA.corpStatsByYear[currentStatsYear])
    ? window.SAFETY_TIPS_DATA.corpStatsByYear[currentStatsYear].filter(s => s && s.corp_name !== "케이펙")
    : allCorpStats;

  const filteredStats = selectedCorp === "ALL"
    ? yearStatsSource
    : yearStatsSource.filter(s => s.corp_name === selectedCorp);

  const totalWorkers = filteredStats.reduce((sum, s) => sum + (s.worker_count || 0), 0);

  const elTotalWorkers = document.getElementById("kpi-total-workers");
  if (elTotalWorkers) elTotalWorkers.textContent = totalWorkers.toLocaleString();

  const elAlerts = document.getElementById("kpi-alerts-count");
  if (elAlerts) elAlerts.textContent = filteredAlerts.length;

  const elInspections = document.getElementById("kpi-inspections-count");
  if (elInspections) elInspections.textContent = filteredInspections.length;
}

// 긴급 D-Day 및 알림 카드 렌더링
function renderAlerts() {
  const container = document.getElementById("alerts-container");
  const filtered = selectedCorp === "ALL" 
    ? allAlerts 
    : allAlerts.filter(a => a.corp.includes(selectedCorp) || a.corp.includes("전 법인") || a.corp.includes("공통"));

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        해당 법인에 등록된 긴급 알림이 없습니다.
      </div>
    `;
    return;
  }

  const borderClass = {
    critical: "border-red-200 bg-gradient-to-br from-red-50/50 to-white",
    warning: "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white",
    info: "border-sky-200 bg-gradient-to-br from-sky-50/50 to-white"
  };

  const badgeClass = {
    critical: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    info: "bg-sky-100 text-sky-700 border-sky-200"
  };

  const statusBadge = {
    '조치필요': 'bg-rose-50 text-rose-700 border-rose-200',
    '진행중': 'bg-blue-50 text-blue-700 border-blue-200',
    '대기': 'bg-slate-100 text-slate-700 border-slate-200',
    '예정': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '완료': 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  const defaultGuides = {
    1: "대행기관(대한안전관리본부)에 연락하여 2026년 계약 자동연장 확인 공문을 수령하고, 월별 방문기술지도 일지 바인더 편철을 확인하세요.",
    2: "측정기관(건강한일터)에 연락하여 12월 셋째 주 측정일을 사전 예약하고, 당일 패티가공실 등 대상 공정이 정상 가동되도록 생산팀과 일정을 맞추세요.",
    3: "안전보건공단 안전검사 포털(kosa.kosha.or.kr)에서 합격필증을 재발급받아 컨베이어 모터 외함에 부착하고 사본을 검사철에 보관하세요.",
    4: "회의 7일 전(11.18까지) 노사 위원들에게 일시·장소를 사전 공지하고, 당일 회의록(동절기 한파 방한용품 및 난방설비 점검 안건) 양식을 준비하세요."
  };

  container.innerHTML = filtered.map(a => {
    const howToText = (a.action_text && a.action_text.length > 8)
      ? a.action_text
      : (defaultGuides[a.id] || '');

    return `
    <div class="p-5 rounded-2xl border ${borderClass[a.level] || borderClass.info} shadow-xs flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass[a.level] || badgeClass.info}">
            ${a.level === 'critical' ? '긴급' : (a.level === 'warning' ? '주의' : '안내')}
          </span>
          <span class="text-[11px] font-bold font-mono text-rose-600">${escapeHtml(a.dday || '')}</span>
        </div>
        <div class="text-[11px] font-semibold text-slate-500 mb-1">${escapeHtml(a.corp)}</div>
        <h3 class="font-bold text-xs sm:text-sm text-slate-900 mb-2 leading-snug">${escapeHtml(a.title)}</h3>
        <p class="text-xs text-slate-600 leading-relaxed mb-3">${escapeHtml(a.desc || '')}</p>

        <!-- 💡 구체적인 실무 조치 방법 블록 -->
        ${howToText ? `
          <div class="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs mt-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
            <div>
              <strong class="font-bold text-[11px] text-amber-900 block mb-0.5">💡 구체적 조치 방법 (Action Guide):</strong>
              <p class="text-[11px] leading-relaxed text-amber-900/90">${escapeHtml(howToText)}</p>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="pt-3 mt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
        <span class="text-[11px] text-slate-400 font-medium">상태: <strong class="text-slate-700">${escapeHtml(a.status || '대기')}</strong></span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge[a.status] || 'bg-slate-100 text-slate-600 border-slate-200'}">
          ${escapeHtml(a.status || '대기')}
        </span>
      </div>
    </div>
    `;
  }).join("");

  lucide.createIcons();
}

// 📅 홈 화면용: 11·12월 법정 안전 일정 하이라이트 요약 렌더링
function renderHomeUpcomingEvents() {
  const container = document.getElementById("home-upcoming-events");
  if (!container) return;

  const events = (window.SAFETY_TIPS_DATA && window.SAFETY_TIPS_DATA.calendarEvents) || [];
  const filtered = selectedCorp === "ALL"
    ? events
    : events.filter(e => e.corp.includes(selectedCorp) || e.corp.includes("전 법인") || e.corp.includes("공통"));

  if (!filtered.length) {
    container.innerHTML = `<div class="col-span-full py-6 text-center text-xs text-slate-400">예정된 일정이 없습니다.</div>`;
    return;
  }

  const badgeMap = {
    critical: { text: "긴급", class: "bg-rose-100 text-rose-700 border-rose-200" },
    warning: { text: "주의", class: "bg-amber-100 text-amber-800 border-amber-200" },
    info: { text: "안내", class: "bg-sky-100 text-sky-700 border-sky-200" }
  };

  container.innerHTML = filtered.slice(0, 4).map(ev => `
    <div onclick="switchPortalTab('calendar'); selectCalendarDate('${ev.date}');" 
      class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-2">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeMap[ev.type]?.class || badgeMap.info.class}">
            ${badgeMap[ev.type]?.text || "법정"}
          </span>
          <span class="text-[11px] font-bold text-rose-600 font-mono">${escapeHtml(ev.ddayText || '')}</span>
        </div>
        <div class="text-[10px] font-semibold text-slate-500">${escapeHtml(ev.corp)} &bull; <span class="font-mono text-emerald-700 font-bold">${ev.date}</span></div>
        <h4 class="font-bold text-xs text-slate-900 leading-snug truncate" title="${escapeHtml(ev.title)}">${escapeHtml(ev.title)}</h4>
        <p class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">${escapeHtml(ev.desc)}</p>
      </div>
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-600 font-bold">
        <span>액션 가이드</span>
        <i data-lucide="chevron-right" class="w-3 h-3"></i>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

// ==============================================
// 🏢 주요 법인 운영 지표 연도별 탭 분리 (Option 1)
// ==============================================

function switchStatsYear(year) {
  currentStatsYear = year;

  // 1. 버튼 활성화 스타일 업데이트
  const btn2026 = document.getElementById("btn-stats-year-2026");
  const btn2025 = document.getElementById("btn-stats-year-2025");
  if (btn2026 && btn2025) {
    if (year === '2026') {
      btn2026.className = "stats-year-btn px-3 py-1.5 rounded-lg bg-sky-600 text-white shadow-xs transition";
      btn2025.className = "stats-year-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
    } else {
      btn2025.className = "stats-year-btn px-3 py-1.5 rounded-lg bg-sky-600 text-white shadow-xs transition";
      btn2026.className = "stats-year-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
    }
  }

  // 2. 타이틀 및 부제목 업데이트
  const titleEl = document.getElementById("corp-stats-title");
  const subEl = document.getElementById("corp-stats-subtitle");
  if (titleEl) {
    titleEl.innerHTML = year === '2026'
      ? `<i data-lucide="building-2" class="w-4 h-4 text-sky-600"></i><span>주요 법인 운영 지표 (2026년 실시간)</span>`
      : `<i data-lucide="building-2" class="w-4 h-4 text-emerald-600"></i><span>주요 법인 법정 의무이행 실적 (2025년 결산 확정)</span>`;
  }
  if (subEl) {
    subEl.textContent = year === '2026'
      ? "2026년 10월 최신 사원연명부 기준 인력 및 당해연도 안전보건 이행 진행 현황"
      : "2025년 12월 결산 사원연명부(보담+백두대간 합산 280명) 기준 법정 의무이행 완료 실적";
  }

  // 3. KPI 및 법인 카드, 차트 동기화
  renderKPIs();
  renderCorpCards();
  renderChart();
  lucide.createIcons();
}
window.switchStatsYear = switchStatsYear;

// 2사 법인 카드 렌더링 (케이펙 제외, 2026 실시간 vs 2025 법정실적 지원)
function renderCorpCards() {
  const container = document.getElementById("corp-cards-container");
  if (!container) return;

  const yearStatsSource = (window.SAFETY_TIPS_DATA?.corpStatsByYear && window.SAFETY_TIPS_DATA.corpStatsByYear[currentStatsYear])
    ? window.SAFETY_TIPS_DATA.corpStatsByYear[currentStatsYear].filter(s => s && s.corp_name !== "케이펙")
    : allCorpStats;

  const filtered = selectedCorp === "ALL"
    ? yearStatsSource
    : yearStatsSource.filter(s => s.corp_name === selectedCorp);

  const is2025 = currentStatsYear === '2025';

  container.innerHTML = filtered.map(stat => {
    const isBodamMerged = is2025 && stat.corp_name.includes("보담");
    const badgeText = is2025 
      ? (isBodamMerged ? "2025년 법정완결 (백두대간 합산)" : "2025년 법정완결") 
      : "2026년 실시간 가동";
    const badgeClass = is2025
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-sky-100 text-sky-800 border-sky-200";

    const workerDetailHtml = isBodamMerged
      ? `<div class="mt-1.5 text-[11px] text-purple-800 bg-purple-50 p-2.5 rounded-lg border border-purple-200 leading-snug">
           <div class="flex items-center justify-between">
             <span class="font-bold text-purple-900">통합 세부 내역:</span>
             <span class="font-mono font-bold">보담 111명 + 백두대간 169명</span>
           </div>
           <div class="text-[10px] text-purple-600 mt-1 flex justify-between">
             <span>성별: 남 73 / 여 207</span>
             <span>고용: 정규 178 / 계약 102</span>
           </div>
         </div>`
      : `<div class="text-[11px] text-slate-500 mt-1 flex justify-between bg-white px-2 py-1 rounded border border-slate-100">
           <span>남 ${stat.gender_male || '-'}명 / 여 ${stat.gender_female || '-'}명</span>
           <span>정규 ${stat.regular_workers || '-'}명 / 계약 ${stat.contract_workers || '-'}명</span>
         </div>`;

    return `
      <div class="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition space-y-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>${escapeHtml(stat.corp_name)}</span>
              ${isBodamMerged ? '<span class="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 font-bold rounded">백두대간 합산</span>' : ''}
            </h3>
            <span class="text-[11px] text-slate-400 font-medium">${is2025 ? '2025년 12월 결산 실적' : '2026년 실시간 현황'}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}">
            ${badgeText}
          </span>
        </div>

        <div class="space-y-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600 font-medium">관리 근로자 수 (재적)</span>
              <span class="font-bold text-slate-900 text-sm font-mono">${stat.worker_count}명</span>
            </div>
            ${workerDetailHtml}
          </div>

          <div class="pt-2 border-t border-slate-200/60">
            <div class="flex items-center justify-between mb-0.5">
              <span class="text-slate-600 font-medium">건강검진 수검률</span>
              <span class="font-bold text-indigo-700 font-mono">${stat.health_check_rate || 98}%</span>
            </div>
            <p class="text-[11px] text-slate-500 leading-tight">${escapeHtml(stat.health_check_status || '')}</p>
          </div>

          <div class="pt-2 border-t border-slate-200/60">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-slate-600 font-medium">위험성평가 이행률</span>
              <span class="font-bold text-sky-700 font-mono">${stat.risk_assessment_rate}%</span>
            </div>
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
              <div class="bg-sky-500 h-full rounded-full transition-all duration-500" style="width: ${stat.risk_assessment_rate}%"></div>
            </div>
            <p class="text-[11px] text-slate-500 leading-tight">${escapeHtml(stat.risk_assessment_status || '')}</p>
          </div>
        </div>

        <p class="text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
          ${escapeHtml(stat.status_summary || '정상 운영 중')}
        </p>
      </div>
    `;
  }).join("");
}

// 법정 안전검사 설비 현황 테이블
function renderInspectionsTable() {
  const tbody = document.getElementById("inspections-tbody");
  const filtered = selectedCorp === "ALL"
    ? allInspections
    : allInspections.filter(i => i.corp === selectedCorp);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-xs text-slate-400">등록된 검사 대상 설비가 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-bold text-slate-900">${escapeHtml(item.corp)}</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${escapeHtml(item.equipment_name)}</td>
      <td class="py-3 px-4 text-slate-500">${escapeHtml(item.location || '-')}</td>
      <td class="py-3 px-4 font-mono text-slate-600">${escapeHtml(item.last_date || '-')}</td>
      <td class="py-3 px-4 font-mono font-bold ${item.status.includes('도래') ? 'text-amber-600' : 'text-slate-800'}">${escapeHtml(item.next_date || '-')}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status.includes('정상') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
          ${escapeHtml(item.status)}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-600">${escapeHtml(item.inspector || '-')}</td>
      <td class="py-3 px-4 text-slate-500 text-[11px]">${escapeHtml(item.notes || '-')}</td>
    </tr>
  `).join("");
}

// 공지사항 렌더링
function renderNotices() {
  const container = document.getElementById("notices-container");
  if (!allNotices.length) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">등록된 공지사항이 없습니다.</div>`;
    return;
  }

  container.innerHTML = allNotices.slice(0, 4).map(n => `
    <div onclick="openNoticeModal(${n.id})" class="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition cursor-pointer flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 overflow-hidden">
        ${n.is_pinned ? '<span class="text-xs">📌</span>' : '<span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>'}
        <div class="truncate">
          <div class="text-xs font-bold text-slate-900 truncate">${escapeHtml(n.title)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(n.corp || '전 법인')} · ${escapeHtml(n.author || '안전팀')}</div>
        </div>
      </div>
      <span class="text-[11px] font-mono text-slate-400 shrink-0">${escapeHtml(n.date || '')}</span>
    </div>
  `).join("");
}

function openNoticeModal(id) {
  const notice = allNotices.find(n => n.id === id);
  if (!notice) return;

  const corpEl = document.getElementById("modal-notice-corp") || document.getElementById("modal-notice-target");
  if (corpEl) corpEl.textContent = notice.corp || "전 법인";

  const titleEl = document.getElementById("modal-notice-title");
  if (titleEl) titleEl.textContent = notice.title || "";

  const authorEl = document.getElementById("modal-notice-author");
  if (authorEl) authorEl.textContent = notice.author || "안전관리자";

  const dateEl = document.getElementById("modal-notice-date");
  if (dateEl) dateEl.textContent = notice.date || "-";

  const contentEl = document.getElementById("modal-notice-content");
  if (contentEl) contentEl.textContent = notice.content || "";

  const modal = document.getElementById("notice-detail-modal");
  if (modal) modal.classList.remove("hidden");
  lucide.createIcons();
}

function closeNoticeModal() {
  document.getElementById("notice-detail-modal").classList.add("hidden");
}

// Chart.js 통계 차트 (케이펙 제외, 2사 중심, 선택 연도 동기화)
function renderChart() {
  const canvas = document.getElementById("safetyStatsChart");
  if (!canvas) return;

  const yearStatsSource = (window.SAFETY_TIPS_DATA?.corpStatsByYear && window.SAFETY_TIPS_DATA.corpStatsByYear[currentStatsYear])
    ? window.SAFETY_TIPS_DATA.corpStatsByYear[currentStatsYear].filter(s => s && s.corp_name !== "케이펙")
    : allCorpStats;

  const labels = yearStatsSource.map(s => s.corp_name);
  const riskRates = yearStatsSource.map(s => s.risk_assessment_rate || 0);
  const healthRates = yearStatsSource.map(s => s.health_check_rate || 0);

  if (statsChartInstance) {
    statsChartInstance.destroy();
  }

  statsChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `위험성평가 이행률 (%) [${currentStatsYear}년]`,
          data: riskRates,
          backgroundColor: "rgba(2, 132, 199, 0.8)",
          borderRadius: 6
        },
        {
          label: `건강검진 수검률 (%) [${currentStatsYear}년]`,
          data: healthRates,
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 10 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { font: { size: 10 } }
        },
        x: {
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

// ==============================================
// ⭐ 신규: 주기별(일·주·월·분기·연간) 실무 체크리스트 제어
// ==============================================

function getCheckedItems() {
  try {
    const raw = localStorage.getItem("safety_checklist_checked");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCheckedItems(arr) {
  localStorage.setItem("safety_checklist_checked", JSON.stringify(arr));
}

function switchChecklistCycle(cycle) {
  currentChecklistCycle = cycle;
  const tabs = ["daily", "weekly", "monthly", "quarterly", "yearly", "iso"];
  tabs.forEach(c => {
    const btn = document.getElementById(`chk-tab-${c}`);
    if (!btn) return;
    if (c === cycle) {
      if (c === 'iso') {
        btn.className = "chk-tab px-3 py-1.5 rounded-lg text-emerald-800 bg-white shadow-xs font-bold border border-emerald-300 transition ring-2 ring-emerald-500/20";
      } else {
        btn.className = "chk-tab px-3 py-1.5 rounded-lg text-sky-700 bg-white shadow-xs font-bold transition";
      }
    } else {
      if (c === 'iso') {
        btn.className = "chk-tab px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 transition border border-emerald-200/70 font-semibold";
      } else {
        btn.className = "chk-tab px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
      }
    }
  });
  renderPeriodicChecklist();
  renderIsoChecklist();
}

function toggleShowCompleted() {
  hideCompletedChecklist = !hideCompletedChecklist;
  const btnText = document.getElementById("toggle-completed-text");
  const btnIcon = document.querySelector("#toggle-completed-btn i");
  
  if (hideCompletedChecklist) {
    btnText.textContent = "완료 항목 숨김 중";
    if (btnIcon) btnIcon.setAttribute("data-lucide", "eye-off");
  } else {
    btnText.textContent = "모든 항목 표시 중";
    if (btnIcon) btnIcon.setAttribute("data-lucide", "eye");
  }
  
  renderPeriodicChecklist();
  renderIsoChecklist();
  lucide.createIcons();
}

function resetChecklist() {
  if (!confirm("현재 주기 체크리스트를 모두 초기화하시겠습니까?")) return;
  const checked = getCheckedItems();
  const currentList = (window.SAFETY_TIPS_DATA?.periodicChecklists?.[currentChecklistCycle] || []).map(i => i.id);
  const remaining = checked.filter(id => !currentList.includes(id));
  saveCheckedItems(remaining);
  renderPeriodicChecklist();
  renderIsoChecklist();
}

function handleCheckItem(id) {
  if (id.startsWith("iso-chk-")) {
    handleIsoCheckItem(id);
    renderPeriodicChecklist();
    return;
  }

  const checked = getCheckedItems();
  const card = document.getElementById(`chk-card-${id}`);

  if (checked.includes(id)) {
    // 언체크
    const updated = checked.filter(item => item !== id);
    saveCheckedItems(updated);
    renderPeriodicChecklist();
    renderIsoChecklist();
  } else {
    // 체크 완료
    checked.push(id);
    saveCheckedItems(checked);

    if (hideCompletedChecklist && card) {
      // 부드러운 페이드아웃 후 숨김
      card.classList.add("fade-out");
      setTimeout(() => {
        renderPeriodicChecklist();
        renderIsoChecklist();
      }, 280);
    } else {
      renderPeriodicChecklist();
      renderIsoChecklist();
    }
  }
}

function renderPeriodicChecklist() {
  const container = document.getElementById("checklist-items-container");
  const progressText = document.getElementById("checklist-progress-text");
  if (!container || !window.SAFETY_TIPS_DATA?.periodicChecklists) return;

  const isIso = currentChecklistCycle === "iso";
  const list = window.SAFETY_TIPS_DATA.periodicChecklists[currentChecklistCycle] || [];
  const checked = isIso ? getIsoCheckedItems() : getCheckedItems();
  const shouldHide = isIso ? hideCompletedIso : hideCompletedChecklist;

  const completedCount = list.filter(item => checked.includes(item.id)).length;
  const totalCount = list.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (progressText) {
    progressText.textContent = `진행도: ${completedCount}/${totalCount} (${percent}%)`;
  }

  // 필터링
  const visibleList = shouldHide
    ? list.filter(item => !checked.includes(item.id))
    : list;

  if (visibleList.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold">
          <i data-lucide="check-check" class="w-6 h-6"></i>
        </div>
        <h4 class="font-bold text-slate-800 text-sm">해당 주기의 모든 체크 항목을 완료했습니다! 🎉</h4>
        <p class="text-xs text-slate-500 mt-1">
          ${shouldHide ? '완료된 항목을 확인하려면 상단의 [완료 항목 숨김 중] 버튼을 클릭하세요.' : '수고하셨습니다. 안전한 사업장이 유지되고 있습니다.'}
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = visibleList.map(item => {
    const isDone = checked.includes(item.id);
    const corpBadge = item.corp ? `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${escapeHtml(item.corp)}</span>` : '';
    return `
      <div id="chk-card-${item.id}" class="p-4 rounded-xl border ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'} transition duration-200 space-y-2.5">
        <div class="flex items-start justify-between gap-3">
          <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
            <input type="checkbox" onchange="handleCheckItem('${item.id}')" ${isDone ? 'checked' : ''}
              class="w-4 h-4 mt-0.5 rounded text-sky-600 focus:ring-sky-500 transition cursor-pointer">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${escapeHtml(item.title)}</span>
                ${corpBadge}
              </div>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">${escapeHtml(item.desc)}</p>
            </div>
          </label>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${isIso ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-sky-50 text-sky-700'} shrink-0">${escapeHtml(item.badge)}</span>
        </div>

        <!-- 💡 실무 꿀팁 블록 -->
        <div class="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-950 flex items-start gap-2">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5"></i>
          <span class="text-[11px] leading-relaxed">${escapeHtml(item.tip)}</span>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// ==============================================
// 법령 변동점 및 실무 팁 모달 제어 함수
// ==============================================

function openLawModal() {
  const container = document.getElementById("law-modal-body") || document.getElementById("law-changes-list");
  if (!container || !window.SAFETY_TIPS_DATA) return;

  const list = window.SAFETY_TIPS_DATA.lawChanges || [];
  container.innerHTML = list.map(item => `
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">${escapeHtml(item.category)}</span>
          <h4 class="font-bold text-sm text-slate-900">${escapeHtml(item.title)}</h4>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">${escapeHtml(item.badge)}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-2.5 bg-white border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-400 mb-1 flex items-center gap-1">
            <span>⏮️</span> 작년/이전 기준
          </div>
          <div class="text-slate-600 leading-relaxed">${escapeHtml(item.past)}</div>
        </div>

        <div class="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
          <div class="font-bold text-emerald-800 mb-1 flex items-center gap-1">
            <span>✨</span> 올해/현행 핵심 변동점
          </div>
          <div class="text-emerald-950 font-medium leading-relaxed">${escapeHtml(item.current)}</div>
        </div>
      </div>

      <div class="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-xs flex items-start gap-2">
        <i data-lucide="check-circle" class="w-4 h-4 text-sky-600 shrink-0 mt-0.5"></i>
        <div>
          <strong class="text-sky-950 font-bold">실무자 필수 액션:</strong>
          <span class="text-sky-900 ml-1">${escapeHtml(item.keyAction)}</span>
        </div>
      </div>
    </div>
  `).join("");

  document.getElementById("law-modal")?.classList.remove("hidden");
  lucide.createIcons();
}

function closeLawModal() {
  document.getElementById("law-modal")?.classList.add("hidden");
}

function openTipsModal() {
  const container = document.getElementById("tips-modal-body") || document.getElementById("practical-tips-list");
  if (!container || !window.SAFETY_TIPS_DATA) return;

  const deadlines = window.SAFETY_TIPS_DATA.deadlineGuide || [];
  const tips = window.SAFETY_TIPS_DATA.practicalTips || [];

  container.innerHTML = `
    <div class="space-y-5">
      <!-- 1. 법정 의무 보고 및 신고 기한 가이드 -->
      <div class="bg-rose-50/70 p-4 rounded-xl border border-rose-200/80 space-y-2.5">
        <h4 class="font-bold text-xs text-rose-950 flex items-center gap-1.5">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i>
          <span>법정 의무 보고 및 신고 기한 가이드 (위반 시 과태료 직결)</span>
        </h4>
        <div class="overflow-x-auto rounded-lg border border-rose-200 bg-white">
          <table class="w-full text-left text-[11px]">
            <thead class="bg-rose-100/70 text-rose-900 font-bold">
              <tr>
                <th class="p-2.5 border-b border-rose-200">보고 항목</th>
                <th class="p-2.5 border-b border-rose-200">법정 기한</th>
                <th class="p-2.5 border-b border-rose-200">미보고 시 과태료</th>
                <th class="p-2.5 border-b border-rose-200">제출처</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rose-100">
              ${deadlines.map(d => `
                <tr class="hover:bg-rose-50/40 transition">
                  <td class="p-2.5 font-bold text-slate-800">${escapeHtml(d.target)}</td>
                  <td class="p-2.5 font-semibold text-rose-600 font-mono">${escapeHtml(d.deadline)}</td>
                  <td class="p-2.5 text-slate-700 font-medium">${escapeHtml(d.penalty)}</td>
                  <td class="p-2.5 text-slate-500">${escapeHtml(d.authority)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. 초보 안전보건 담당자 영역별 실무 팁 & 노하우 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <i data-lucide="lightbulb" class="w-4 h-4 text-amber-500"></i>
            <span>초보 담당자를 위한 실무 팁 & 실수 방지 체크포인트</span>
          </h4>
          <span class="text-[10px] text-slate-500 font-semibold font-mono">총 ${tips.length}대 핵심 분야</span>
        </div>

        <div class="space-y-3.5">
          ${tips.map((t, idx) => `
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-white hover:shadow-2xs transition space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                    ${idx + 1}
                  </span>
                  <div>
                    <h5 class="font-bold text-xs sm:text-sm text-slate-900">${escapeHtml(t.domain)}</h5>
                    <p class="text-xs font-semibold text-sky-700 mt-0.5">${escapeHtml(t.summary)}</p>
                  </div>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${t.badge.includes('1위') ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'}">
                  ${escapeHtml(t.badge)}
                </span>
              </div>

              <!-- 흔한 실수 vs 실무 조치 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div class="p-3 bg-red-50/70 border border-red-200/80 rounded-xl space-y-1">
                  <strong class="text-red-900 text-[11px] font-bold flex items-center gap-1">
                    <i data-lucide="x-circle" class="w-3.5 h-3.5 text-red-600"></i>
                    <span>가장 흔한 실수 (적발 사례):</span>
                  </strong>
                  <p class="text-[11px] text-red-950 leading-relaxed">${escapeHtml(t.mistake)}</p>
                </div>

                <div class="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                  <strong class="text-emerald-900 text-[11px] font-bold flex items-center gap-1">
                    <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i>
                    <span>실무 정답 조치 프로세스:</span>
                  </strong>
                  <p class="text-[11px] text-emerald-950 leading-relaxed">${escapeHtml(t.solution)}</p>
                </div>
              </div>

              <!-- 체크포인트 -->
              ${t.checklist && t.checklist.length ? `
                <div class="pt-2 border-t border-slate-200/70">
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">담당자 점검 체크포인트:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    ${t.checklist.map(chk => `
                      <div class="p-1.5 bg-white rounded-lg border border-slate-200 text-[10px] text-slate-700 flex items-start gap-1.5 shadow-2xs">
                        <i data-lucide="check" class="w-3 h-3 text-emerald-600 shrink-0 mt-0.5"></i>
                        <span class="leading-tight">${escapeHtml(chk)}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  document.getElementById("tips-modal")?.classList.remove("hidden");
  lucide.createIcons();
}

function closeTipsModal() {
  document.getElementById("tips-modal")?.classList.add("hidden");
}

// 최근 수정된 로컬 업무 서류 감시 (run_dashboard.py의 /api/recent-files 연동)
async function loadRecentFiles() {
  const container = document.getElementById("recent-files-list");
  const badge = document.getElementById("local-api-status");
  if (!container) return;

  try {
    const res = await fetch("/api/recent-files");
    if (!res.ok) throw new Error("API 비활성");
    const json = await res.json();
    
    if (badge) {
      badge.textContent = `실시간 연동 (${json.files.length}건)`;
      badge.className = "text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold";
    }

    if (!json.files || !json.files.length) {
      container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">최근 수정된 서류가 없습니다.</div>`;
      return;
    }

    container.innerHTML = json.files.slice(0, 5).map(f => `
      <div class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="file-text" class="w-4 h-4 text-sky-600 shrink-0"></i>
          <span class="font-medium text-slate-800 truncate" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
        </div>
        <span class="text-[11px] font-mono text-slate-400 shrink-0 ml-2">${escapeHtml(f.date)}</span>
      </div>
    `).join("");
  } catch (e) {
    if (badge) {
      badge.textContent = "클라우드 모드";
      badge.className = "text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold";
    }
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==============================================
// 사원연명부 인력 통계 모달 제어 함수 (2026년 실시간 vs 2025년 결산)
// ==============================================

function switchRosterModalYear(year) {
  currentRosterModalYear = year;

  // 버튼 스타일 전환
  const btn2026 = document.getElementById("btn-roster-modal-2026");
  const btn2025 = document.getElementById("btn-roster-modal-2025");
  if (btn2026 && btn2025) {
    if (year === '2026') {
      btn2026.className = "px-2.5 py-1 rounded-md bg-indigo-600 text-white shadow-xs transition";
      btn2025.className = "px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition";
    } else {
      btn2025.className = "px-2.5 py-1 rounded-md bg-indigo-600 text-white shadow-xs transition";
      btn2026.className = "px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition";
    }
  }

  renderRosterModalContent(year);
}
window.switchRosterModalYear = switchRosterModalYear;

function renderRosterModalContent(year) {
  const container = document.getElementById("roster-modal-body");
  if (!container) return;

  const rosterByYear = window.SAFETY_TIPS_DATA?.rosterStats?.byYear;
  if (!rosterByYear || !rosterByYear[year]) {
    container.innerHTML = `<div class="p-8 text-center text-slate-400">사원연명부 통계 데이터를 불러올 수 없습니다.</div>`;
    return;
  }

  const data = rosterByYear[year];
  const is2025 = year === '2025';

  container.innerHTML = `
    <!-- 상단 종합 요약 배너 -->
    <div class="p-4 rounded-xl ${is2025 ? 'bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-indigo-500/10 border border-emerald-200' : 'bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-purple-500/10 border border-indigo-200'}">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${is2025 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}">
            ${is2025 ? '2025년 결산 확정 집계' : '2026년 10월 최신본 실시간'}
          </span>
          <h4 class="font-bold text-sm text-slate-900 mt-1">2사 관리 총원: <span class="text-indigo-700 font-mono text-base font-extrabold">${data.totalWorkers}명</span></h4>
          <p class="text-[11px] text-slate-600 mt-0.5">
            ${is2025 ? '케이프라이드(324명) + 보담·백두대간 합산(280명)' : '케이프라이드(225명) + 보담(99명)'}
          </p>
        </div>
        <div class="text-[10px] text-slate-500 sm:text-right">
          <div>데이터 기준: <span class="font-mono font-semibold">${data.baseDate}</span></div>
          <div class="text-slate-400 mt-0.5">※ (주)케이펙(${year === '2026' ? '28' : '34'}명)은 내부 집계 반영 및 UI 비노출 유지</div>
        </div>
      </div>
      ${is2025 ? `
        <div class="mt-3 p-2.5 bg-white/90 rounded-lg border border-purple-200 text-[11px] text-purple-950 flex items-start gap-2 shadow-2xs">
          <i data-lucide="info" class="w-4 h-4 text-purple-600 shrink-0 mt-0.5"></i>
          <div>
            <strong class="text-purple-900 font-bold">2025년 보담 집계 안내:</strong> 당시 법인 통합 운영 내역을 반영하여 <strong>(주)보담(111명)</strong>과 <strong>백두대간(169명)</strong>을 합산한 <strong>총 280명</strong>으로 확정 집계되었습니다.
          </div>
        </div>
      ` : ''}
    </div>

    <!-- 2사 법인별 세부 통계 그리드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 케이프라이드 카드 -->
      <div class="p-4 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h5 class="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <i data-lucide="building" class="w-4 h-4 text-sky-600"></i>
              ${escapeHtml(data.kpride.corpName)}
            </h5>
            <span class="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">${data.kpride.total}명</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] mb-3 bg-white p-2.5 rounded-lg border border-slate-200/60">
            <div>
              <span class="text-slate-400">성별:</span>
              <span class="font-semibold text-slate-700">남 ${data.kpride.gender.male} / 여 ${data.kpride.gender.female}</span>
            </div>
            <div>
              <span class="text-slate-400">고용형태:</span>
              <span class="font-semibold text-slate-700">정규 ${data.kpride.employment.regular} / 계약 ${data.kpride.employment.contract}</span>
            </div>
          </div>

          <!-- 옵션 B: 법정 안전 핵심 요약 -->
          <div class="space-y-1.5 pt-1 border-t border-slate-200/60">
            <h6 class="font-bold text-[11px] text-slate-800 flex items-center gap-1">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-sky-600"></i>
              <span>법정 선임 및 안전관리 의무 현황</span>
            </h6>
            <div class="grid grid-cols-2 gap-1.5 text-[10px]">
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">안전보건관리책임자</span>
                <span class="font-bold text-slate-900 mt-0.5 text-[11px]">선임 의무 (50인↑)</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">안전·보건관리자</span>
                <span class="font-bold text-sky-700 mt-0.5 text-[11px]">전문기관 위탁 지도</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">산업안전보건위원회</span>
                <span class="font-bold text-emerald-700 mt-0.5 text-[11px]">의무 설치 (분기 1회)</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">관리감독자</span>
                <span class="font-bold text-slate-900 mt-0.5 text-[11px]">공정별 직장·팀장 선임</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 보담 카드 -->
      <div class="p-4 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h5 class="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <i data-lucide="building" class="w-4 h-4 text-purple-600"></i>
              ${escapeHtml(data.bodam.corpName)}
            </h5>
            <span class="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">${data.bodam.total}명</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] mb-3 bg-white p-2.5 rounded-lg border border-slate-200/60">
            <div>
              <span class="text-slate-400">성별:</span>
              <span class="font-semibold text-slate-700">남 ${data.bodam.gender.male} / 여 ${data.bodam.gender.female}</span>
            </div>
            <div>
              <span class="text-slate-400">고용형태:</span>
              <span class="font-semibold text-slate-700">정규 ${data.bodam.employment.regular} / 계약 ${data.bodam.employment.contract}</span>
            </div>
          </div>

          <!-- 옵션 B: 법정 안전 핵심 요약 -->
          <div class="space-y-1.5 pt-1 border-t border-slate-200/60">
            <h6 class="font-bold text-[11px] text-slate-800 flex items-center gap-1">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-purple-600"></i>
              <span>법정 선임 및 안전관리 의무 현황</span>
            </h6>
            <div class="grid grid-cols-2 gap-1.5 text-[10px]">
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">안전보건관리책임자</span>
                <span class="font-bold text-slate-900 mt-0.5 text-[11px]">선임 의무 (50인↑)</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">안전·보건관리자</span>
                <span class="font-bold text-purple-700 mt-0.5 text-[11px]">전문기관 위탁 지도</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">산업안전보건위원회</span>
                <span class="font-bold text-emerald-700 mt-0.5 text-[11px]">의무 설치 (분기 1회)</span>
              </div>
              <div class="p-2 bg-white rounded-lg border border-slate-200 flex flex-col justify-between shadow-2xs">
                <span class="text-slate-400 font-medium">관리감독자</span>
                <span class="font-bold text-slate-900 mt-0.5 text-[11px]">공정별 직장·팀장 선임</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

function openRosterModal() {
  currentRosterModalYear = currentStatsYear;
  switchRosterModalYear(currentRosterModalYear);
  document.getElementById("roster-modal").classList.remove("hidden");
  lucide.createIcons();
}
window.openRosterModal = openRosterModal;

function closeRosterModal() {
  document.getElementById("roster-modal").classList.add("hidden");
}
window.closeRosterModal = closeRosterModal;

// ==============================================
// 🛡️ ISO 45001 전용 체크리스트 제어 함수
// ==============================================

let hideCompletedIso = true;

function getIsoCheckedItems() {
  try {
    const raw = localStorage.getItem("safety_iso_checked");
    if (raw) return JSON.parse(raw);
    
    // 최초 실행 시: 이미 진행 완료된 5개 항목을 기본 체크 처리!
    const defaultDone = ["iso-chk-1", "iso-chk-2", "iso-chk-3", "iso-chk-4", "iso-chk-5"];
    localStorage.setItem("safety_iso_checked", JSON.stringify(defaultDone));
    return defaultDone;
  } catch (e) {
    return ["iso-chk-1", "iso-chk-2", "iso-chk-3", "iso-chk-4", "iso-chk-5"];
  }
}

function saveIsoCheckedItems(arr) {
  localStorage.setItem("safety_iso_checked", JSON.stringify(arr));
}

function toggleIsoHideCompleted() {
  hideCompletedIso = !hideCompletedIso;
  const btnText = document.getElementById("iso-toggle-completed-text");
  const btnIcon = document.querySelector("#iso-toggle-completed-btn i");
  
  if (hideCompletedIso) {
    btnText.textContent = "완료 항목 숨김 중";
    if (btnIcon) btnIcon.setAttribute("data-lucide", "eye-off");
  } else {
    btnText.textContent = "모든 항목 표시 중";
    if (btnIcon) btnIcon.setAttribute("data-lucide", "eye");
  }
  
  renderIsoChecklist();
  lucide.createIcons();
}

function handleIsoCheckItem(id) {
  const checked = getIsoCheckedItems();
  const card = document.getElementById(`iso-card-${id}`);

  if (checked.includes(id)) {
    // 언체크
    const updated = checked.filter(item => item !== id);
    saveIsoCheckedItems(updated);
    renderIsoChecklist();
  } else {
    // 체크 완료
    checked.push(id);
    saveIsoCheckedItems(checked);

    if (hideCompletedIso && card) {
      card.classList.add("fade-out");
      setTimeout(() => {
        renderIsoChecklist();
      }, 280);
    } else {
      renderIsoChecklist();
    }
  }
}

function renderIsoChecklist() {
  const container = document.getElementById("iso-checklist-container");
  const progressText = document.getElementById("iso-progress-text");
  if (!container || !window.SAFETY_TIPS_DATA?.isoData) return;

  const list = window.SAFETY_TIPS_DATA.isoData.checklists || [];
  const checked = getIsoCheckedItems();

  const completedCount = list.filter(item => checked.includes(item.id)).length;
  const totalCount = list.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (progressText) {
    progressText.textContent = `진행도: ${completedCount}/${totalCount} (${percent}%)`;
  }

  const visibleList = hideCompletedIso
    ? list.filter(item => !checked.includes(item.id))
    : list;

  if (visibleList.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold">
          <i data-lucide="shield-check" class="w-6 h-6"></i>
        </div>
        <h4 class="font-bold text-slate-800 text-sm">ISO 45001의 모든 점검 및 심사 항목이 완료되었습니다! 🎉</h4>
        <p class="text-xs text-slate-500 mt-1">
          ${hideCompletedIso ? '완료된 항목(기존 심사 이력 등)을 보려면 [완료 항목 숨김 중] 버튼을 클릭하세요.' : '수고하셨습니다. 안전보건경영시스템이 완벽하게 유지 관리되고 있습니다.'}
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = visibleList.map(item => {
    const isDone = checked.includes(item.id);
    return `
      <div id="iso-card-${item.id}" class="p-4 rounded-xl border ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'} transition duration-200 space-y-2.5">
        <div class="flex items-start justify-between gap-3">
          <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
            <input type="checkbox" onchange="handleIsoCheckItem('${item.id}')" ${isDone ? 'checked' : ''}
              class="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 transition cursor-pointer">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${escapeHtml(item.title)}</span>
                ${isDone ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">완료</span>' : ''}
              </div>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">${escapeHtml(item.desc)}</p>
            </div>
          </label>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badge.includes('긴급') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'} shrink-0">
            ${escapeHtml(item.badge)}
          </span>
        </div>

        <!-- 💡 실무 꿀팁 블록 -->
        <div class="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"></i>
          <span class="text-[11px] leading-relaxed">${escapeHtml(item.tip)}</span>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// ==============================================
// ISO 45001 모달 및 스크롤 함수
// ==============================================

function scrollToIsoSection() {
  const sec = document.getElementById("iso45001-section");
  if (sec) {
    sec.scrollIntoView({ behavior: "smooth" });
    sec.classList.add("ring-4", "ring-emerald-400", "transition", "duration-500");
    setTimeout(() => {
      sec.classList.remove("ring-4", "ring-emerald-400");
    }, 1500);
  }
}

function openIsoModal() {
  switchPortalTab('iso45001');
}

function closeIsoModal() {
  const modal = document.getElementById("iso-detail-modal");
  if (modal) modal.classList.add("hidden");
}

// ==========================================
// 8. 포털 탭 전환 및 사이드바 내비게이션 (Portal Navigation)
// ==========================================
let currentPortalTab = 'dashboard';

const PORTAL_TAB_TITLES = {
  dashboard: '종합 관제 대시보드',
  systemDocs: '안전보건관리체계 (절차서 · 지침서)',
  calendar: '월간 법정 안전 캘린더',
  checklist: '주기별 점검 & TBM 체크리스트',
  iso45001: 'ISO 45001 경영센터',
  forms: '법정 서식 & 일지 다운로드 허브'
};

function switchPortalTab(tabId) {
  currentPortalTab = tabId;

  // 1. 브레드크럼 타이틀 갱신
  const titleEl = document.getElementById("current-tab-title");
  if (titleEl && PORTAL_TAB_TITLES[tabId]) {
    titleEl.textContent = PORTAL_TAB_TITLES[tabId];
  }

  // 2. 뷰 컨테이너 토글
  const views = ["dashboard", "systemDocs", "calendar", "checklist", "iso45001", "forms"];
  views.forEach(v => {
    const el = document.getElementById(`portal-view-${v}`);
    if (el) {
      if (v === tabId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });

  // 3. 사이드바 버튼 활성화 스타일
  const navBtns = document.querySelectorAll(".portal-nav-btn");
  navBtns.forEach(btn => {
    if (btn.id === `nav-btn-${tabId}`) {
      btn.className = "portal-nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white bg-sky-600 font-bold shadow-xs transition";
    } else {
      btn.className = "portal-nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition";
    }
  });

  // 4. 모듈별 동적 렌더러 호출
  if (tabId === "systemDocs") {
    renderSystemDocs();
  } else if (tabId === "calendar") {
    renderCalendar();
  } else if (tabId === "forms") {
    renderFormsHub();
  } else if (tabId === "checklist") {
    renderPeriodicChecklist();
  } else if (tabId === "iso45001") {
    renderIsoChecklist();
  }

  // 5. 모바일 사이드바가 열려있다면 닫기
  const sidebar = document.getElementById("portal-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar && !sidebar.classList.contains("-translate-x-full") && window.innerWidth < 768) {
    sidebar.classList.add("-translate-x-full");
    backdrop?.classList.add("hidden");
  }

  if (typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  lucide.createIcons();
}

// 모바일 드로어 사이드바 토글
function toggleMobileSidebar() {
  const sidebar = document.getElementById("portal-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar) return;
  const isClosed = sidebar.classList.contains("-translate-x-full");
  if (isClosed) {
    sidebar.classList.remove("-translate-x-full");
    backdrop?.classList.remove("hidden");
  } else {
    sidebar.classList.add("-translate-x-full");
    backdrop?.classList.add("hidden");
  }
}

// ==========================================
// 9. 월간 법정 안전 캘린더 렌더링 (Option 3)
// ==========================================
let currentCalMonth = '2026-11';
let selectedCalDate = '2026-11-06';

function switchCalendarMonth(monthStr) {
  currentCalMonth = monthStr;
  const btn11 = document.getElementById("btn-cal-2026-11");
  const btn12 = document.getElementById("btn-cal-2026-12");

  if (monthStr === "2026-11") {
    if (btn11) btn11.className = "cal-month-btn px-4 py-1.5 rounded-lg bg-white text-emerald-700 shadow-xs transition font-bold";
    if (btn12) btn12.className = "cal-month-btn px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition font-bold";
    selectedCalDate = "2026-11-06";
  } else {
    if (btn11) btn11.className = "cal-month-btn px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition font-bold";
    if (btn12) btn12.className = "cal-month-btn px-4 py-1.5 rounded-lg bg-white text-emerald-700 shadow-xs transition font-bold";
    selectedCalDate = "2026-12-18";
  }

  renderCalendar();
}

function selectCalendarDate(dateStr) {
  selectedCalDate = dateStr;
  renderCalendar();
}

function renderCalendar() {
  const container = document.getElementById("calendar-grid-cells");
  const detailPanel = document.getElementById("calendar-detail-panel");
  if (!container || !detailPanel) return;

  const [yearStr, monthStr] = currentCalMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // 1일 요일 (0: 일, 6: 토) 및 총 일수
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();

  // 법정 캘린더 이벤트 데이터
  const allEvents = (window.SAFETY_TIPS_DATA && window.SAFETY_TIPS_DATA.calendarEvents) || [];
  const corpEvents = selectedCorp === "ALL"
    ? allEvents
    : allEvents.filter(e => e.corp.includes(selectedCorp) || e.corp.includes("전 법인") || e.corp.includes("공통"));

  let cellsHtml = "";

  // 이전 달 빈 칸 채우기
  for (let i = 0; i < firstDayOfWeek; i++) {
    cellsHtml += `<div class="min-h-[72px] sm:min-h-[82px] p-1.5 bg-slate-50/50 rounded-xl border border-slate-100 opacity-40"></div>`;
  }

  // 당월 날짜 칸 생성
  for (let d = 1; d <= totalDays; d++) {
    const dStr = String(d).padStart(2, "0");
    const fullDateStr = `${yearStr}-${monthStr}-${dStr}`;
    const isToday = (fullDateStr === "2026-11-06");
    const isSelected = (fullDateStr === selectedCalDate);

    const dayOfWeek = new Date(year, month - 1, d).getDay();
    const isSunday = (dayOfWeek === 0);
    const isSaturday = (dayOfWeek === 6);

    const dayEvents = corpEvents.filter(e => e.date === fullDateStr);

    let cellBorder = "border-slate-200 hover:border-emerald-300";
    let cellBg = "bg-white hover:bg-slate-50/80";
    if (isSelected) {
      cellBorder = "border-emerald-500 ring-2 ring-emerald-500/40";
      cellBg = "bg-emerald-50/40";
    }

    cellsHtml += `
      <div onclick="selectCalendarDate('${fullDateStr}')" 
        class="min-h-[72px] sm:min-h-[82px] p-2 rounded-xl border ${cellBorder} ${cellBg} flex flex-col justify-between cursor-pointer transition shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold ${isSunday ? 'text-red-500' : (isSaturday ? 'text-blue-500' : 'text-slate-800')}">
            ${d}
          </span>
          ${isToday ? `<span class="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded-full tracking-tighter shadow-2xs">오늘</span>` : ''}
        </div>
        <div class="space-y-1 mt-1">
          ${dayEvents.slice(0, 2).map(ev => {
            const pillColor = ev.type === 'critical' 
              ? 'bg-rose-100 text-rose-800 border-rose-200' 
              : (ev.type === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-sky-100 text-sky-800 border-sky-200');
            return `
              <div class="text-[10px] truncate px-1.5 py-0.5 rounded border ${pillColor} font-semibold" title="${escapeHtml(ev.title)}">
                ${escapeHtml(ev.title)}
              </div>
            `;
          }).join("")}
          ${dayEvents.length > 2 ? `<div class="text-[9px] text-slate-500 font-bold pl-0.5">+${dayEvents.length - 2}건</div>` : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = cellsHtml;
  renderCalendarDetail(selectedCalDate, corpEvents);
}

function renderCalendarDetail(dateStr, corpEvents) {
  const detailPanel = document.getElementById("calendar-detail-panel");
  if (!detailPanel) return;

  const [y, m, d] = dateStr.split("-");
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = weekDays[dateObj.getDay()];
  const formattedTitle = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${dayName})`;

  const eventsOnDate = corpEvents.filter(e => e.date === dateStr);
  const badgeMap = {
    critical: { text: "긴급 마감", class: "bg-red-100 text-red-700 border-red-200" },
    warning: { text: "법정 관리", class: "bg-amber-100 text-amber-800 border-amber-200" },
    info: { text: "예정 안내", class: "bg-sky-100 text-sky-700 border-sky-200" }
  };

  if (eventsOnDate.length > 0) {
    detailPanel.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div class="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">선택 일자 일정 상세</div>
            <h3 class="font-extrabold text-sm text-slate-900">${formattedTitle}</h3>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
            총 ${eventsOnDate.length}건
          </span>
        </div>

        <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          ${eventsOnDate.map(ev => `
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeMap[ev.type]?.class || badgeMap.info.class}">
                  ${badgeMap[ev.type]?.text || "법정"}
                </span>
                <span class="text-[11px] font-bold text-rose-600 font-mono">${escapeHtml(ev.ddayText || '')}</span>
              </div>
              <div class="text-[10px] font-semibold text-slate-500">${escapeHtml(ev.corp)} &bull; ${escapeHtml(ev.category)}</div>
              <h4 class="font-bold text-xs text-slate-900 leading-snug">${escapeHtml(ev.title)}</h4>
              <p class="text-[11px] text-slate-600 leading-relaxed">${escapeHtml(ev.desc)}</p>
              ${ev.tip ? `
                <div class="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-[10px] text-amber-950 leading-relaxed space-y-1">
                  <strong class="font-bold text-amber-900 flex items-center gap-1">
                    <i data-lucide="sparkles" class="w-3 h-3 text-amber-600"></i>
                    <span>액션 가이드 (실무 조치 요령):</span>
                  </strong>
                  <p>${escapeHtml(ev.tip)}</p>
                </div>
              ` : ''}
            </div>
          `).join("")}
        </div>
      </div>

      <div class="pt-3 border-t border-slate-200 text-center">
        <p class="text-[10px] text-slate-500">※ 노동부 점검 시 일정 기한 내 미이행 문서는 과태료 대상이 됩니다.</p>
      </div>
    `;
  } else {
    const upcoming = corpEvents
      .filter(e => e.date >= dateStr && e.date.startsWith(currentCalMonth))
      .slice(0, 2);

    detailPanel.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wide">선택 일자 일정 상세</div>
            <h3 class="font-extrabold text-sm text-slate-900">${formattedTitle}</h3>
          </div>
          <span class="text-xs font-semibold text-slate-400">일정 없음</span>
        </div>

        <div class="py-8 text-center text-xs text-slate-500 space-y-2 bg-white rounded-xl border border-dashed border-slate-200 p-4">
          <i data-lucide="calendar-check" class="w-8 h-8 text-slate-300 mx-auto"></i>
          <p class="font-medium text-slate-600">선택한 일자에 예정된 법정 안전보건 일정이 없습니다.</p>
          <p class="text-[11px] text-slate-400">달력에서 표시된 날짜를 클릭하여 상세 조치 지침을 확인하세요.</p>
        </div>

        ${upcoming.length > 0 ? `
          <div class="space-y-2">
            <div class="text-[11px] font-bold text-slate-700">이후 다가오는 주요 법정 일정:</div>
            ${upcoming.map(u => `
              <div onclick="selectCalendarDate('${u.date}')" class="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition">
                <div class="truncate pr-2">
                  <span class="font-mono text-emerald-700 font-bold text-[11px]">${u.date}</span>
                  <div class="font-bold text-slate-800 text-[11px] truncate">${escapeHtml(u.title)}</div>
                </div>
                <span class="text-[10px] font-mono text-rose-600 shrink-0 font-bold">${escapeHtml(u.ddayText || '')}</span>
              </div>
            `).join("")}
          </div>
        ` : ''}
      </div>

      <div class="pt-3 border-t border-slate-200 text-center">
        <p class="text-[10px] text-slate-500">정기 점검 문의: 산업안전 총괄 관리자</p>
      </div>
    `;
  }

  lucide.createIcons();
}

// ==========================================
// 10. 법정 서식 다운로드 및 A4 인쇄 센터 (Option 1)
// ==========================================
let currentPreviewForm = null;

function renderFormsHub() {
  const container = document.getElementById("forms-grid-container");
  if (!container) return;

  const forms = (window.SAFETY_TIPS_DATA && window.SAFETY_TIPS_DATA.safetyForms) || [];
  if (!forms.length) {
    container.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-slate-400">등록된 서식 데이터가 없습니다.</div>`;
    return;
  }

  container.innerHTML = forms.map(f => `
    <div class="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-4">
      <div class="space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            ${escapeHtml(f.category)}
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            ${escapeHtml(f.cycle)}
          </span>
        </div>

        <h3 class="font-extrabold text-sm text-slate-900 leading-snug">${escapeHtml(f.title)}</h3>
        <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(f.desc)}</p>

        <div class="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
          <span class="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">⚖️ ${escapeHtml(f.lawRef)}</span>
          <span class="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">📁 ${escapeHtml(f.retention)}</span>
        </div>

        <div class="pt-2">
          <div class="text-[11px] font-bold text-slate-700 mb-1.5">주요 기재 항목:</div>
          <ul class="text-[11px] text-slate-600 space-y-1 pl-1">
            ${f.items.map(it => `
              <li class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                <span class="truncate">${escapeHtml(it)}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
        <button onclick="openFormPreview('${f.id}')" 
          class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i>
          <span>서식 열기 및 인쇄</span>
        </button>
        <button onclick="copyCurrentForm('${f.id}')" 
          class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition" title="텍스트 서식 복사">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

function openFormPreview(formId) {
  const forms = (window.SAFETY_TIPS_DATA && window.SAFETY_TIPS_DATA.safetyForms) || [];
  const form = forms.find(f => f.id === formId);
  if (!form) return;

  currentPreviewForm = form;
  const titleEl = document.getElementById("form-preview-title");
  const bodyEl = document.getElementById("form-preview-body");
  const modal = document.getElementById("form-preview-modal");

  if (titleEl) titleEl.textContent = `${form.title} (A4 규격)`;
  if (bodyEl) bodyEl.innerHTML = form.previewHtml;
  if (modal) modal.classList.remove("hidden");

  lucide.createIcons();
}

function closeFormPreview() {
  const modal = document.getElementById("form-preview-modal");
  if (modal) modal.classList.add("hidden");
}

function printCurrentForm() {
  window.print();
}

function copyCurrentForm(formId) {
  const targetId = formId || (currentPreviewForm ? currentPreviewForm.id : null);
  const forms = (window.SAFETY_TIPS_DATA && window.SAFETY_TIPS_DATA.safetyForms) || [];
  const form = forms.find(f => f.id === targetId);
  if (!form) {
    alert("복사할 서식을 찾을 수 없습니다.");
    return;
  }

  const text = `[${form.title}]
근거 법령: ${form.lawRef}
보존 주기: ${form.retention}
작성 주기: ${form.cycle}

■ 주요 필수 기재 항목:
${form.items.map((it, idx) => `${idx + 1}. ${it}`).join("\n")}

■ 실무 안내:
본 서식은 고용노동부 및 한국산업안전보건공단 표준 점검 지침에 따른 필수 법정 양식입니다.`;

  navigator.clipboard.writeText(text).then(() => {
    alert(`"${form.title}" 텍스트 서식이 클립보드에 복사되었습니다.\n한글(HWP)이나 엑셀에 붙여넣어 즉시 활용하실 수 있습니다.`);
  }).catch(() => {
    alert("클립보드 복사 권한이 제한되어 있습니다. [A4 즉시 인쇄] 기능을 이용해 주세요.");
  });
}

// ==============================================
// 9. 안전보건관리체계 (절차서 · 지침서 규정 라이브러리)
// ==============================================
let currentSystemDocsFilter = 'all'; // 'all' | '절차서' | '지침서'
let isSystemDocsUnlocked = false;

function setSystemDocsFilter(filter) {
  currentSystemDocsFilter = filter;

  const btnAll = document.getElementById("btn-sysdoc-all");
  const btnP = document.getElementById("btn-sysdoc-p");
  const btnG = document.getElementById("btn-sysdoc-g");

  const activeCls = "sysdoc-filter-btn px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-xs transition";
  const inactiveCls = "sysdoc-filter-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";

  if (btnAll) btnAll.className = filter === 'all' ? activeCls : inactiveCls;
  if (btnP) btnP.className = filter === '절차서' ? activeCls : inactiveCls;
  if (btnG) btnG.className = filter === '지침서' ? activeCls : inactiveCls;

  renderSystemDocs();
}
window.setSystemDocsFilter = setSystemDocsFilter;

function toggleSystemDocsUnlock() {
  if (isSystemDocsUnlocked) {
    // 다시 잠금
    isSystemDocsUnlocked = false;
    renderSystemDocs();
  } else {
    openSystemDocsUnlockModal();
  }
}
window.toggleSystemDocsUnlock = toggleSystemDocsUnlock;

function openSystemDocsUnlockModal() {
  const modal = document.getElementById("system-docs-unlock-modal");
  const input = document.getElementById("sysdocs-pin-input");
  const err = document.getElementById("sysdocs-unlock-error");
  if (err) err.classList.add("hidden");
  if (input) {
    input.value = "";
    input.classList.remove("border-rose-500");
  }
  if (modal) modal.classList.remove("hidden");
  setTimeout(() => { if (input && typeof input.focus === 'function') input.focus(); }, 100);
}
window.openSystemDocsUnlockModal = openSystemDocsUnlockModal;

function closeSystemDocsUnlockModal() {
  const modal = document.getElementById("system-docs-unlock-modal");
  if (modal) modal.classList.add("hidden");
}
window.closeSystemDocsUnlockModal = closeSystemDocsUnlockModal;

function verifySystemDocsPin() {
  const input = document.getElementById("sysdocs-pin-input");
  const err = document.getElementById("sysdocs-unlock-error");
  const pin = input ? input.value.trim() : "";
  const correctPin = siteConfig?.admin_pin || "1234";

  if (pin === correctPin) {
    isSystemDocsUnlocked = true;
    closeSystemDocsUnlockModal();
    renderSystemDocs();
  } else {
    if (err) {
      err.textContent = "❌ 보안 PIN 번호가 일치하지 않습니다. (기본값: 1234)";
      err.classList.remove("hidden");
    }
    if (input) {
      input.classList.add("border-rose-500");
      if (typeof input.focus === 'function') input.focus();
    }
  }
}
window.verifySystemDocsPin = verifySystemDocsPin;

function renderSystemDocs() {
  const grid = document.getElementById("system-docs-grid");
  const statsEl = document.getElementById("sysdoc-stats-summary");
  const unlockBtn = document.getElementById("btn-sysdoc-unlock");
  const searchInput = document.getElementById("sysdoc-search-input");
  if (!grid) return;

  const allDocs = window.SAFETY_TIPS_DATA?.systemDocs || [];
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // 관리자 설정에서 상시 전체 공개되어 있는지 확인
  const isUnlocked = isSystemDocsUnlocked || !!siteConfig?.show_all_system_docs;

  // 잠금/해제 버튼 렌더링
  if (unlockBtn) {
    if (isUnlocked) {
      unlockBtn.className = "px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 hover:bg-emerald-100 shadow-2xs";
      unlockBtn.innerHTML = `<i data-lucide="unlock" class="w-3.5 h-3.5 text-emerald-600"></i><span>전체 규정(61종) 열람 중 (잠그기)</span>`;
    } else {
      unlockBtn.className = "px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold transition flex items-center gap-1.5 hover:bg-amber-100 shadow-2xs";
      unlockBtn.innerHTML = `<i data-lucide="lock" class="w-3.5 h-3.5 text-amber-600"></i><span>미배포 10종 숨김 중 (잠금 해제)</span>`;
    }
  }

  // 필터링 적용
  const filtered = allDocs.filter(doc => {
    // 1. 숨김 처리 (미잠금 해제 상태일 때 정리본에만 있는 isHidden 항목은 완전 숨김)
    if (!isUnlocked && doc.isHidden) {
      return false;
    }

    // 2. 분류 필터
    if (currentSystemDocsFilter !== 'all' && doc.kind !== currentSystemDocsFilter) {
      return false;
    }

    // 3. 검색어 필터
    if (keyword) {
      const matchMain = doc.code.toLowerCase().includes(keyword) ||
                        doc.title.toLowerCase().includes(keyword) ||
                        (doc.clause && doc.clause.toLowerCase().includes(keyword)) ||
                        (doc.description && doc.description.toLowerCase().includes(keyword));
      const matchSub = (doc.subForms || []).some(sf =>
        sf.code.toLowerCase().includes(keyword) || sf.title.toLowerCase().includes(keyword)
      );
      if (!matchMain && !matchSub) return false;
    }

    return true;
  });

  // 상태 요약 갱신
  if (statsEl) {
    const visibleMainCount = allDocs.filter(d => !d.isHidden).length;
    const hiddenMainCount = allDocs.filter(d => d.isHidden).length;
    statsEl.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-bold text-slate-800">표시 규정: <strong class="text-emerald-700 font-mono">${filtered.length}</strong>개</span>
        <span class="text-slate-300">|</span>
        <span class="text-[11px] text-slate-500">사내 배포 <strong>${visibleMainCount}</strong>종</span>
        <span class="text-slate-300">|</span>
        <span class="text-[11px] ${isUnlocked ? 'text-amber-700 font-bold' : 'text-slate-400'}">정리본 미배포 <strong>${hiddenMainCount}</strong>종 ${isUnlocked ? '(열람 중)' : '(숨김)'}</span>
      </div>
    `;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
        <p class="text-xs font-semibold">검색 조건에 맞는 규정 또는 지침서가 없습니다.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(doc => {
    const isP = doc.kind === '절차서';
    const subForms = doc.subForms || [];
    const isHiddenItem = doc.isHidden;

    return `
      <div class="p-4 rounded-2xl border transition duration-200 flex flex-col justify-between space-y-3 ${
        isHiddenItem 
          ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400 hover:shadow-xs' 
          : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
      }">
        <div class="space-y-2.5">
          <!-- 상단 뱃지 라인 -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md ${
                isP ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }">${escapeHtml(doc.code)}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(doc.kind)}</span>
            </div>
            ${
              isHiddenItem
                ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3 text-amber-700"></i>정리본 보관본</span>'
                : '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3 text-emerald-600"></i>사내 배포본</span>'
            }
          </div>

          <!-- 제목 & 조항 매핑 -->
          <div>
            <h4 class="font-bold text-sm text-slate-900 leading-snug">${escapeHtml(doc.title)}</h4>
            <span class="text-[11px] font-semibold text-emerald-700 font-mono mt-0.5 inline-block">${escapeHtml(doc.clause)}</span>
          </div>

          <!-- 설명 -->
          <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(doc.description)}</p>

          <!-- 부속 서식 목록 (있는 경우) -->
          ${subForms.length > 0 ? `
            <div class="pt-2 border-t border-slate-100 space-y-1.5">
              <span class="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">부속 서식 및 양식 (${subForms.length}종)</span>
              <div class="space-y-1 max-h-36 overflow-y-auto pr-1">
                ${subForms.map(sf => `
                  <div class="p-1.5 bg-slate-50 rounded-lg border border-slate-200/60 text-[10px] text-slate-700 flex items-center justify-between">
                    <span class="font-mono text-slate-500 font-semibold truncate mr-2">${escapeHtml(sf.code)}</span>
                    <span class="font-medium text-slate-900 truncate text-right flex-1">${escapeHtml(sf.title)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span class="text-slate-400 text-[10px]">${isP ? '표준 절차서' : '현장 실무지침'}</span>
          <span class="font-semibold text-emerald-600 flex items-center gap-1">
            <span>체계 규정</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
          </span>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}
window.renderSystemDocs = renderSystemDocs;
