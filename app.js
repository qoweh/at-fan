const CHAT_THRESHOLD = 100000;
const SERVICE_FEE_RATE = 0.1;
const REQUIRED_CHAT_REPLIES = 3;

const tiers = {
  coffee: 5000,
  meal: 20000,
  chat: 100000,
  meet: 500000,
};

const tierLabels = {
  coffee: "커피",
  meal: "식사",
  chat: "채팅",
  meet: "만남",
};

const defaultChats = {
  woni: [
    { role: "artist", text: "후원 고마워요. 이번 데모는 가장 먼저 보내드릴게요." },
    { role: "fan", text: "새 EP도 계속 응원할게요." },
    { role: "artist", text: "다음 라이브 편곡도 곧 공유하겠습니다." },
  ],
};

const storyboard = {
  home: {
    eyebrow: "Storyboard 01",
    title: "팬이 인스타그램 ID만으로 후원장을 연다",
    body: "크리에이터가 아직 가입하지 않았더라도 팬은 검색으로 후원 페이지를 만들고 예치 후원을 시작합니다.",
    steps: [
      ["ID 검색", "팬이 알고 있는 인스타그램 ID를 입력합니다."],
      ["후원장 자동 생성", "미수령 계정도 즉시 프로필과 공개 피드가 생깁니다."],
      ["DM 알림", "누적 후원이 생기면 아티스트에게 수령 안내가 예약됩니다."],
    ],
  },
  sponsor: {
    eyebrow: "Storyboard 02",
    title: "후원자는 금액과 메시지를 정하고 예치한다",
    body: "PG 결제 전 단계의 MVP 화면입니다. 예치 금액, 10% 수수료, 아티스트 예상 수령액을 즉시 확인합니다.",
    steps: [
      ["티어 선택", "커피, 식사, 채팅, 만남 티어로 후원 의도를 빠르게 고릅니다."],
      ["직접 금액 조정", "1,000원부터 1,000,000원까지 후원금을 조정합니다."],
      ["상태 반영", "수령 계정은 즉시 수락, 미수령 계정은 아티스트 수락 대기로 표시됩니다."],
    ],
  },
  rewards: {
    eyebrow: "Storyboard 03",
    title: "수락된 후원은 전용 피드와 1:1 채팅으로 이어진다",
    body: "100,000원 이상 후원은 MVP 기준상 1:1 채팅 리워드가 열리고, 아티스트의 필수 응답 진행률을 추적합니다.",
    steps: [
      ["전용 피드", "수락된 후원자는 후원자 전용 콘텐츠를 볼 수 있습니다."],
      ["1:1 채팅", "팬과 아티스트가 같은 채팅방에서 메시지를 주고받습니다."],
      ["완료 처리", "필수 응답을 채우면 아티스트가 리워드 완료로 표시할 수 있습니다."],
    ],
  },
  artist: {
    eyebrow: "Storyboard 04",
    title: "아티스트는 수요를 보고 후원을 수락하거나 거절한다",
    body: "가입 전에도 누적 후원을 확인하고, 본인 인증 후 수령·채팅·전용 피드 운영을 시작합니다.",
    steps: [
      ["후원 요청 확인", "금액순으로 팬 메시지와 후원 상태를 봅니다."],
      ["수락/거절", "수락 시 리워드가 열리고 거절 시 환불 예정 상태가 됩니다."],
      ["계정 수령", "미수령 계정은 본인 인증 처리 후 정산 대상이 됩니다."],
    ],
  },
  settlement: {
    eyebrow: "Storyboard 05",
    title: "정산과 환불은 상태로 명확히 보인다",
    body: "월 1회 정산, 10% 수수료, 2개월 미수령 자동 환불, 수락 후 7일 리워드 취소 요청을 화면 상태로 관리합니다.",
    steps: [
      ["예치", "PG 예치금으로 보관된 후원금이 프로필에 누적됩니다."],
      ["정산", "수락·완료된 후원은 수수료 차감 후 정산 가능액에 반영됩니다."],
      ["환불/취소", "미수령 자동 환불과 리워드 취소 요청을 별도 상태로 표시합니다."],
    ],
  },
  ops: {
    eyebrow: "Storyboard 06",
    title: "출시 전 법무·정산·인프라 게이트를 통과한다",
    body: "지금은 프로토타입이므로 버튼만 열어두고, 실제 배포 전에는 백엔드·PG·사업자·세무·개인정보·인스타 API 검토가 완료되어야 합니다.",
    steps: [
      ["서비스 구조", "정적 MVP와 동적 운영 서버의 경계를 결정합니다."],
      ["권리·규제", "인스타 ID, 아티스트 명칭, 후원금 예치, 환불 정책을 검토합니다."],
      ["홈서버 배포", "Portainer Stack과 Nginx Proxy Manager 앞단 프록시 구조로 운영합니다."],
    ],
  },
};

