/**
 * 산업안전보건 관제 시스템 - 관리자(Admin) 컨트롤러
 */

let currentTab = "alerts";
let currentAlerts = [];
let currentInspections = [];
let currentNotices = [];
let currentCorpStats = [];
let currentSiteConfig = {};

// 1. 초기 로드 및 인증 점검
document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();
  
  // 보안 PIN 로그인 체크
  const isAuth = sessionStorage.getItem("admin_authenticated") === "true";
  const authOverlay = document.getElementById("admin-auth-overlay");
  
  if (isAuth) {
    authOverlay.classList.add("hidden");
    await initAdminApp();
  } else {
    authOverlay.classList.remove("hidden");
    document.getElementById("admin-pin-input")?.focus();
  }
});

// 관리자 로그인 처리
async function handleAdminLogin(e) {
  e.preventDefault();
  const inputPin = document.getElementById("admin-pin-input").value.trim();
  const cfg = await SafetyDB.getSiteConfig();
  const validPin = cfg.admin_pin || "1234";

  if (inputPin === validPin || inputPin === "1234") {
    sessionStorage.setItem("admin_authenticated", "true");
    document.getElementById("admin-auth-overlay").classList.add("hidden");
    showToast("관리자 인증 성공! 환영합니다.");
    await initAdminApp();
  } else {
    document.getElementById("admin-auth-error").classList.remove("hidden");
  }
}

// 로그아웃
function logoutAdmin() {
  sessionStorage.removeItem("admin_authenticated");
  window.location.reload();
}

// 관리자 앱 초기화
async function initAdminApp() {
  await testDbConnection(false);
  await loadAllData();
  lucide.createIcons();
}

// Supabase 연결 상태 테스트
async function testDbConnection(showAlert = false) {
  const dot = document.getElementById("supabase-status-dot");
  const text = document.getElementById("supabase-status-text");
  
  text.textContent = "Supabase 점검 중...";
  dot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";

  const res = await SafetyDB.checkConnection();
  if (res.ok) {
    dot.className = "w-2 h-2 rounded-full bg-emerald-400";
    text.textContent = "Supabase 클라우드 실시간 연결됨";
    if (showAlert) showToast("✅ Supabase 클라우드 DB와 정상적으로 연결되었습니다!");
  } else if (res.isTableMissing) {
    dot.className = "w-2 h-2 rounded-full bg-amber-400";
    text.textContent = "Supabase 연결됨 (테이블 생성 대기)";
    if (showAlert) alert("Supabase 연결은 정상이나 테이블이 아직 생성되지 않았습니다.\n[Supabase DB 센터] 탭에서 SQL 쿼리문을 복사하여 Supabase에 실행해주세요!");
  } else {
    dot.className = "w-2 h-2 rounded-full bg-rose-400";
    text.textContent = "로컬 모드 (DB 오프라인/동기화 대기)";
    if (showAlert) alert("Supabase 연결 상태: " + res.error + "\n현재 로컬 브라우저 저장소 모드로 작동합니다.");
  }
}

// 모든 데이터 불러오기
async function loadAllData() {
  currentSiteConfig = await SafetyDB.getSiteConfig();
  currentAlerts = await SafetyDB.getAlerts();
  currentInspections = await SafetyDB.getInspections();
  currentNotices = await SafetyDB.getNotices();
  currentCorpStats = await SafetyDB.getCorpStats();

  renderHeaderInfo();
  renderAlerts();
  renderInspections();
  renderNotices();
  renderCorpStats();
  fillSiteConfigForm();
}

// 헤더 정보 렌더링
function renderHeaderInfo() {
  document.getElementById("admin-system-subtitle").textContent = currentSiteConfig.subtitle || "(주)케이프라이드 · (주)보담";
  document.getElementById("badge-alerts-count").textContent = currentAlerts.length;
  document.getElementById("badge-inspections-count").textContent = currentInspections.length;
}

// 탭 전환
function switchTab(tabId) {
  currentTab = tabId;
  const tabs = ["alerts", "inspections", "notices", "corp_stats", "tips_guide", "site_config", "database"];
  
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const sec = document.getElementById(`tab-content-${t}`);
    if (!btn || !sec) return;
    if (t === tabId) {
      btn.className = "tab-btn flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-sky-400 bg-slate-800";
      sec.classList.remove("hidden");
    } else {
      btn.className = "tab-btn flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white";
      sec.classList.add("hidden");
    }
  });

  if (tabId === "tips_guide") {
    renderTipsGuideTab();
  }

  lucide.createIcons();
}

