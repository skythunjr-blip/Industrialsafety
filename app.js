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

  // 30초마다 자동 새로고침
  setInterval(async () => {
    await loadDashboardData(true);
    await loadRecentFiles();
  }, 30000);
});

// 전체 대시보드 데이터 로드
async function loadDashboardData(isSilent = false) {
  try {
    siteConfig = await SafetyDB.getSiteConfig();
    const rawAlerts = await SafetyDB.getAlerts();
    const rawInspections = await SafetyDB.getInspections();
    allNotices = await SafetyDB.getNotices();
    const rawCorpStats = await SafetyDB.getCorpStats();

    // 🔒 케이펙 숨김 처리: 보담과 케이프라이드 2개 사 중심 데이터만 필터링
    allCorpStats = rawCorpStats.filter(s => s.corp_name !== "케이펙");
    allAlerts = rawAlerts.filter(a => a.corp !== "케이펙");
    allInspections = rawInspections.filter(i => i.corp !== "케이펙");

    updateHeaderAndBanner();
    renderKPIs();
    renderAlerts();
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
  if (siteConfig.system_name) {
    document.getElementById("header-system-title").textContent = siteConfig.system_name;
  }
  document.getElementById("header-subtitle").textContent = "(주)케이프라이드 · (주)보담";

  const banner = document.getElementById("top-urgent-banner");
  const bannerText = document.getElementById("banner-text");
  if (siteConfig.urgent_notice && siteConfig.urgent_notice.trim() !== "") {
    bannerText.textContent = siteConfig.urgent_notice;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

// 법인 필터 전환
function filterCorp(corpName) {
  selectedCorp = corpName;
  const buttons = document.querySelectorAll(".corp-tab");
  buttons.forEach(btn => {
    if (btn.id === `filter-btn-${corpName}`) {
      btn.className = "corp-tab px-3 py-1.5 rounded-lg text-sky-700 bg-sky-50 font-bold transition";
    } else {
      btn.className = "corp-tab px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
    }
  });

  renderKPIs();
  renderAlerts();
  renderInspectionsTable();
  renderCorpCards();
}

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
  const maxZeroAccident = filteredStats.reduce((max, s) => Math.max(max, s.zero_accident_days || 0), 0);

  document.getElementById("kpi-total-workers").textContent = totalWorkers.toLocaleString();
  document.getElementById("kpi-zero-accident").textContent = maxZeroAccident.toLocaleString();
  document.getElementById("kpi-alerts-count").textContent = filteredAlerts.length;
  document.getElementById("kpi-inspections-count").textContent = filteredInspections.length;
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

  container.innerHTML = filtered.map(a => `
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
        <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">${escapeHtml(a.desc || '')}</p>
      </div>

      <div class="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
        <span class="text-[11px] text-slate-400 font-medium">상태: <strong class="text-slate-700">${escapeHtml(a.status || '대기')}</strong></span>
        <button onclick="showAlertDetail('${escapeHtml(a.title)}', '${escapeHtml(a.desc || '')}')" class="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1">
          <span>${escapeHtml(a.action_text || '확인')}</span>
          <i data-lucide="arrow-right" class="w-3 h-3"></i>
        </button>
      </div>
    </div>
  `).join("");
}

function showAlertDetail(title, desc) {
  alert(`[안내 상세]\n\n제목: ${title}\n\n내용:\n${desc}`);
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
          <span class="text-slate-500">무재해 일수</span>
          <span class="font-bold text-emerald-600">${stat.zero_accident_days}일</span>
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

  document.getElementById("modal-notice-target").textContent = notice.corp || "전 법인";
  document.getElementById("modal-notice-title").textContent = notice.title;
  document.getElementById("modal-notice-author").textContent = notice.author || "안전관리자";
  document.getElementById("modal-notice-date").textContent = notice.date || "-";
  document.getElementById("modal-notice-content").textContent = notice.content || "";

  document.getElementById("notice-detail-modal").classList.remove("hidden");
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
  const tabs = ["daily", "weekly", "monthly", "quarterly", "yearly"];
  tabs.forEach(c => {
    const btn = document.getElementById(`chk-tab-${c}`);
    if (c === cycle) {
      btn.className = "chk-tab px-3 py-1.5 rounded-lg text-sky-700 bg-white shadow-xs font-bold transition";
    } else {
      btn.className = "chk-tab px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition";
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

  const list = window.SAFETY_TIPS_DATA.periodicChecklists[currentChecklistCycle] || [];
  const checked = getCheckedItems();

  const completedCount = list.filter(item => checked.includes(item.id)).length;
  const totalCount = list.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (progressText) {
    progressText.textContent = `진행도: ${completedCount}/${totalCount} (${percent}%)`;
  }

  // 필터링: hideCompletedChecklist가 true면 완료된 항목 제외
  const visibleList = hideCompletedChecklist
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
          ${hideCompletedChecklist ? '완료된 항목을 확인하려면 상단의 [완료 항목 숨김 중] 버튼을 클릭하세요.' : '수고하셨습니다. 안전한 사업장이 유지되고 있습니다.'}
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = visibleList.map(item => {
    const isDone = checked.includes(item.id);
    return `
      <div id="chk-card-${item.id}" class="p-4 rounded-xl border ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'} transition duration-200 space-y-2.5">
        <div class="flex items-start justify-between gap-3">
          <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
            <input type="checkbox" onchange="handleCheckItem('${item.id}')" ${isDone ? 'checked' : ''}
              class="w-4 h-4 mt-0.5 rounded text-sky-600 focus:ring-sky-500 transition cursor-pointer">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${escapeHtml(item.title)}</span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${escapeHtml(item.corp)}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">${escapeHtml(item.desc)}</p>
            </div>
          </label>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 shrink-0">${escapeHtml(item.badge)}</span>
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
  const container = document.getElementById("law-changes-list");
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

  document.getElementById("law-modal").classList.remove("hidden");
  lucide.createIcons();
}

function closeLawModal() {
  document.getElementById("law-modal").classList.add("hidden");
}

function openTipsModal() {
  const tipsContainer = document.getElementById("practical-tips-list");
  const deadlineTbody = document.getElementById("deadline-guide-tbody");
  if (!tipsContainer || !window.SAFETY_TIPS_DATA) return;

  const deadlines = window.SAFETY_TIPS_DATA.deadlineGuide || [];
  deadlineTbody.innerHTML = deadlines.map(d => `
    <tr class="hover:bg-rose-50/40">
      <td class="py-1.5 px-2 font-bold text-slate-900">${escapeHtml(d.target)}</td>
      <td class="py-1.5 px-2 font-semibold text-rose-700 font-mono">${escapeHtml(d.deadline)}</td>
      <td class="py-1.5 px-2 text-slate-800 font-medium">${escapeHtml(d.penalty)}</td>
      <td class="py-1.5 px-2 text-slate-500">${escapeHtml(d.authority)}</td>
    </tr>
  `).join("");

  const tips = window.SAFETY_TIPS_DATA.practicalTips || [];
  tipsContainer.innerHTML = tips.map((tip, idx) => `
    <div class="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">${idx + 1}</span>
          <h4 class="font-bold text-sm text-slate-900">${escapeHtml(tip.domain)} 실무 팁</h4>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">${escapeHtml(tip.badge)}</span>
      </div>

      <div class="text-xs font-bold text-slate-800 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
        📌 ${escapeHtml(tip.summary)}
      </div>

      <div class="space-y-2 text-xs">
        <div class="p-2.5 bg-red-50/60 border border-red-100 rounded-lg text-red-900">
          <strong class="text-red-950 flex items-center gap-1 mb-0.5">
            <i data-lucide="x-circle" class="w-3.5 h-3.5 text-red-500"></i> 초보자가 가장 많이 하는 실수:
          </strong>
          <p class="leading-relaxed text-[11px]">${escapeHtml(tip.mistake)}</p>
        </div>

        <div class="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-emerald-900">
          <strong class="text-emerald-950 flex items-center gap-1 mb-0.5">
            <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> 올바른 해결 실무 절차:
          </strong>
          <p class="leading-relaxed text-[11px]">${escapeHtml(tip.solution)}</p>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-100">
        <span class="text-[11px] font-bold text-slate-500 mb-1 block">✅ 필수 인수인계 체크리스트:</span>
        <ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
          ${tip.checklist.map(c => `<li>${escapeHtml(c)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `).join("");

  document.getElementById("tips-modal").classList.remove("hidden");
  lucide.createIcons();
}

function closeTipsModal() {
  document.getElementById("tips-modal").classList.add("hidden");
}

// 최근 수정된 로컬 업무 서류 감시 (run_dashboard.py의 /api/recent-files 연동)
async function loadRecentFiles() {
  const container = document.getElementById("recent-files-list");
  const badge = document.getElementById("local-api-status");

  try {
    const res = await fetch("/api/recent-files");
    if (!res.ok) throw new Error("API 비활성");
    const json = await res.json();
    
    badge.textContent = `실시간 연동 (${json.files.length}건)`;
    badge.className = "text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold";

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
    badge.textContent = "클라우드 모드";
    badge.className = "text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold";
    
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
  const modalContainer = document.getElementById("iso-modal-checklist-container");
  const modalProgress = document.getElementById("iso-modal-progress");
  if (!modalContainer || !window.SAFETY_TIPS_DATA?.isoData) return;

  const list = window.SAFETY_TIPS_DATA.isoData.checklists || [];
  const checked = getIsoCheckedItems();

  const doneCount = list.filter(i => checked.includes(i.id)).length;
  modalProgress.textContent = `진행도: ${doneCount}/${list.length} (${Math.round((doneCount / list.length) * 100)}%)`;

  modalContainer.innerHTML = list.map(item => {
    const isDone = checked.includes(item.id);
    return `
      <div class="p-3 rounded-xl border ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-xs'} text-xs space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <label class="flex items-start gap-2 cursor-pointer select-none flex-1">
            <input type="checkbox" onchange="handleModalIsoCheck('${item.id}')" ${isDone ? 'checked' : ''}
              class="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${escapeHtml(item.title)}</span>
                ${isDone ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">완료</span>' : ''}
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(item.desc)}</p>
            </div>
          </label>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badge.includes('긴급') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'} shrink-0">
            ${escapeHtml(item.badge)}
          </span>
        </div>
        <div class="p-2 bg-emerald-50/70 border border-emerald-100 rounded text-[11px] text-emerald-950">
          ${escapeHtml(item.tip)}
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("iso-detail-modal").classList.remove("hidden");
  lucide.createIcons();
}

function handleModalIsoCheck(id) {
  handleIsoCheckItem(id);
  openIsoModal(); // 모달 내 목록 다시 그리기
}

function closeIsoModal() {
  document.getElementById("iso-detail-modal").classList.add("hidden");
}