const creators = [
  {
    id: "woni",
    name: "WONI",
    handle: "@woni_resc",
    category: "인디 뮤지션",
    initials: "W",
    visual: "music",
    accent: "#dfe9ff",
    claimed: true,
    verified: true,
    total: 4025000,
    backers: 6,
    bio: "작은 공연장에서 시작한 싱어송라이터. 팬 후원으로 새 EP 녹음과 라이브 세션을 준비하고 있습니다.",
    topDonors: [
      { name: "KpopStar88", amount: 2000000 },
      { name: "Anonymous Fan", amount: 1535000 },
      { name: "Bboy_Zero", amount: 490000 },
    ],
    feed: [
      {
        title: "새 데모 녹음",
        body: "후원자에게 먼저 공개되는 30초 데모와 작업 노트입니다.",
        media: "music",
        backerOnly: true,
      },
      {
        title: "연습실 라이브",
        body: "이번 주 라이브 편곡을 짧게 남겼습니다.",
        media: "dance",
        backerOnly: false,
      },
      {
        title: "앨범 커버 시안",
        body: "다음 싱글의 첫 번째 커버 방향입니다.",
        media: "illustrator",
        backerOnly: true,
      },
    ],
  },
  {
    id: "rescene",
    name: "rescene zena",
    handle: "@rescene.zena",
    category: "댄스 트레이니",
    initials: "Z",
    visual: "dance",
    accent: "#d9f2ed",
    claimed: false,
    verified: false,
    total: 980000,
    backers: 1,
    bio: "아직 계정을 수령하지 않은 크리에이터입니다. 팬의 선후원으로 후원장이 먼저 열렸습니다.",
    topDonors: [{ name: "Anonymous Fan", amount: 980000 }],
    feed: [
      {
        title: "응원 메시지",
        body: "수령 전까지 공개 응원 피드가 먼저 쌓입니다.",
        media: "dance",
        backerOnly: false,
      },
      {
        title: "수령 대기 리워드",
        body: "아티스트 인증 후 후원자 전용 콘텐츠가 열립니다.",
        media: "music",
        backerOnly: true,
      },
    ],
  },
  {
    id: "nari",
    name: "NARI",
    handle: "@nari.draws",
    category: "일러스트레이터",
    initials: "N",
    visual: "illustrator",
    accent: "#ffe7cf",
    claimed: true,
    verified: true,
    total: 1714000,
    backers: 9,
    bio: "팬아트와 독립 굿즈를 제작하는 일러스트레이터. 후원자는 러프 스케치와 제작기를 먼저 봅니다.",
    topDonors: [
      { name: "LineMaker", amount: 650000 },
      { name: "PeachTea", amount: 420000 },
      { name: "DotFan", amount: 250000 },
    ],
    feed: [
      {
        title: "러프 스케치",
        body: "후원자 투표로 고른 구도의 초안입니다.",
        media: "illustrator",
        backerOnly: true,
      },
      {
        title: "프린트 샘플",
        body: "주문 전 색감 테스트를 공유합니다.",
        media: "music",
        backerOnly: false,
      },
      {
        title: "작업실 기록",
        body: "이번 주 커미션 작업 타임랩스입니다.",
        media: "athlete",
        backerOnly: true,
      },
    ],
  },
  {
    id: "junho",
    name: "JUNHO",
    handle: "@junho.court",
    category: "대학생 운동선수",
    initials: "J",
    visual: "athlete",
    accent: "#e7eddc",
    claimed: true,
    verified: true,
    total: 2210000,
    backers: 4,
    bio: "시즌 훈련비와 원정 교통비를 팬 후원으로 모으는 대학 농구 선수입니다.",
    topDonors: [
      { name: "CourtSide", amount: 1000000 },
      { name: "BlueFan", amount: 620000 },
      { name: "Ari", amount: 350000 },
    ],
    feed: [
      {
        title: "훈련 로그",
        body: "이번 주 슈팅 루틴과 경기 전 컨디션 기록입니다.",
        media: "athlete",
        backerOnly: true,
      },
      {
        title: "경기 후 코멘트",
        body: "팬들에게 먼저 남기는 짧은 회고입니다.",
        media: "music",
        backerOnly: false,
      },
    ],
  },
];

const state = {
  selectedId: "woni",
  mode: "fan",
  story: "home",
  tab: "feed",
  amount: CHAT_THRESHOLD,
  tier: "chat",
  donations: loadDonations(),
  notifications: loadNotifications(),
  chatDraft: "",
  chats: loadChats(),
};

const els = {
  app: document.querySelector(".app"),
  creatorList: document.getElementById("creatorList"),
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("creatorSearch"),
  searchResults: document.getElementById("searchResults"),
  storyNav: document.getElementById("storyNav"),
  storyPanel: document.getElementById("storyPanel"),
  profileName: document.getElementById("profileName"),
  profileHandle: document.getElementById("profileHandle"),
  profileBio: document.getElementById("profileBio"),
  profileStatus: document.getElementById("profileStatus"),
  profileAvatar: document.getElementById("profileAvatar"),
  coverVisual: document.getElementById("coverVisual"),
  statsRow: document.getElementById("statsRow"),
  rewardStrip: document.getElementById("rewardStrip"),
  contentPanel: document.getElementById("contentPanel"),
  sponsorSummary: document.getElementById("sponsorSummary"),
  artistQueue: document.getElementById("artistQueue"),
  escrowTotal: document.getElementById("escrowTotal"),
  backerTotal: document.getElementById("backerTotal"),
  sponsorDialog: document.getElementById("sponsorDialog"),
  sponsorForm: document.getElementById("sponsorForm"),
  dialogTitle: document.getElementById("dialogTitle"),
  closeDialog: document.getElementById("closeDialog"),
  amountRange: document.getElementById("amountRange"),
  amountText: document.getElementById("amountText"),
  supporterName: document.getElementById("supporterName"),
  supportMessage: document.getElementById("supportMessage"),
  settlementPreview: document.getElementById("settlementPreview"),
  detailDialog: document.getElementById("detailDialog"),
  detailEyebrow: document.getElementById("detailEyebrow"),
  detailTitle: document.getElementById("detailTitle"),
  detailBody: document.getElementById("detailBody"),
  closeDetail: document.getElementById("closeDetail"),
  toast: document.getElementById("toast"),
};

function loadDonations() {
  try {
    const saved = JSON.parse(localStorage.getItem("atfan-donations") || "[]");
    if (Array.isArray(saved)) {
      return saved;
    }
  } catch {
    return [];
  }

  return [];
}

function saveDonations() {
  try {
    localStorage.setItem("atfan-donations", JSON.stringify(state.donations));
  } catch {
    // Some file:// browser contexts block localStorage. The in-memory state still works.
  }
}

function loadNotifications() {
  try {
    const saved = JSON.parse(localStorage.getItem("atfan-notifications") || "[]");
    if (Array.isArray(saved)) {
      return saved;
    }
  } catch {
    return [];
  }

  return [];
}

function saveNotifications() {
  try {
    localStorage.setItem("atfan-notifications", JSON.stringify(state.notifications));
  } catch {
    // The notification log is non-critical demo state.
  }
}

function cloneDefaultChats() {
  return Object.fromEntries(
    Object.entries(defaultChats).map(([creatorId, messages]) => [
      creatorId,
      messages.map((message) => ({ ...message })),
    ]),
  );
}

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem("atfan-chats") || "null");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      return {
        ...cloneDefaultChats(),
        ...saved,
      };
    }
  } catch {
    return cloneDefaultChats();
  }

  return cloneDefaultChats();
}