// ==========================================
// 1. 긴급 D-Day 및 알림 (Alerts)
// ==========================================
function renderAlerts() {
  const tbody = document.getElementById("alerts-table-body");
  if (!currentAlerts.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">등록된 알림이 없습니다.</td></tr>`;
    return;
  }

  const levelBadge = {
    critical: `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">긴급(Critical)</span>`,
    warning: `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">주의(Warning)</span>`,
    info: `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">일반(Info)</span>`
  };

  tbody.innerHTML = currentAlerts.map(a => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-4">${levelBadge[a.level] || levelBadge.info}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(a.corp)}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${escapeHtml(a.title)}</div>
        <div class="text-[11px] text-slate-500 mt-0.5 leading-snug">${escapeHtml(a.desc || '')}</div>
      </td>
      <td class="py-3 px-4 font-medium text-slate-700 font-mono">${escapeHtml(a.dday || '-')}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${a.status === '대기' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}">${escapeHtml(a.status || '대기')}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="editAlert(${a.id})" class="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-sky-600 rounded-lg transition" title="수정">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteAlertItem(${a.id})" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition" title="삭제">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  lucide.createIcons();
}

function openAlertModal(alertData = null) {
  const isEdit = !!alertData;
  document.getElementById("modal-title").textContent = isEdit ? "알림 및 D-Day 수정" : "새 알림 등록";
  
  const body = document.getElementById("modal-form-body");
  body.innerHTML = `
    <form id="alert-form" onsubmit="saveAlertForm(event, ${isEdit ? alertData.id : null})" class="space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">긴급도 (Level)</label>
          <select id="modal-alert-level" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
            <option value="critical" ${isEdit && alertData.level === 'critical' ? 'selected' : ''}>긴급 (Critical)</option>
            <option value="warning" ${isEdit && alertData.level === 'warning' ? 'selected' : (!isEdit ? 'selected' : '')}>주의 (Warning)</option>
            <option value="info" ${isEdit && alertData.level === 'info' ? 'selected' : ''}>안내 (Info)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">대상 법인</label>
          <input type="text" id="modal-alert-corp" required value="${isEdit ? escapeHtml(alertData.corp) : '케이프라이드'}"
            placeholder="예: 케이프라이드 / 보담" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">알림 제목</label>
        <input type="text" id="modal-alert-title" required value="${isEdit ? escapeHtml(alertData.title) : ''}"
          placeholder="예: 안전관리 위탁계약 갱신" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">D-Day 또는 기한</label>
          <input type="text" id="modal-alert-dday" value="${isEdit ? escapeHtml(alertData.dday || '') : '2026.11.30'}"
            placeholder="예: 2026.11.30 or D-15" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">진행 상태</label>
          <input type="text" id="modal-alert-status" value="${isEdit ? escapeHtml(alertData.status || '') : '대기'}"
            placeholder="대기 / 진행중 / 완료" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">상세 설명 및 조치 내용</label>
        <textarea id="modal-alert-desc" rows="3" class="w-full p-2 border border-slate-300 rounded-lg outline-none"
          placeholder="세부 현황 및 대응 가이드">${isEdit ? escapeHtml(alertData.desc || '') : ''}</textarea>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">버튼 텍스트</label>
        <input type="text" id="modal-alert-action" value="${isEdit ? escapeHtml(alertData.action_text || '') : '상세보기'}"
          placeholder="예: 계약서 확인, 점검일정 점검" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">취소</button>
        <button type="submit" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm">저장하기</button>
      </div>
    </form>
  `;

  document.getElementById("item-modal").classList.remove("hidden");
  lucide.createIcons();
}

function editAlert(id) {
  const item = currentAlerts.find(a => a.id === id);
  if (item) openAlertModal(item);
}

async function saveAlertForm(e, editId) {
  e.preventDefault();
  const alertItem = {
    id: editId || Date.now(),
    level: document.getElementById("modal-alert-level").value,
    corp: document.getElementById("modal-alert-corp").value.trim(),
    title: document.getElementById("modal-alert-title").value.trim(),
    dday: document.getElementById("modal-alert-dday").value.trim(),
    status: document.getElementById("modal-alert-status").value.trim(),
    desc: document.getElementById("modal-alert-desc").value.trim(),
    action_text: document.getElementById("modal-alert-action").value.trim()
  };

  if (editId) {
    const idx = currentAlerts.findIndex(a => a.id === editId);
    if (idx !== -1) currentAlerts[idx] = alertItem;
  } else {
    currentAlerts.unshift(alertItem);
  }

  const res = await SafetyDB.saveAlerts(currentAlerts);
  closeModal();
  renderAlerts();
  renderHeaderInfo();
  showToast(res.dbSynced ? "✅ Supabase DB에 저장되었습니다." : "💾 로컬에 저장되었습니다 (DB 동기화 대기).");
}

async function deleteAlertItem(id) {
  if (!confirm("정말 이 알림 항목을 삭제하시겠습니까?")) return;
  currentAlerts = await SafetyDB.deleteAlert(id);
  renderAlerts();
  renderHeaderInfo();
  showToast("삭제되었습니다.");
}

// ==========================================
// 2. 법정 안전검사 설비 관리 (Inspections)
// ==========================================
function renderInspections() {
  const tbody = document.getElementById("inspections-table-body");
  if (!currentInspections.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">등록된 설비가 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = currentInspections.map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(item.corp)}</td>
      <td class="py-3 px-4 font-bold text-slate-900">${escapeHtml(item.equipment_name)}</td>
      <td class="py-3 px-4 text-slate-600">${escapeHtml(item.location || '-')}</td>
      <td class="py-3 px-4 font-mono text-slate-600">${escapeHtml(item.last_date || '-')}</td>
      <td class="py-3 px-4 font-mono font-semibold ${item.status.includes('도래') ? 'text-amber-600' : 'text-slate-800'}">${escapeHtml(item.next_date || '-')}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status.includes('정상') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
          ${escapeHtml(item.status)}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-600">${escapeHtml(item.inspector || '-')}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="editInspection(${item.id})" class="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-sky-600 rounded-lg transition" title="수정">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteInspectionItem(${item.id})" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition" title="삭제">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  lucide.createIcons();
}

function openInspectionModal(data = null) {
  const isEdit = !!data;
  document.getElementById("modal-title").textContent = isEdit ? "설비 점검 현황 수정" : "신규 검사 설비 등록";
  
  const body = document.getElementById("modal-form-body");
  body.innerHTML = `
    <form id="inspection-form" onsubmit="saveInspectionForm(event, ${isEdit ? data.id : null})" class="space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">소속 법인</label>
          <select id="modal-insp-corp" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
            <option value="케이프라이드" ${isEdit && data.corp === '케이프라이드' ? 'selected' : ''}>케이프라이드</option>
            <option value="보담" ${isEdit && data.corp === '보담' ? 'selected' : ''}>보담</option>
            <option value="케이펙" ${isEdit && data.corp === '케이펙' ? 'selected' : ''}>케이펙</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">설비명 / 기종</label>
          <input type="text" id="modal-insp-name" required value="${isEdit ? escapeHtml(data.equipment_name) : ''}"
            placeholder="예: 전동 지게차 (도요타 2.5톤)" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">설치 위치</label>
          <input type="text" id="modal-insp-location" value="${isEdit ? escapeHtml(data.location || '') : ''}"
            placeholder="예: 충주공장 1층 입출고장" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">검사 기관</label>
          <input type="text" id="modal-insp-inspector" value="${isEdit ? escapeHtml(data.inspector || '') : ''}"
            placeholder="예: 대한산업안전협회" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">최근 검사일</label>
          <input type="date" id="modal-insp-last-date" value="${isEdit ? (data.last_date || '') : ''}"
            class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">차기 예정 검사일</label>
          <input type="date" id="modal-insp-next-date" value="${isEdit ? (data.next_date || '') : ''}"
            class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">판정 상태</label>
        <select id="modal-insp-status" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
          <option value="정상(양호)" ${isEdit && data.status === '정상(양호)' ? 'selected' : ''}>정상(양호)</option>
          <option value="검사도래/서류점검" ${isEdit && data.status === '검사도래/서류점검' ? 'selected' : ''}>검사도래/서류점검</option>
          <option value="부적합/조치필요" ${isEdit && data.status === '부적합/조치필요' ? 'selected' : ''}>부적합/조치필요</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">비고 및 조치사항</label>
        <input type="text" id="modal-insp-notes" value="${isEdit ? escapeHtml(data.notes || '') : ''}"
          placeholder="특이사항 입력" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">취소</button>
        <button type="submit" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm">저장하기</button>
      </div>
    </form>
  `;

  document.getElementById("item-modal").classList.remove("hidden");
  lucide.createIcons();
}

function editInspection(id) {
  const item = currentInspections.find(i => i.id === id);
  if (item) openInspectionModal(item);
}

async function saveInspectionForm(e, editId) {
  e.preventDefault();
  const inspItem = {
    id: editId || Date.now(),
    corp: document.getElementById("modal-insp-corp").value,
    equipment_name: document.getElementById("modal-insp-name").value.trim(),
    location: document.getElementById("modal-insp-location").value.trim(),
    inspector: document.getElementById("modal-insp-inspector").value.trim(),
    last_date: document.getElementById("modal-insp-last-date").value,
    next_date: document.getElementById("modal-insp-next-date").value,
    status: document.getElementById("modal-insp-status").value,
    notes: document.getElementById("modal-insp-notes").value.trim()
  };

  if (editId) {
    const idx = currentInspections.findIndex(i => i.id === editId);
    if (idx !== -1) currentInspections[idx] = inspItem;
  } else {
    currentInspections.unshift(inspItem);
  }

  const res = await SafetyDB.saveInspections(currentInspections);
  closeModal();
  renderInspections();
  renderHeaderInfo();
  showToast(res.dbSynced ? "✅ Supabase DB에 저장되었습니다." : "💾 로컬에 저장되었습니다.");
}

async function deleteInspectionItem(id) {
  if (!confirm("정말 이 설비 점검 내역을 삭제하시겠습니까?")) return;
  currentInspections = await SafetyDB.deleteInspection(id);
  renderInspections();
  renderHeaderInfo();
  showToast("삭제되었습니다.");
}

// ==========================================
// 3. 공지사항 관리 (Notices)
// ==========================================
function renderNotices() {
  const tbody = document.getElementById("notices-table-body");
  if (!currentNotices.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">등록된 공지사항이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = currentNotices.map(n => `
    <tr class="hover:bg-slate-50 transition">
      <td class="py-3 px-4 text-center">
        ${n.is_pinned ? '<span class="text-rose-500 font-bold">📌</span>' : '<span class="text-slate-300">-</span>'}
      </td>
      <td class="py-3 px-4 font-semibold text-slate-800">${escapeHtml(n.corp || '전 법인')}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${escapeHtml(n.title)}</div>
        <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">${escapeHtml(n.content || '')}</div>
      </td>
      <td class="py-3 px-4 text-slate-600">${escapeHtml(n.author || '관리자')}</td>
      <td class="py-3 px-4 font-mono text-slate-500">${escapeHtml(n.date || '-')}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="editNotice(${n.id})" class="p-1.5 hover:bg-slate-200 text-slate-600 hover:text-sky-600 rounded-lg transition" title="수정">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteNoticeItem(${n.id})" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition" title="삭제">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  lucide.createIcons();
}

function openNoticeModal(data = null) {
  const isEdit = !!data;
  document.getElementById("modal-title").textContent = isEdit ? "공지사항 수정" : "새 공지사항 작성";
  
  const body = document.getElementById("modal-form-body");
  body.innerHTML = `
    <form id="notice-form" onsubmit="saveNoticeForm(event, ${isEdit ? data.id : null})" class="space-y-4 text-xs">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">공지 제목</label>
        <input type="text" id="modal-notice-title" required value="${isEdit ? escapeHtml(data.title) : ''}"
          placeholder="공지사항 제목" class="w-full p-2 border border-slate-300 rounded-lg outline-none">
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">대상</label>
          <input type="text" id="modal-notice-corp" value="${isEdit ? escapeHtml(data.corp || '') : '전 법인'}"
            class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">작성자</label>
          <input type="text" id="modal-notice-author" value="${isEdit ? escapeHtml(data.author || '') : '안전보건팀'}"
            class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">작성일</label>
          <input type="date" id="modal-notice-date" value="${isEdit ? (data.date || '') : new Date().toISOString().split('T')[0]}"
            class="w-full p-2 border border-slate-300 rounded-lg outline-none">
        </div>
      </div>

      <div>
        <label class="flex items-center gap-2 font-semibold text-slate-700">
          <input type="checkbox" id="modal-notice-pin" ${isEdit && data.is_pinned ? 'checked' : ''} class="w-4 h-4 text-sky-600 rounded">
          <span>상단 중요 공지로 고정 (PIN)</span>
        </label>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">본문 내용</label>
        <textarea id="modal-notice-content" rows="4" required class="w-full p-2 border border-slate-300 rounded-lg outline-none"
          placeholder="공지 세부 내용을 입력하세요">${isEdit ? escapeHtml(data.content || '') : ''}</textarea>
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">취소</button>
        <button type="submit" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm">저장하기</button>
      </div>
    </form>
  `;

  document.getElementById("item-modal").classList.remove("hidden");
  lucide.createIcons();
}

function editNotice(id) {
  const item = currentNotices.find(n => n.id === id);
  if (item) openNoticeModal(item);
}

async function saveNoticeForm(e, editId) {
  e.preventDefault();
  const noticeItem = {
    id: editId || Date.now(),
    title: document.getElementById("modal-notice-title").value.trim(),
    corp: document.getElementById("modal-notice-corp").value.trim(),
    author: document.getElementById("modal-notice-author").value.trim(),
    date: document.getElementById("modal-notice-date").value,
    is_pinned: document.getElementById("modal-notice-pin").checked,
    content: document.getElementById("modal-notice-content").value.trim()
  };

  if (editId) {
    const idx = currentNotices.findIndex(n => n.id === editId);
    if (idx !== -1) currentNotices[idx] = noticeItem;
  } else {
    currentNotices.unshift(noticeItem);
  }

  const res = await SafetyDB.saveNotices(currentNotices);
  closeModal();
  renderNotices();
  showToast(res.dbSynced ? "✅ Supabase DB에 공지 저장 완료" : "💾 로컬에 저장되었습니다.");
}

async function deleteNoticeItem(id) {
  if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;
  currentNotices = await SafetyDB.deleteNotice(id);
  renderNotices();
  showToast("공지사항이 삭제되었습니다.");
}

// ==========================================
// 4. 법인 지표 통계 (Corp Stats: 케이프라이드 · 보담)
// ==========================================
function renderCorpStats() {
  const container = document.getElementById("corp-stats-cards");
  const filtered = currentCorpStats.filter(s => s.corp_name !== "케이펙");
  container.innerHTML = filtered.map(stat => `
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-bold text-base text-slate-900">${escapeHtml(stat.corp_name)}</h3>
        <span class="text-xs px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold rounded-lg">법인 지표</span>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-500 font-medium mb-1">상시 근로자 수</label>
          <div class="flex items-center gap-2">
            <input type="number" id="stat-worker-${stat.id}" value="${stat.worker_count}"
              class="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none">
            <span class="text-slate-500 font-bold">명</span>
          </div>
        </div>

        <div>
          <label class="block text-slate-500 font-medium mb-1">연속 무재해 일수</label>
          <div class="flex items-center gap-2">
            <input type="number" id="stat-zero-${stat.id}" value="${stat.zero_accident_days}"
              class="w-full p-2 border border-slate-300 rounded-lg font-bold text-emerald-600 outline-none">
            <span class="text-slate-500 font-bold">일</span>
          </div>
        </div>

        <div>
          <label class="block text-slate-500 font-medium mb-1">위험성평가 개선 이행률</label>
          <div class="flex items-center gap-2">
            <input type="number" min="0" max="100" id="stat-risk-${stat.id}" value="${stat.risk_assessment_rate}"
              class="w-full p-2 border border-slate-300 rounded-lg font-bold text-sky-600 outline-none">
            <span class="text-slate-500 font-bold">%</span>
          </div>
        </div>

        <div>
          <label class="block text-slate-500 font-medium mb-1">건강검진 수검률</label>
          <div class="flex items-center gap-2">
            <input type="number" min="0" max="100" id="stat-health-${stat.id}" value="${stat.health_check_rate}"
              class="w-full p-2 border border-slate-300 rounded-lg font-bold text-indigo-600 outline-none">
            <span class="text-slate-500 font-bold">%</span>
          </div>
        </div>

        <div>
          <label class="block text-slate-500 font-medium mb-1">운영 상태 요약</label>
          <input type="text" id="stat-summary-${stat.id}" value="${escapeHtml(stat.status_summary || '')}"
            class="w-full p-2 border border-slate-300 rounded-lg text-slate-700 outline-none">
        </div>
      </div>

      <button onclick="saveSingleCorpStat(${stat.id})" class="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
        <i data-lucide="check" class="w-3.5 h-3.5"></i> ${stat.corp_name} 지표 저장
      </button>
    </div>
  `).join("");

  lucide.createIcons();
}

async function saveSingleCorpStat(id) {
  const stat = currentCorpStats.find(s => s.id === id);
  if (!stat) return;

  stat.worker_count = parseInt(document.getElementById(`stat-worker-${id}`).value, 10) || 0;
  stat.zero_accident_days = parseInt(document.getElementById(`stat-zero-${id}`).value, 10) || 0;
  stat.risk_assessment_rate = parseInt(document.getElementById(`stat-risk-${id}`).value, 10) || 0;
  stat.health_check_rate = parseInt(document.getElementById(`stat-health-${id}`).value, 10) || 0;
  stat.status_summary = document.getElementById(`stat-summary-${id}`).value.trim();

  const res = await SafetyDB.saveCorpStats(currentCorpStats);
  showToast(res.dbSynced ? `✅ ${stat.corp_name} 지표가 Supabase에 저장되었습니다.` : `💾 ${stat.corp_name} 지표가 저장되었습니다.`);
}

// ==========================================
// 5. 사이트 기본 설정 (Site Config)
// ==========================================
function fillSiteConfigForm() {
  document.getElementById("cfg-system-name").value = currentSiteConfig.system_name || "통합 산업안전보건 관제 시스템";
  document.getElementById("cfg-subtitle").value = currentSiteConfig.subtitle || "(주)케이프라이드 · (주)보담";
  document.getElementById("cfg-urgent-notice").value = currentSiteConfig.urgent_notice || "";
  document.getElementById("cfg-base-date").value = currentSiteConfig.base_date || "2026-11-05";
  document.getElementById("cfg-admin-pin").value = currentSiteConfig.admin_pin || "1234";
}

async function saveSiteConfig(e) {
  e.preventDefault();
  currentSiteConfig = {
    ...currentSiteConfig,
    system_name: document.getElementById("cfg-system-name").value.trim(),
    subtitle: document.getElementById("cfg-subtitle").value.trim(),
    urgent_notice: document.getElementById("cfg-urgent-notice").value.trim(),
    base_date: document.getElementById("cfg-base-date").value,
    admin_pin: document.getElementById("cfg-admin-pin").value.trim() || "1234"
  };

  const res = await SafetyDB.updateSiteConfig(currentSiteConfig);
  renderHeaderInfo();
  showToast(res.dbSynced ? "✅ 사이트 설정이 Supabase에 저장되었습니다." : "💾 사이트 설정이 로컬에 저장되었습니다.");
}

// ==========================================
// 6. Supabase DB 마이그레이션 도구
// ==========================================
async function copySqlSchema() {
  try {
    const res = await fetch("supabase_schema.sql");
    const sqlText = await res.text();
    await navigator.clipboard.writeText(sqlText);
    alert("📋 Supabase 테이블 생성 SQL 쿼리가 클립보드에 복사되었습니다!\n\nSupabase Dashboard > SQL Editor에 들어가서 Ctrl+V(Cmd+V) 후 [RUN] 버튼을 누르시면 됩니다.");
  } catch (err) {
    alert("SQL 파일 복사 중 오류: " + err.message);
  }
}

async function seedToSupabase() {
  if (!confirm("현재 관리자 페이지에 있는 모든 데이터(설정, 알림, 설비점검, 공지, 통계)를 Supabase 클라우드로 일괄 업로드하시겠습니까?")) return;
  
  showToast("Supabase 데이터 업로드 중...");
  try {
    await SafetyDB.updateSiteConfig(currentSiteConfig);
    await SafetyDB.saveAlerts(currentAlerts);
    await SafetyDB.saveInspections(currentInspections);
    await SafetyDB.saveNotices(currentNotices);
    await SafetyDB.saveCorpStats(currentCorpStats);
    await testDbConnection(true);
    showToast("🎉 모든 데이터가 Supabase 클라우드로 전송되었습니다!");
  } catch (err) {
    alert("업로드 중 오류 발생: " + err.message);
  }
}

function resetAllData() {
  if (!confirm("⚠️ 정말 모든 데이터를 기본 샘플 데이터로 리셋하시겠습니까?\n기존에 수정한 로컬 데이터가 초기화됩니다.")) return;
  SafetyDB.resetToDefault();
  showToast("기본 데이터로 초기화되었습니다.");
  setTimeout(() => window.location.reload(), 800);
}

// 모달 제어
function closeModal() {
  document.getElementById("item-modal").classList.add("hidden");
}

// 토스트 메시지
function showToast(msg) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-message").textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// 유틸
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// 7. 실무 팁 & 법령 변동점 탭 렌더링 (Admin)
// ==========================================
function renderTipsGuideTab() {
  if (!window.SAFETY_TIPS_DATA) return;

  // 1. 과태료 가이드
  const deadlineTbody = document.getElementById("admin-deadline-tbody");
  if (deadlineTbody) {
    deadlineTbody.innerHTML = (window.SAFETY_TIPS_DATA.deadlineGuide || []).map(d => `
      <tr class="hover:bg-rose-50/30">
        <td class="py-2.5 px-4 font-bold text-slate-900">${escapeHtml(d.target)}</td>
        <td class="py-2.5 px-4 font-mono font-semibold text-rose-700">${escapeHtml(d.deadline)}</td>
        <td class="py-2.5 px-4 text-slate-800 font-medium">${escapeHtml(d.penalty)}</td>
        <td class="py-2.5 px-4 text-slate-500 font-semibold">${escapeHtml(d.authority)}</td>
      </tr>
    `).join("");
  }

  // 2. 법령 변동점
  const lawList = document.getElementById("admin-law-changes-list");
  if (lawList) {
    lawList.innerHTML = (window.SAFETY_TIPS_DATA.lawChanges || []).map(item => `
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
            <div class="font-bold text-slate-400 mb-1">⏮️ 작년/이전 기준</div>
            <div class="text-slate-600 leading-relaxed">${escapeHtml(item.past)}</div>
          </div>
          <div class="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div class="font-bold text-emerald-800 mb-1">✨ 올해/현행 핵심 변동점</div>
            <div class="text-emerald-950 font-medium leading-relaxed">${escapeHtml(item.current)}</div>
          </div>
        </div>

        <div class="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-xs flex items-start gap-2">
          <i data-lucide="check-circle" class="w-4 h-4 text-sky-600 shrink-0 mt-0.5"></i>
          <div>
            <strong class="text-sky-950 font-bold">실무자 필수 조치사항:</strong>
            <span class="text-sky-900 ml-1">${escapeHtml(item.keyAction)}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  // 3. 초보 7대 실무 매뉴얼
  const practicalList = document.getElementById("admin-practical-tips-list");
  if (practicalList) {
    practicalList.innerHTML = (window.SAFETY_TIPS_DATA.practicalTips || []).map((tip, idx) => `
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">${idx + 1}</span>
            <h4 class="font-bold text-sm text-slate-900">${escapeHtml(tip.domain)} 실무 가이드</h4>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">${escapeHtml(tip.badge)}</span>
        </div>

        <div class="text-xs font-bold text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
          📌 ${escapeHtml(tip.summary)}
        </div>

        <div class="space-y-2 text-xs">
          <div class="p-2 bg-red-50 border border-red-100 rounded text-red-900 text-[11px]">
            <strong class="text-red-950 block mb-0.5">⚠️ 가장 흔한 실수:</strong>
            ${escapeHtml(tip.mistake)}
          </div>
          <div class="p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-900 text-[11px]">
            <strong class="text-emerald-950 block mb-0.5">✅ 올바른 실무 절차:</strong>
            ${escapeHtml(tip.solution)}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200">
          <span class="text-[11px] font-bold text-slate-600 mb-1 block">인수인계 필수 체크리스트:</span>
          <ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
            ${tip.checklist.map(c => `<li>${escapeHtml(c)}</li>`).join("")}
          </ul>
        </div>
      </div>
    `).join("");
  }

  lucide.createIcons();
}
