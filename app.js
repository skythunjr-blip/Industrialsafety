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

  const filteredStats = selectedCorp === "ALL"
    ? allCorpStats
    : allCorpStats.filter(s => s.corp_name === selectedCorp);

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
        <span>조치 요령 보기</span>
        <i data-lucide="chevron-right" class="w-3 h-3"></i>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

// 2사 법인 카드 렌더링 (케이펙 제외)
function renderCorpCards() {
  const container = document.getElementById("corp-cards-container");
  const filtered = selectedCorp === "ALL"
    ? allCorpStats
    : allCorpStats.filter(s => s.corp_name === selectedCorp);

  container.innerHTML = filtered.map(stat => `
    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-sm text-slate-900">${escapeHtml(stat.corp_name)}</h3>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">정상 운영</span>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-slate-500">근로자 수</span>
          <span class="font-bold text-slate-800">${stat.worker_count}명</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">건강검진 수검률</span>
          <span class="font-bold text-indigo-600">${stat.health_check_rate || 98}%</span>
        </div>
        <div>
          <div class="flex items-center justify-between text-[11px] mb-1">
            <span class="text-slate-500">위험성평가 이행률</span>
            <span class="font-bold text-sky-600">${stat.risk_assessment_rate}%</span>
          </div>
          <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div class="bg-sky-500 h-full rounded-full" style="width: ${stat.risk_assessment_rate}%"></div>
          </div>
        </div>
      </div>

      <p class="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
        ${escapeHtml(stat.status_summary || '정상 가동 중')}
      </p>
    </div>
  `).join("");
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

// Chart.js 통계 차트 (케이펙 제외, 케이프라이드 vs 보담)
function renderChart() {
  const canvas = document.getElementById("safetyStatsChart");
  if (!canvas) return;

  const labels = allCorpStats.map(s => s.corp_name);
  const riskRates = allCorpStats.map(s => s.risk_assessment_rate || 0);
  const healthRates = allCorpStats.map(s => s.health_check_rate || 0);

  if (statsChartInstance) {
    statsChartInstance.destroy();
  }

  statsChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "위험성평가 이행률 (%)",
          data: riskRates,
          backgroundColor: "rgba(2, 132, 199, 0.8)",
          borderRadius: 6
        },
        {
          label: "건강검진 수검률 (%)",
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
    <div class="space-y-4">
      <div class="bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-2">
        <h4 class="font-bold text-xs text-rose-900 flex items-center gap-1.5">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i>
          <span>법정 의무 보고 및 신고 기한 가이드 (위반 시 과태료 직결)</span>
        </h4>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[11px]">
            <thead class="bg-rose-100/60 text-rose-800 font-bold">
              <tr>
                <th class="p-2">보고 항목</th>
                <th class="p-2">법정 기한</th>
                <th class="p-2">미보고 시 과태료</th>
                <th class="p-2">제출처</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rose-100/80">
              ${deadlines.map(d => `
                <tr class="hover:bg-white/80">
                  <td class="p-2 font-bold text-slate-800">${escapeHtml(d.target)}</td>
                  <td class="p-2 font-semibold text-rose-600 font-mono">${escapeHtml(d.deadline)}</td>
                  <td class="p-2 text-slate-700">${escapeHtml(d.penalty)}</td>
                  <td class="p-2 text-slate-500">${escapeHtml(d.authority)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3">
        <h4 class="font-bold text-xs text-slate-800">현장 실무 팁 & 노하우</h4>
        ${tips.map(t => `
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900">${escapeHtml(t.title)}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">${escapeHtml(t.badge || '실무팁')}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(t.desc)}</p>
          </div>
        `).join("")}
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
    
    const fallbackFiles = [
      { name: "특수건강진단 사전조사 및 실시계획서-케이프라이드.pdf", date: "2026-10-30 15:48" },
      { name: "2026년 특수건강진단 신청서-케이프라이드.pdf", date: "2026-10-29 16:33" },
      { name: "산재근로자내역-인사-2026.pages", date: "2026-10-28 12:57" },
      { name: "F-I011-01(Rev.04) 인증계획 확인서_(주)보담_2026.pdf", date: "2026-10-28 09:47" },
      { name: "소음 청력검사 실시 관련 협조.hwp", date: "2026-10-28 09:44" }
    ];

    container.innerHTML = fallbackFiles.map(f => `
      <div class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="file-text" class="w-4 h-4 text-sky-600 shrink-0"></i>
          <span class="font-medium text-slate-800 truncate">${escapeHtml(f.name)}</span>
        </div>
        <span class="text-[11px] font-mono text-slate-400 shrink-0 ml-2">${escapeHtml(f.date)}</span>
      </div>
    `).join("");
  }

  lucide.createIcons();
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
// 사원연명부 인력 통계 모달 제어 함수
// ==============================================

function openRosterModal() {
  const kprideContainer = document.getElementById("roster-kpride-list");
  const bodamContainer = document.getElementById("roster-bodam-list");
  if (!window.SAFETY_TIPS_DATA?.rosterStats) return;

  const stats = window.SAFETY_TIPS_DATA.rosterStats;

  // 1. 케이프라이드 부서별 렌더링
  if (kprideContainer) {
    kprideContainer.innerHTML = stats.kpride.departments.map(d => `
      <div class="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
        <span class="font-medium text-slate-800">${escapeHtml(d.dept)}</span>
        <div class="flex items-center gap-2">
          <span class="font-bold text-sky-700 font-mono">${d.count}명</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(d.riskLevel)}</span>
        </div>
      </div>
    `).join("");
  }

  // 2. 보담 부서별 렌더링
  if (bodamContainer) {
    bodamContainer.innerHTML = stats.bodam.departments.map(d => `
      <div class="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
        <span class="font-medium text-slate-800">${escapeHtml(d.dept)}</span>
        <div class="flex items-center gap-2">
          <span class="font-bold text-purple-700 font-mono">${d.count}명</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(d.riskLevel)}</span>
        </div>
      </div>
    `).join("");
  }

  document.getElementById("roster-modal").classList.remove("hidden");
  lucide.createIcons();
}

function closeRosterModal() {
  document.getElementById("roster-modal").classList.add("hidden");
}

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
  const views = ["dashboard", "calendar", "checklist", "iso45001", "forms"];
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
  if (tabId === "calendar") {
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

  window.scrollTo({ top: 0, behavior: "smooth" });
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
                <div class="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-[10px] text-amber-950 leading-relaxed">
                  ${escapeHtml(ev.tip)}
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