function saveChats() {
  try {
    localStorage.setItem("atfan-chats", JSON.stringify(state.chats));
  } catch {
    // Chat is still usable in-memory if localStorage is unavailable.
  }
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedCreator() {
  return creators.find((creator) => creator.id === state.selectedId) || creators[0];
}

function creatorDonations(creatorId) {
  return state.donations.filter((donation) => donation.creatorId === creatorId);
}

function creatorTotals(creator) {
  const donations = creatorDonations(creator.id);
  const activeDonations = donations.filter((donation) => !["declined", "refunded"].includes(donation.status));
  const pledged = activeDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const accepted = donations
    .filter((donation) => ["accepted", "completed"].includes(donation.status))
    .reduce((sum, donation) => sum + donation.amount, 0);

  return {
    pledged,
    accepted,
    total: creator.total + pledged,
    backers: creator.backers + activeDonations.length,
  };
}

function currentFanDonation(creatorId) {
  const donations = creatorDonations(creatorId);
  return donations[donations.length - 1] || null;
}

function latestDonationWhere(creatorId, predicate) {
  const donations = creatorDonations(creatorId).filter(predicate);
  return donations[donations.length - 1] || null;
}

function currentBackerDonation(creatorId) {
  return latestDonationWhere(creatorId, (donation) =>
    ["accepted", "completed"].includes(donation.status),
  );
}

function currentChatDonation(creatorId) {
  return latestDonationWhere(
    creatorId,
    (donation) =>
      ["accepted", "completed"].includes(donation.status) &&
      donation.amount >= CHAT_THRESHOLD,
  );
}

function hasBackerAccess(creatorId) {
  return Boolean(currentBackerDonation(creatorId));
}

function hasChatAccess(creatorId) {
  return Boolean(currentChatDonation(creatorId));
}

function getChatProgress(creatorId) {
  const messages = state.chats[creatorId] || [];
  const rawArtistReplies = messages.filter((message) => message.role === "artist").length;
  const artistReplies = Math.min(rawArtistReplies, REQUIRED_CHAT_REPLIES);
  const percent = Math.min(100, Math.round((rawArtistReplies / REQUIRED_CHAT_REPLIES) * 100));

  return {
    artistReplies,
    percent,
    done: rawArtistReplies >= REQUIRED_CHAT_REPLIES,
  };
}

function isSettledStatus(status) {
  return ["completed", "refunded", "declined"].includes(status);
}

function formatKRW(amount) {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

function formatCompactKRW(amount) {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  }

  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString("ko-KR")}만원`;
  }

  return formatKRW(amount);
}

function render() {
  const creator = selectedCreator();
  els.app.dataset.mode = state.mode;
  renderModeButtons();
  renderStoryNav();
  renderStoryPanel(creator);
  renderCreatorList();
  renderSearchResults();
  renderProfile(creator);
  renderStats(creator);
  renderRewards(creator);
  renderContent(creator);
  renderSponsorSummary(creator);
  renderArtistQueue();
  renderLedger();
  renderDialogPreview();
}

function renderStoryNav() {
  els.storyNav.querySelectorAll(".story-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.story === state.story);
  });
}

function renderStoryPanel(creator) {
  const story = storyboard[state.story] || storyboard.home;
  const donation = currentFanDonation(creator.id);
  const chatProgress = getChatProgress(creator.id);
  const totals = creatorTotals(creator);
  const opsActions =
    state.story === "ops"
      ? `
        <div class="action-grid">
          <article class="action-card">
            <strong>출시 전 게이트</strong>
            <p>아래 항목은 프로토타입 버튼입니다. 실제 운영 전 담당 전문가 검토와 계약이 필요합니다.</p>
            <div class="inline-actions">
              <button type="button" data-compliance-action="backend">동적 서버</button>
              <button type="button" data-compliance-action="instagram">인스타 ID</button>
              <button type="button" data-compliance-action="pg">PG/예치</button>
              <button type="button" data-compliance-action="tax">세금/정산</button>
              <button type="button" data-compliance-action="business">사업자/약관</button>
              <button type="button" data-compliance-action="home-server">홈서버</button>
            </div>
          </article>
          <article class="notice-card">
            <strong>현재 결정</strong>
            <p>배포 전까지 실제 결제, 실제 인스타 조회, 실제 아티스트 사칭 가능 화면은 비활성으로 두는 것이 안전합니다.</p>
          </article>
        </div>
      `
      : "";

  els.storyPanel.innerHTML = `
    <div class="story-header">
      <p class="eyebrow">${story.eyebrow}</p>
      <h2>${story.title}</h2>
      <p>${story.body}</p>
    </div>
    <div class="story-steps">
      ${story.steps
        .map(
          ([title, body], index) => `
            <article class="story-step">
              <span class="step-index">${index + 1}</span>
              <strong>${title}</strong>
              <p>${body}</p>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="action-grid">
      <article class="action-card">
        <strong>현재 선택 계정</strong>
        <p>${escapeHtml(creator.handle)} · ${creator.claimed ? "수령 계정" : "미수령 계정"} · ${formatKRW(totals.total)} 누적</p>
        <div class="inline-actions">
          <button type="button" data-quick-action="sponsor">후원 열기</button>
          <button type="button" data-quick-action="instagram">프로필 보기</button>
          <button type="button" data-quick-action="dm">DM 알림</button>
        </div>
      </article>
      <article class="action-card">
        <strong>내 리워드 상태</strong>
        <p>${donation ? `${statusLabel(donation.status)} · ${formatKRW(donation.amount)}` : "아직 이 계정에 예치한 후원이 없습니다."}</p>
        <div class="progress-bar" aria-label="필수 채팅 응답 진행률">
          <span style="width:${chatProgress.percent}%"></span>
        </div>
        <p>아티스트 응답 ${chatProgress.artistReplies}/${REQUIRED_CHAT_REPLIES}회</p>
      </article>
    </div>
    ${opsActions}
  `;
}

function renderModeButtons() {
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
}

function renderCreatorList() {
  els.creatorList.innerHTML = creators
    .map((creator) => {
      const totals = creatorTotals(creator);

      return `
        <button class="creator-card ${creator.id === state.selectedId ? "active" : ""}" type="button" data-creator="${creator.id}">
          <span class="mini-avatar" style="background:${creator.accent}">${escapeHtml(creator.initials)}</span>
          <span>
            <strong>${escapeHtml(creator.name)}</strong>
            <small>${escapeHtml(creator.handle)} · ${formatCompactKRW(totals.total)}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderSearchResults() {
  const value = els.searchInput.value.trim().toLowerCase();

  if (!value) {
    els.searchResults.hidden = true;
    els.searchResults.innerHTML = "";
    return;
  }

  const results = creators.filter((creator) => {
    return (
      creator.handle.toLowerCase().includes(value) ||
      creator.name.toLowerCase().includes(value.replace("@", ""))
    );
  });

  const list = results.length ? results : [makePreviewCreator(value)];

  els.searchResults.innerHTML = list
    .slice(0, 4)
    .map((creator) => {
      const transient = creator.transient ? "data-transient=\"true\"" : "";
      return `
        <button class="search-result" type="button" data-creator="${creator.id}" ${transient}>
          <span class="mini-avatar" style="background:${creator.accent}">${escapeHtml(creator.initials)}</span>
          <span>
            <strong>${escapeHtml(creator.name)}</strong>
            <small>${escapeHtml(creator.handle)} · ${escapeHtml(creator.category)}</small>
          </span>
          <small>${creator.claimed ? "수령" : "미수령"}</small>
        </button>
      `;
    })
    .join("");
  els.searchResults.hidden = false;
}

function renderProfile(creator) {
  els.profileName.textContent = creator.name;
  els.profileHandle.textContent = creator.handle;
  els.profileBio.textContent = creator.bio;
  els.profileAvatar.textContent = creator.initials;
  els.profileAvatar.style.background = creator.accent;
  els.coverVisual.className = `cover-visual visual-${creator.visual}`;
  els.profileStatus.textContent = creator.claimed ? "수령 계정" : "미수령 계정";
  els.profileStatus.classList.toggle("claimed", creator.claimed);
}

function renderStats(creator) {
  const totals = creatorTotals(creator);
  const available = Math.max(0, Math.round(totals.accepted * (1 - SERVICE_FEE_RATE)));

  els.statsRow.innerHTML = `
    <div class="stat">
      <span>누적 예치</span>
      <strong>${formatKRW(totals.total)}</strong>
    </div>
    <div class="stat">
      <span>후원자</span>
      <strong>${totals.backers}명</strong>
    </div>
    <div class="stat">
      <span>정산 가능</span>
      <strong>${formatKRW(available)}</strong>
    </div>
    <div class="stat">
      <span>수수료</span>
      <strong>${Math.round(SERVICE_FEE_RATE * 100)}%</strong>
    </div>
  `;
}

function renderRewards(creator) {
  const donation = currentFanDonation(creator.id);
  const backerActive = hasBackerAccess(creator.id);
  const chatActive = hasChatAccess(creator.id);
  const pending = donation && donation.status === "pending";
  const blocked = donation && ["declined", "refunded", "cancelRequested"].includes(donation.status);
  const pledgeState = donation ? (blocked ? "pending" : "active") : "";
  const pledgeText = donation ? `${statusLabel(donation.status)} · ${formatKRW(donation.amount)}` : "아직 예치 내역 없음";
  const feedText = backerActive
    ? donation.status === "completed"
      ? "리워드 완료"
      : "열림"
    : pending
      ? "아티스트 수락 대기"
      : blocked
        ? "잠김"
        : "수락 후 열림";
  const chatText = chatActive
    ? donation.status === "completed"
      ? "완료된 대화"
      : "열림"
    : pending
      ? "아티스트 수락 대기"
      : blocked
        ? "잠김"
        : "100,000원 이상 수락 후 열림";

  els.rewardStrip.innerHTML = `
    <article class="reward-item ${pledgeState}">
      <strong>후원 예치</strong>
      <p>${pledgeText}</p>
    </article>
    <article class="reward-item ${backerActive ? "active" : pending ? "pending" : ""}">
      <strong>후원자 전용 피드</strong>
      <p>${feedText}</p>
    </article>
    <article class="reward-item ${chatActive ? "active" : pending ? "pending" : ""}">
      <strong>1:1 채팅</strong>
      <p>${chatText}</p>
    </article>
  `;
}

function renderContent(creator) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === state.tab);
  });

  if (state.tab === "chat") {
    renderChat(creator);
    return;
  }

  if (state.tab === "backer" && !hasBackerAccess(creator.id)) {
    els.contentPanel.innerHTML = lockedMarkup(
      "후원 수락 대기",
      "아티스트가 예치 후원을 수락하면 전용 피드가 열립니다.",
    );
    return;
  }

  const posts = creator.feed.filter((post) => state.tab === "backer" || !post.backerOnly);

  els.contentPanel.innerHTML = `
    <div class="feed-grid">
      ${posts
        .map(
          (post) => `
            <article class="post-card">
              <div class="media-crop media-${post.media}"></div>
              <div>
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.body)}</p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderChat(creator) {
  if (!hasChatAccess(creator.id)) {
    els.contentPanel.innerHTML = lockedMarkup(
      "채팅 리워드 대기",
      "100,000원 이상 예치 후 아티스트가 수락하면 1:1 채팅이 열립니다.",
    );
    return;
  }

  const messages = state.chats[creator.id] || [
    { role: "artist", text: "후원 고마워요. 메시지로 먼저 인사드려요." },
  ];
  const progress = getChatProgress(creator.id);
  const donation = currentChatDonation(creator.id);
  const quickActions =
    state.mode === "artist"
      ? `
        <button type="button" data-chat-action="artist-thanks">감사 답장</button>
        <button type="button" data-chat-action="artist-schedule">일정 공유</button>
        <button type="button" data-chat-action="complete" ${progress.done && donation?.status !== "completed" ? "" : "disabled"}>리워드 완료</button>
      `
      : `
        <button type="button" data-chat-action="fan-nudge">응답 요청</button>
        <button type="button" data-chat-action="fan-cheer">응원 템플릿</button>
      `;

  els.contentPanel.innerHTML = `
    <div class="chat-shell">
      <div class="chat-status">
        <strong>필수 응답 ${progress.artistReplies}/${REQUIRED_CHAT_REPLIES}회</strong>
        <div class="progress-bar" aria-label="채팅 리워드 진행률"><span style="width:${progress.percent}%"></span></div>
        <div class="inline-actions">${quickActions}</div>
      </div>
      <div class="chat-log">
        ${messages
          .map(
            (message) => `
              <div class="message-card ${message.role}">
                ${escapeHtml(message.text)}
              </div>
            `,
          )
          .join("")}
      </div>
      <form class="chat-compose" id="chatForm">
        <input id="chatInput" type="text" value="${escapeHtml(state.chatDraft)}" aria-label="채팅 메시지" placeholder="${state.mode === "artist" ? "아티스트 답장 입력" : "팬 메시지 입력"}" />
        <button type="submit">전송</button>
      </form>
    </div>
  `;
}

function lockedMarkup(title, body) {
  return `
    <div class="locked-state">
      <div>
        <h3>${title}</h3>
        <p>${body}</p>
      </div>
    </div>
  `;
}

function renderSponsorSummary(creator) {
  const donation = currentFanDonation(creator.id);
  const donors = mergeDonors(creator);
  const actions = renderSupportActions(creator, donation);

  els.sponsorSummary.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">${state.mode === "artist" ? "Creator Desk" : "Support"}</p>
      <h2>${state.mode === "artist" ? "수령 대시보드" : "내 후원 상태"}</h2>
    </div>
    <div class="support-status">
      <div class="status-block">
        <span class="metric-label">${donation ? statusLabel(donation.status) : "미예치"}</span>
        <strong>${donation ? formatKRW(donation.amount) : "0원"}</strong>
        <small>${donation ? escapeHtml(donation.message) : "선택한 크리에이터에게 예치된 후원 없음"}</small>
      </div>
      ${actions}
    </div>
    <div>
      <h3>Top Donors</h3>
      <div class="donor-list">
        ${donors
          .slice(0, 3)
          .map(
            (donor, index) => `
              <div class="donor-row">
                <span class="rank">${index + 1}</span>
                <strong>${escapeHtml(donor.name)}</strong>
                <small>${formatKRW(donor.amount)}</small>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSupportActions(creator, donation) {
  const claimAction =
    state.mode === "artist" && !creator.claimed
      ? `<button class="text-action primary" type="button" data-support-action="claim">본인 인증 후 수령</button>`
      : "";

  if (!donation) {
    return `
      <div class="inline-actions">
        <button class="text-action primary" type="button" data-support-action="sponsor">후원 시작</button>
        ${claimAction}
      </div>
    `;
  }

  const fanActions =
    state.mode === "fan"
      ? `
        ${donation.status === "pending" ? `<button class="text-action danger" type="button" data-support-action="refund">예치 취소</button>` : ""}
        ${donation.status === "accepted" ? `<button class="text-action danger" type="button" data-support-action="cancel">리워드 취소 요청</button>` : ""}
        ${["accepted", "completed"].includes(donation.status) ? `<button class="text-action" type="button" data-support-action="settlement">정산 보기</button>` : ""}
      `
      : "";

  const artistActions =
    state.mode === "artist"
      ? `
        ${claimAction}
        ${donation.status === "accepted" ? `<button class="text-action primary" type="button" data-support-action="complete">리워드 완료</button>` : ""}
        ${donation.status === "cancelRequested" ? `<button class="text-action danger" type="button" data-support-action="approve-refund">환불 승인</button>` : ""}
        <button class="text-action" type="button" data-support-action="settlement">정산 보기</button>
      `
      : "";

  return `<div class="inline-actions">${fanActions}${artistActions}</div>`;
}

function renderArtistQueue() {
  const creator = selectedCreator();
  const queue = state.donations.filter(
    (donation) =>
      donation.creatorId === creator.id &&
      ["pending", "cancelRequested"].includes(donation.status),
  );
  const hasClaimTask = !creator.claimed;
  els.artistQueue.hidden = state.mode !== "artist";

  if (state.mode !== "artist") {
    els.artistQueue.innerHTML = "";
    return;
  }

  els.artistQueue.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Inbox</p>
      <h2>후원 요청</h2>
    </div>
    <div class="queue-list">
      ${
        hasClaimTask
          ? `
            <article class="queue-row">
              <strong>${escapeHtml(creator.name)} 계정 수령 대기</strong>
              <small>${escapeHtml(creator.handle)} 본인 인증 후 예치 후원 수령 가능</small>
              <footer>
                <button type="button" data-action="claim" data-creator="${creator.id}">수령 처리</button>
              </footer>
            </article>
          `
          : ""
      }
      ${
        queue.length
          ? queue
              .map((donation) => {
                const creator = creators.find((item) => item.id === donation.creatorId);
                const isCancel = donation.status === "cancelRequested";
                return `
                  <article class="queue-row">
                    <strong>${escapeHtml(creator?.name || "Unknown")} · ${statusLabel(donation.status)} · ${formatKRW(donation.amount)}</strong>
                    <small>${escapeHtml(donation.name)} · ${escapeHtml(donation.message)}</small>
                    <footer>
                      ${
                        isCancel
                          ? `<button type="button" data-action="approve-refund" data-donation="${donation.id}">환불 승인</button>`
                          : `<button type="button" data-action="accept" data-donation="${donation.id}">수락</button>
                             <button type="button" data-action="decline" data-donation="${donation.id}">거절</button>`
                      }
                    </footer>
                  </article>
                `;
              })
              .join("")
          : hasClaimTask
            ? ""
            : "<p class=\"bio\">대기 중인 후원 요청이 없습니다.</p>"
      }
    </div>
  `;
}

function renderLedger() {
  const totals = creators.reduce(
    (acc, creator) => {
      const creatorTotal = creatorTotals(creator);
      acc.escrow += creatorTotal.total;
      acc.backers += creatorTotal.backers;
      return acc;
    },
    { escrow: 0, backers: 0 },
  );

  els.escrowTotal.textContent = formatKRW(totals.escrow);
  els.backerTotal.textContent = `${totals.backers}명`;
}

function renderDialogPreview() {
  const amount = Number(els.amountRange.value);
  const creatorTake = Math.round(amount * (1 - SERVICE_FEE_RATE));
  const fee = amount - creatorTake;

  els.amountText.textContent = formatKRW(amount);
  els.settlementPreview.innerHTML = `
    <div>
      <span>아티스트 예상 수령</span>
      <strong>${formatKRW(creatorTake)}</strong>
    </div>
    <div>
      <span>플랫폼 수수료</span>
      <strong>${formatKRW(fee)}</strong>
    </div>
  `;
}

function mergeDonors(creator) {
  const newDonors = creatorDonations(creator.id)
    .filter((donation) => !["declined", "refunded"].includes(donation.status))
    .map((donation) => ({
      name: donation.name,
      amount: donation.amount,
    }));

  return [...creator.topDonors, ...newDonors].sort((a, b) => b.amount - a.amount);
}

function statusLabel(status) {
  const labels = {
    pending: "수락 대기",
    accepted: "수락 완료",
    declined: "거절됨",
    cancelRequested: "취소 요청",
    refunded: "환불 완료",
    completed: "리워드 완료",
  };

  return labels[status] || status;
}

function makePreviewCreator(value) {
  const handle = value.startsWith("@") ? value : `@${value}`;
  const id = handle.replace(/[^a-z0-9]/gi, "").toLowerCase() || "newcreator";
  const name = handle.replace("@", "") || "new.creator";

  return {
    id,
    name,
    handle,
    category: "미수령 계정",
    initials: name.slice(0, 1).toUpperCase() || "N",
    visual: "dance",
    accent: "#eee1ff",
    claimed: false,
    verified: false,
    transient: true,
    total: 0,
    backers: 0,
    bio: "팬 검색으로 새 후원장이 만들어진 미수령 크리에이터입니다.",
    topDonors: [],
    feed: [
      {
        title: "첫 응원 피드",
        body: "아티스트가 인증하면 후원 리워드가 연결됩니다.",
        media: "dance",
        backerOnly: false,
      },
    ],
  };
}

function addPreviewCreator(value) {
  const preview = makePreviewCreator(value);
  const existing = creators.find((creator) => creator.id === preview.id);

  if (existing) {
    return existing;
  }

  creators.unshift(preview);
  return preview;
}

function openSponsorDialog() {
  const creator = selectedCreator();
  els.dialogTitle.textContent = `${creator.name} 후원 예치`;
  els.sponsorDialog.showModal();
}

function openDetailDialog({ eyebrow, title, body }) {
  els.detailEyebrow.textContent = eyebrow;
  els.detailTitle.textContent = title;
  els.detailBody.innerHTML = body;
  els.detailDialog.showModal();
}

function openInstagramProfile() {
  const creator = selectedCreator();
  const totals = creatorTotals(creator);

  openDetailDialog({
    eyebrow: "Instagram Bridge",
    title: `${creator.handle} 프로필`,
    body: `
      <div class="profile-preview">
        <article>
          <span class="mini-avatar" style="background:${creator.accent}">${escapeHtml(creator.initials)}</span>
          <div>
            <strong>${escapeHtml(creator.name)}</strong>
            <small>${escapeHtml(creator.category)} · ${creator.claimed ? "수령 계정" : "미수령 계정"}</small>
          </div>
        </article>
      </div>
      <div class="timeline-list">
        <div class="timeline-item">
          <strong>후원장 상태</strong>
          <small>${formatKRW(totals.total)} 누적 · ${totals.backers}명 후원 · MVP에서는 실제 인스타 데이터 없이 팬 입력 ID와 후원 상태만 표시합니다.</small>
        </div>
        <div class="timeline-item">
          <strong>인스타 DM 연결</strong>
          <small>실서비스에서는 Meta API 승인 후 후원 발생 안내 DM을 발송합니다. MVP에서는 알림 로그로 기록합니다.</small>
        </div>
      </div>
      <div class="inline-actions">
        <button class="text-action primary" type="button" data-detail-action="sponsor">후원 예치</button>
        <button class="text-action" type="button" data-detail-action="copy-profile">프로필 링크 복사</button>
        <button class="text-action" type="button" data-detail-action="dm">DM 알림 작성</button>
      </div>
    `,
  });
}

function openDmDialog() {
  const creator = selectedCreator();
  const totals = creatorTotals(creator);
  const defaultMessage = `${creator.handle}님, @fan에서 ${formatKRW(totals.total)}의 팬 후원이 예치되었습니다. 본인 인증 후 수령할 수 있습니다.`;

  openDetailDialog({
    eyebrow: "DM Notice",
    title: `${creator.name}에게 안내 DM`,
    body: `
      <label class="field-label" for="dmMessage">발송 메시지</label>
      <textarea id="dmMessage" class="text-field" rows="5">${escapeHtml(defaultMessage)}</textarea>
      <div class="inline-actions">
        <button class="text-action primary" type="button" data-detail-action="send-dm">DM 알림 예약</button>
        <button class="text-action" type="button" data-detail-action="notification-log">알림 로그 보기</button>
      </div>
    `,
  });
}

function openSettlementDialog() {
  const creator = selectedCreator();
  const totals = creatorTotals(creator);
  const donations = creatorDonations(creator.id);
  const fee = Math.round(totals.accepted * SERVICE_FEE_RATE);
  const payout = Math.max(0, totals.accepted - fee);

  openDetailDialog({
    eyebrow: "Settlement",
    title: `${creator.name} 정산 흐름`,
    body: `
      <div class="settlement-preview">
        <div>
          <span>정산 대상</span>
          <strong>${formatKRW(totals.accepted)}</strong>
        </div>
        <div>
          <span>아티스트 예상 수령</span>
          <strong>${formatKRW(payout)}</strong>
        </div>
      </div>
      <div class="timeline-list">
        <div class="timeline-item">
          <strong>자금 경로</strong>
          <small>PG 예치금 보관 → DB 가상 계좌 상태 처리 → 월 1회 아티스트 계좌 송금</small>
        </div>
        <div class="timeline-item">
          <strong>환불 정책</strong>
          <small>미수령 2개월 자동 환불, 수락 후 리워드 불만족 시 7일 이내 취소 요청, 무분별한 취소는 팬 프로필에 카운트</small>
        </div>
        ${
          donations.length
            ? donations
                .map(
                  (donation) => `
                    <div class="timeline-item">
                      <strong>${statusLabel(donation.status)} · ${formatKRW(donation.amount)}</strong>
                      <small>${escapeHtml(donation.name)} · ${escapeHtml(donation.message)}</small>
                    </div>
                  `,
                )
                .join("")
            : `<div class="timeline-item"><strong>후원 없음</strong><small>아직 이 계정에 연결된 후원 상태가 없습니다.</small></div>`
        }
      </div>
    `,
  });
}

function openNotificationLog() {
  openDetailDialog({
    eyebrow: "Notification Log",
    title: "DM 알림 로그",
    body: `
      <div class="notification-list">
        ${
          state.notifications.length
            ? state.notifications
                .slice()
                .reverse()
                .map(
                  (item) => `
                    <div class="notification-item">
                      <strong>${escapeHtml(item.handle)} · ${item.status}</strong>
                      <small>${escapeHtml(item.message)}</small>
                    </div>
                  `,
                )
                .join("")
            : `<div class="notification-item"><strong>알림 없음</strong><small>아직 예약된 DM 알림이 없습니다.</small></div>`
        }
      </div>
    `,
  });
}

function reserveDmNotification(message) {
  const creator = selectedCreator();
  state.notifications.push({
    id: createId(),
    creatorId: creator.id,
    handle: creator.handle,
    message,
    status: "예약됨",
    createdAt: new Date().toISOString(),
  });
  saveNotifications();
  showToast(`${creator.handle} DM 알림이 예약되었습니다.`);
}

function openComplianceDialog(kind) {
  const details = {
    backend: {
      eyebrow: "Architecture Gate",
      title: "동적 서버 필요 여부",
      items: [
        ["현재", "정적 MVP는 화면 검증과 피칭용으로 충분합니다."],
        ["필요", "실제 회원, 결제, 채팅, 웹훅, 정산, 신고/차단, 감사로그가 들어가면 백엔드가 필요합니다."],
        ["보류", "지금은 결제/인스타/정산을 실제 연결하지 않고 버튼과 상태만 유지합니다."],
      ],
    },
    instagram: {
      eyebrow: "Identity Gate",
      title: "인스타 ID 기반 페이지 생성",
      items: [
        ["위험", "공개 ID라도 개인정보·식별표지·사칭·명예훼손·플랫폼 약관 이슈가 생길 수 있습니다."],
        ["MVP 안전장치", "미수령 계정에는 비공식/수령 대기 표시, 신고 버튼, 삭제 요청, 아티스트 인증 전 정산 차단이 필요합니다."],
        ["실서비스", "Meta 공식 API와 권한 범위, 사용자 동의, 데이터 보관 정책을 분리 검토해야 합니다."],
      ],
    },
    pg: {
      eyebrow: "Payment Gate",
      title: "PG/예치/정산",
      items: [
        ["핵심", "플랫폼이 대가 정산을 대행하거나 매개하면 PG 등록 또는 등록 PG/플랫폼 정산 서비스 활용 검토가 필요합니다."],
        ["안전한 방향", "초기에는 등록 PG사의 결제·에스크로·파트너 정산 기능을 활용하고 회사가 임의로 고객 돈을 보관하지 않습니다."],
        ["출시 전", "환불, 정산기한, 미정산자금 보호, 이상거래 모니터링을 약관과 운영정책에 명시합니다."],
      ],
    },
    tax: {
      eyebrow: "Tax Gate",
      title: "세금/정산",
      items: [
        ["사업자", "사업 개시 전 또는 개시 후 20일 이내 사업자등록 검토가 필요합니다."],
        ["수수료", "플랫폼 수수료 매출, 부가세, PG 수수료, 정산 지급명세를 회계상 분리합니다."],
        ["아티스트", "개인/개인사업자/법인 여부에 따라 원천징수·세금계산서·지급명세서 처리가 달라집니다."],
      ],
    },
    business: {
      eyebrow: "Commerce Gate",
      title: "사업자/약관/소비자 보호",
      items: [
        ["사업 형태", "개인사업자로 시작 가능하더라도 결제·정산 리스크와 투자/계약을 고려하면 법인 전환 시점을 정해야 합니다."],
        ["신고", "온라인으로 소비자와 거래하면 통신판매업 신고, 약관, 개인정보처리방침, 환불정책이 필요할 수 있습니다."],
        ["콘텐츠", "후원 리워드가 대가성인지, 기부인지, 콘텐츠 구매인지에 따라 표시와 환불 정책을 다르게 설계해야 합니다."],
      ],
    },
    "home-server": {
      eyebrow: "Deploy Gate",
      title: "Ubuntu 22 LTS / Intel / Portainer / NPM",
      items: [
        ["권장", "앱 컨테이너는 내부 포트만 열고, 외부 HTTPS/도메인은 Nginx Proxy Manager가 담당합니다."],
        ["Portainer", "compose 파일은 Stack으로 관리하고 GitHub repo를 원본 소스로 둡니다."],
        ["주의", "실제 결제/개인정보가 들어가면 홈서버 운영은 백업, 접근통제, 로그보존, 장애대응 기준이 필요합니다."],
      ],
    },
  };
  const selected = details[kind] || details.backend;

  openDetailDialog({
    eyebrow: selected.eyebrow,
    title: selected.title,
    body: `
      <div class="timeline-list">
        ${selected.items
          .map(
            ([title, body]) => `
              <div class="timeline-item">
                <strong>${title}</strong>
                <small>${body}</small>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="inline-actions">
        <button class="text-action" type="button" data-detail-action="settlement-doc">문서 기준으로 검토</button>
      </div>
    `,
  });
}

function handleDonationSubmit(event) {
  event.preventDefault();
  const creator = selectedCreator();
  const amount = Number(els.amountRange.value);
  const donation = {
    id: createId(),
    creatorId: creator.id,
    name: els.supporterName.value.trim() || "Anonymous Fan",
    amount,
    message: els.supportMessage.value.trim() || "응원합니다.",
    status: creator.claimed ? "accepted" : "pending",
    createdAt: new Date().toISOString(),
  };

  state.donations.push(donation);
  saveDonations();
  els.sponsorDialog.close();
  state.tab = amount >= CHAT_THRESHOLD && donation.status === "accepted" ? "chat" : "backer";
  showToast(
    donation.status === "accepted"
      ? `${creator.name} 후원이 수락 처리되었습니다.`
      : `${creator.name} 후원이 예치되었습니다. 아티스트 수락 대기 중입니다.`,
  );
  render();
}

function handleSupportAction(action) {
  const creator = selectedCreator();
  const donation = currentFanDonation(creator.id);

  if (action === "sponsor") {
    openSponsorDialog();
    return;
  }

  if (action === "claim") {
    creator.claimed = true;
    creator.bio = `${creator.name} 계정이 본인 인증을 마치고 후원금을 수령할 수 있는 상태입니다.`;
    creatorDonations(creator.id).forEach((item) => {
      if (item.status === "pending") {
        item.status = "accepted";
      }
    });
    saveDonations();
    showToast(`${creator.name} 계정을 수령 처리했습니다.`);
    render();
    return;
  }

  if (!donation) {
    showToast("먼저 후원 예치를 진행하세요.");
    return;
  }

  if (action === "refund") {
    donation.status = "refunded";
    donation.message = `${donation.message} · 예치 취소`;
    saveDonations();
    showToast("예치 후원을 취소하고 환불 완료로 표시했습니다.");
    render();
    return;
  }

  if (action === "cancel") {
    donation.status = "cancelRequested";
    saveDonations();
    showToast("리워드 취소 요청을 아티스트 큐로 보냈습니다.");
    render();
    return;
  }

  if (action === "approve-refund") {
    donation.status = "refunded";
    saveDonations();
    showToast("환불을 승인했습니다.");
    render();
    return;
  }

  if (action === "complete") {
    if (donation.amount >= CHAT_THRESHOLD) {
      const progress = getChatProgress(creator.id);
      if (!progress.done) {
        showToast(`아티스트 응답 ${REQUIRED_CHAT_REPLIES}회가 필요합니다.`);
        return;
      }
    }
    donation.status = "completed";
    saveDonations();
    showToast("리워드를 완료 처리했습니다.");
    render();
    return;
  }

  if (action === "settlement") {
    openSettlementDialog();
  }
}

function appendChatMessage(role, text) {
  const creator = selectedCreator();
  state.chats[creator.id] = state.chats[creator.id] || [];
  state.chats[creator.id].push({
    role,
    text,
    createdAt: new Date().toISOString(),
  });
  saveChats();
}

function handleChatAction(action) {
  const creator = selectedCreator();
  const donation = currentChatDonation(creator.id);

  if (!hasChatAccess(creator.id)) {
    showToast("채팅 리워드가 아직 열리지 않았습니다.");
    return;
  }

  if (action === "artist-thanks") {
    appendChatMessage("artist", "후원 정말 고마워요. 오늘 연습 후에 짧은 비하인드를 남길게요.");
  }

  if (action === "artist-schedule") {
    appendChatMessage("artist", "이번 주 금요일 밤에 후원자 전용 피드로 새 콘텐츠를 먼저 올릴게요.");
  }

  if (action === "fan-nudge") {
    appendChatMessage("fan", "가능할 때 짧게라도 답장 부탁드려요. 계속 응원하고 있어요.");
  }

  if (action === "fan-cheer") {
    appendChatMessage("fan", "오늘 활동도 잘 봤어요. 다음 콘텐츠도 기대할게요.");
  }

  if (action === "complete") {
    const progress = getChatProgress(creator.id);
    if (!progress.done) {
      showToast(`아티스트 응답 ${REQUIRED_CHAT_REPLIES}회가 필요합니다.`);
      return;
    }
    if (donation) {
      donation.status = "completed";
      saveDonations();
      showToast("채팅 리워드를 완료 처리했습니다.");
    }
  }

  render();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 3200);
}

function setAmountFromTier(tier) {
  state.tier = tier;
  state.amount = tiers[tier];
  els.amountRange.value = state.amount;
  renderDialogPreview();
}

els.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = els.searchInput.value.trim();

  if (!value) {
    return;
  }

  const normalized = value.toLowerCase();
  const found = creators.find((creator) => {
    return (
      creator.handle.toLowerCase() === normalized ||
      creator.handle.toLowerCase() === `@${normalized.replace("@", "")}` ||
      creator.name.toLowerCase() === normalized.replace("@", "")
    );
  });
  const creator = found || addPreviewCreator(value);

  state.selectedId = creator.id;
  state.tab = "feed";
  els.searchInput.value = creator.handle;
  els.searchResults.hidden = true;
  render();
});

els.searchInput.addEventListener("input", renderSearchResults);

els.searchResults.addEventListener("click", (event) => {
  const button = event.target.closest(".search-result");
  if (!button) {
    return;
  }

  const creator = button.dataset.transient
    ? addPreviewCreator(els.searchInput.value.trim())
    : creators.find((item) => item.id === button.dataset.creator);

  if (!creator) {
    return;
  }

  state.selectedId = creator.id;
  state.tab = "feed";
  els.searchInput.value = creator.handle;
  els.searchResults.hidden = true;
  render();
});

els.creatorList.addEventListener("click", (event) => {
  const button = event.target.closest(".creator-card");
  if (!button) {
    return;
  }

  state.selectedId = button.dataset.creator;
  state.tab = "feed";
  render();
});

document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  state.story = "home";
  state.tab = "feed";
  render();
});

els.storyNav.addEventListener("click", (event) => {
  const button = event.target.closest(".story-button");
  if (!button) {
    return;
  }

  state.story = button.dataset.story;
  if (state.story === "rewards") {
    state.tab = "backer";
  }
  if (state.story === "artist") {
    state.mode = "artist";
  }
  if (state.story === "sponsor") {
    state.mode = "fan";
  }
  render();
});

els.storyPanel.addEventListener("click", (event) => {
  const complianceButton = event.target.closest("[data-compliance-action]");
  if (complianceButton) {
    openComplianceDialog(complianceButton.dataset.complianceAction);
    return;
  }

  const button = event.target.closest("[data-quick-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.quickAction;
  if (action === "sponsor") {
    openSponsorDialog();
  }
  if (action === "instagram") {
    openInstagramProfile();
  }
  if (action === "dm") {
    openDmDialog();
  }
});

document.querySelector(".mode-switch").addEventListener("click", (event) => {
  const button = event.target.closest(".mode-button");
  if (!button) {
    return;
  }

  state.mode = button.dataset.mode;
  render();
});

document.querySelector(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest(".tab");
  if (!button) {
    return;
  }

  state.tab = button.dataset.tab;
  render();
});

document.getElementById("openSponsor").addEventListener("click", () => {
  state.story = "sponsor";
  openSponsorDialog();
  render();
});

document.getElementById("openInstagram").addEventListener("click", () => {
  openInstagramProfile();
});

document.getElementById("sendDm").addEventListener("click", () => {
  openDmDialog();
});

els.closeDialog.addEventListener("click", () => {
  els.sponsorDialog.close();
});

els.closeDetail.addEventListener("click", () => {
  els.detailDialog.close();
});

els.detailBody.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-detail-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.detailAction;
  if (action === "sponsor") {
    els.detailDialog.close();
    openSponsorDialog();
  }
  if (action === "dm") {
    openDmDialog();
  }
  if (action === "send-dm") {
    const textarea = document.getElementById("dmMessage");
    reserveDmNotification(textarea?.value.trim() || "후원 수령 안내");
    openNotificationLog();
  }
  if (action === "notification-log") {
    openNotificationLog();
  }
  if (action === "copy-profile") {
    const link = `${location.origin}${location.pathname}#${selectedCreator().handle.replace("@", "")}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("프로필 링크를 클립보드에 복사했습니다.");
    } catch {
      showToast(`프로필 링크: ${link}`);
    }
  }
  if (action === "settlement-doc") {
    showToast("docs/LEGAL_AND_OPERATIONS.md 문서에 검토 항목을 정리했습니다.");
  }
});

els.amountRange.addEventListener("input", () => {
  state.amount = Number(els.amountRange.value);
  renderDialogPreview();
});

els.sponsorForm.addEventListener("change", (event) => {
  if (event.target.name === "tier") {
    setAmountFromTier(event.target.value);
  }
});

els.sponsorForm.addEventListener("submit", handleDonationSubmit);

els.contentPanel.addEventListener("submit", (event) => {
  if (event.target.id !== "chatForm") {
    return;
  }

  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();

  if (!text) {
    return;
  }

  appendChatMessage(state.mode === "artist" ? "artist" : "fan", text);
  state.chatDraft = "";
  render();
});

els.contentPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chat-action]");
  if (!button) {
    return;
  }

  handleChatAction(button.dataset.chatAction);
});

els.sponsorSummary.addEventListener("click", (event) => {
  const button = event.target.closest("[data-support-action]");
  if (!button) {
    return;
  }

  handleSupportAction(button.dataset.supportAction);
});

els.artistQueue.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  if (button.dataset.action === "claim") {
    const creator = creators.find((item) => item.id === button.dataset.creator);
    if (creator) {
      state.selectedId = creator.id;
      handleSupportAction("claim");
    }
    return;
  }

  const donation = state.donations.find((item) => item.id === button.dataset.donation);
  if (!donation) {
    return;
  }

  if (button.dataset.action === "approve-refund") {
    donation.status = "refunded";
  } else {
    donation.status = button.dataset.action === "accept" ? "accepted" : "declined";
  }
  saveDonations();
  showToast(
    button.dataset.action === "accept"
      ? "후원을 수락했습니다."
      : button.dataset.action === "approve-refund"
        ? "환불을 승인했습니다."
        : "후원을 거절했습니다.",
  );
  render();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search")) {
    els.searchResults.hidden = true;
  }
});

render();
