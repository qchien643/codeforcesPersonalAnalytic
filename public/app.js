const form = document.querySelector("#analyze-form");
const input = document.querySelector("#handle-input");
const dashboard = document.querySelector("#dashboard");
const statusPanel = document.querySelector("#status-panel");
const statusText = document.querySelector("#status-text");
const floatingTooltip = document.querySelector("#floating-tooltip");
const manualGoalForm = document.querySelector("#manual-goal-form");
const manualGoalInput = document.querySelector("#manual-goal-input");
const manualGoalList = document.querySelector("#manual-goal-list");
const manualGoalOptions = document.querySelector("#manual-goal-options");
const manualGoalError = document.querySelector("#manual-goal-error");
const MIN_VISIBLE_WEAKNESS = 35;

function getAnalyzeHandleStatic() {
  return window.CfCodeforcesApi?.analyzeHandleStatic;
}

const CODEFORCES_TOPIC_MAP = new Map([
  ["implementation", "implementation"],
  ["math", "math"],
  ["brute force", "brute force"],
  ["greedy", "greedy"],
  ["constructive algorithms", "constructive"],
  ["binary search", "binary search"],
  ["sortings", "sorting"],
  ["two pointers", "two pointers"],
  ["dp", "dynamic programming"],
  ["graphs", "graphs"],
  ["dfs and similar", "graphs"],
  ["trees", "trees"],
  ["data structures", "data structures"],
  ["strings", "strings"],
  ["string suffix structures", "strings"],
  ["hashing", "strings"],
  ["number theory", "number theory"],
  ["combinatorics", "combinatorics"],
  ["probabilities", "probability"],
  ["geometry", "geometry"],
  ["dsu", "dsu/mst"],
  ["shortest paths", "shortest paths"],
  ["flows", "flows/matching"],
  ["graph matchings", "flows/matching"],
  ["games", "game theory"],
  ["bitmasks", "bitmasks"],
  ["divide and conquer", "divide and conquer"],
  ["ternary search", "search"],
  ["matrices", "math"],
  ["fft", "advanced math"],
  ["meet-in-the-middle", "advanced techniques"],
  ["schedules", "scheduling"]
]);

const MANUAL_TOPIC_ALIASES = new Map([
  ["xstk", "probability"],
  ["xac suat", "probability"],
  ["xác suất", "probability"],
  ["xac suat thong ke", "probability"],
  ["xác suất thống kê", "probability"],
  ["probabilities", "probability"],
  ["probability", "probability"],
  ["dp", "dynamic programming"],
  ["dynamic programming", "dynamic programming"],
  ["graph", "graphs"],
  ["graphs", "graphs"],
  ["tree", "trees"],
  ["trees", "trees"],
  ["ds", "data structures"],
  ["data structure", "data structures"],
  ["data structures", "data structures"],
  ["number theory", "number theory"],
  ["geometry", "geometry"],
  ["greedy", "greedy"],
  ["binary search", "binary search"],
  ["strings", "strings"],
  ["combinatorics", "combinatorics"]
]);

let manualGoalCatalog = new Map();
let lastAnalyzedHandle = null;
let lastDashboardData = null;

const COLORS = {
  accent: "#1f7a5c",
  accent2: "#c5533d",
  accent3: "#3d6f9f",
  muted: "#68736d",
  line: "#d9ddd5",
  fill: "#dceee8",
  warn: "#b76d21"
};

const STAGE_LABELS = {
  foundation: "Nền tảng",
  building: "Đang xây nền",
  consolidating: "Đang củng cố",
  "contest-ready": "Sẵn sàng thi đấu",
  advanced: "Nâng cao"
};

const RANK_LABELS = {
  newbie: "Người mới",
  pupil: "Học viên",
  specialist: "Chuyên viên",
  expert: "Chuyên gia",
  "candidate master": "Ứng viên cao thủ",
  master: "Cao thủ",
  "international master": "Cao thủ quốc tế",
  grandmaster: "Đại kiện tướng",
  "international grandmaster": "Đại kiện tướng quốc tế",
  "legendary grandmaster": "Đại kiện tướng huyền thoại",
  unrated: "Chưa có rating"
};

const INFO_TEXTS = {
  stage:
    "Giai đoạn học được phân loại bằng các mốc tổng quan.\nCông thức dạng luật:\n- Nếu số bài AC < 50 hoặc bài khó nhất < 1100: Nền tảng.\n- Nếu có nhiều bài 1800+: Nâng cao.\n- Nếu có nhiều chủ đề mạnh và luyện đều: Sẵn sàng thi đấu.\nHiểu đơn giản: hệ thống nhìn số bài đã AC, độ khó cao nhất, số chủ đề mạnh/yếu và mức độ luyện gần đây để mô tả bạn đang ở giai đoạn nào.",
  currentRating:
    "Điểm hiện tại lấy trực tiếp từ Codeforces user.info.\nNếu tài khoản chưa có rating, hệ thống ước lượng bằng độ khó trung vị của các bài AC gần đây.\nHiểu đơn giản: đây là mốc dùng để chọn bài vừa sức.",
  maxRating:
    "Điểm cao nhất lấy trực tiếp từ Codeforces user.info.\nChỉ số này giúp so sánh phong độ hiện tại với đỉnh trước đây.",
  solved:
    "Bài đã AC = số bài khác nhau có ít nhất một submission verdict OK.\nCông thức:\nuniqueSolved = count(unique problem where any verdict = OK)\nHiểu đơn giản: submit lại cùng một bài nhiều lần vẫn chỉ tính là 1 bài.",
  acRate:
    "Tỉ lệ AC đo hiệu quả submit.\nCông thức:\nAC rate = số submission OK / tổng số submission\nLưu ý: chỉ số này thấp không luôn xấu, vì luyện bài khó thường cần nhiều lần thử.",
  activeDays:
    "Ngày hoạt động 30 ngày = số ngày trong 30 ngày gần nhất có ít nhất một submission.\nCông thức:\nactiveDays30d = count(distinct date with submissions)\nHiểu đơn giản: đo độ đều đặn, không đo độ giỏi.",
  solvedToday:
    "Bài AC hôm nay = số bài khác nhau có verdict OK trong ngày hiện tại.\nCông thức:\nsolvedToday = count(unique problem solved where solvedAt is today)\nSubmit lại cùng một bài nhiều lần vẫn chỉ tính là 1 bài.",
  dataConfidence:
    "Độ tin cậy dữ liệu cho biết hệ thống có đủ lịch sử để đánh giá chưa.\nCông thức gần đúng:\nconfidence = 0.55 * submissionConfidence + 0.45 * solvedConfidence\nTrong đó mỗi phần tăng chậm theo log khi có nhiều submit/bài AC hơn.\nHiểu đơn giản: dữ liệu càng nhiều thì kết luận càng đáng tin.",
  activity:
    "Phần này trả lời nhanh hôm nay, tuần này, tháng này và tổng thể tài khoản đã làm bao nhiêu bài.\nBài đã làm = số bài khác nhau có verdict OK trong khoảng thời gian đang chọn.\nLần nộp = tổng số submission trong khoảng đó.\nMặc định hiển thị Hôm nay; lịch 12 tháng chỉ là phần phụ để xem thói quen dài hạn.",
  submissionTrend:
    "Dữ liệu được gom theo tuần.\nCông thức:\nacceptedWeek = số submission OK trong tuần\notherWeek = tổng submission không OK trong tuần\nHiểu đơn giản: giúp thấy khối lượng luyện và tỉ lệ thành công gần đây.",
  ratingHistory:
    "Lấy từ Codeforces user.rating.\nMỗi điểm là newRating sau một vòng thi.\nCông thức hiển thị:\ny = newRating, x = ngày contest\nDùng để xem xu hướng điểm dài hạn.",
  contestDelta:
    "Mỗi cột là mức tăng/giảm điểm sau một vòng thi.\nCông thức:\ndelta = newRating - oldRating\nCột dương là tăng điểm, cột âm là giảm điểm.",
  verdicts:
    "Đếm số submission theo từng verdict.\nCông thức:\ncount(verdict) = số submission có verdict đó\nNếu WA cao: có thể sai ý tưởng/edge case. Nếu TLE cao: có thể cần tối ưu độ phức tạp hoặc cài đặt.",
  buckets:
    "Bài được chia theo nhóm độ khó Codeforces: 800-999, 1000-1199, ...\nCông thức:\nsolved(bucket) = số bài AC trong nhóm\nattemptedUnsolved(bucket) = số bài đã thử nhưng chưa AC\nDùng để biết bạn đang phủ tốt ở độ khó nào.",
  topicMastery:
    "Bảng này liệt kê các chủ đề bạn đang nắm tốt nhất.\nĐiểm hiển thị là điểm mạnh tổng hợp từ 0-100: ưu tiên năng lực theo rating, bài khó đã AC, dự đoán bài mẫu, độ ổn định và độ tin cậy dữ liệu.\nHiểu đơn giản: một topic ít bài nhưng từng AC bài khó vẫn có thể được xếp cao, còn topic nhiều bài dễ sẽ không tự động đứng đầu.",
  topicWeakness:
    "Bảng này chỉ hiện các chủ đề có điểm cần cải thiện từ 35 trở lên.\nĐiểm càng cao thì càng nên ưu tiên: 35-49 là theo dõi, 50-69 là cần ôn, 70+ là rất cần ôn.\nCác topic dưới 35 được xem là củng cố nhẹ nên không còn xuất hiện ở bảng này.",
  topicSolvedAttempted:
    "Số bài đã AC so với số bài đã từng thử trong chủ đề này.\nChỉ số này cho biết kinh nghiệm trực tiếp của bạn với tag đó.\nTuy nhiên nó chưa nói hết năng lực, vì bài khó và bài dễ không nên được tính ngang nhau.",
  topicAbility:
    "Năng lực theo rating đo xem bạn đã chinh phục bài khó tới đâu trong chủ đề này.\nBài càng khó và càng đúng với tag này thì điểm càng tăng mạnh.\nNếu điểm này cao nhưng Độ ổn định thấp, nghĩa là bạn có khả năng giải bài khó nhưng còn hay sai khi cài đặt hoặc xử lý case.",
  topicAiAbility:
    "Dự đoán theo bài mẫu cho biết khả năng bạn AC các bài tương tự trong chủ đề này.\nHệ thống chọn một nhóm bài đại diện quanh mức hiện tại của bạn, rồi ước lượng khả năng AC trung bình.\nSố bài phía sau cho biết hệ thống đã dùng bao nhiêu bài mẫu để ước lượng.",
  topicStability:
    "Độ ổn định đo bạn giải chủ đề này có chắc tay không.\nNếu bạn thường AC sau ít lần sai, ít TLE và ít bài bỏ dở thì điểm cao.\nNếu bạn vẫn giải được bài khó nhưng hay WA/TLE nhiều lần, điểm này sẽ thấp hơn năng lực.",
  topicEvidence:
    "Độ tin cậy bằng chứng cho biết hệ thống đã có đủ dữ liệu về chủ đề này chưa.\nLàm nhiều bài, đặc biệt là bài có rating rõ ràng và đa dạng độ khó, sẽ tăng điểm này.\nNếu mới làm 1-2 bài dễ thì hệ thống sẽ dè dặt, không kết luận bạn đã rất mạnh ngay.",
  topicWeightedAc:
    "AC có trọng số độ khó giống tỉ lệ AC, nhưng bài khó có trọng lượng lớn hơn bài dễ.\nAC bài khó giúp điểm tăng nhiều hơn. Khi bạn thử bài khó chưa AC, hệ thống cũng giảm bớt mức phạt so với cách đếm tỉ lệ AC thường.",
  topicDifficulty:
    "Độ khó đã chinh phục đo mức bài khó nhất và nhóm bài khó mà bạn đã AC trong chủ đề này.\nĐiểm cao nghĩa là bạn không chỉ làm nhiều bài, mà đã xử lý được bài ở mức rating cao của tag đó.",
  topicEffectiveSolvedRating:
    "Rating hiệu dụng đã AC là khoảng độ khó sau khi chia mức ảnh hưởng cho từng tag.\nMột bài có nhiều tag sẽ không cộng nguyên độ khó cho tất cả tag. Tag nào thể hiện ý chính của bài sẽ nhận nhiều ảnh hưởng hơn tag phụ.",
  topicEffectiveCorpusRating:
    "Phổ rating hiệu dụng mô tả mặt bằng độ khó của toàn bộ kho bài trong tag này.\nMedian là mốc ở giữa: khoảng một nửa bài của tag thấp hơn mốc này và một nửa cao hơn.\nNếu median cao, tag đó vốn khó hơn, nên số bài AC ít không nhất thiết là yếu.",
  topicHardSolved:
    "Số bài rating 1800+ đã AC trong chủ đề này.\nĐây là tín hiệu mạnh cho năng lực, vì các bài 1800+ thường cần ý tưởng chắc hơn và cài đặt cẩn thận hơn.",
  weaknessMatrix:
    "Ma trận này cho biết bạn nên ôn chủ đề nào ở nhóm độ khó nào.\nMỗi ô chỉ hiện điểm rủi ro từ 0-100: điểm càng cao thì càng nên xem lại. Hover vào ô để xem số bài AC / số bài đã thử và lý do ngắn.\nÔ ít dữ liệu chỉ nên xem là gợi ý nhẹ, vì hệ thống chưa có đủ bài để kết luận chắc chắn.",
  learningPath:
    "Lộ trình chọn các chủ đề nên ưu tiên từ bảng Chủ đề cần cải thiện.\nCông thức ưu tiên gần đúng:\npriority = điểm cần cải thiện\nHệ thống chỉ đưa topic tự động vào lộ trình khi topic đó có điểm cần cải thiện từ 35 trở lên và có bài gợi ý phù hợp. Vì vậy lộ trình có thể ngắn hoặc rỗng nếu chưa có điểm yếu rõ ràng. Mục tiêu tự thêm vẫn được đưa vào như một ưu tiên riêng.",
  recommendations:
    "Danh sách này chọn bài từ hai nguồn: chủ đề cần cải thiện tự động và mục tiêu bạn tự thêm.\nĐiểm xếp bài xét mức khớp topic, độ khó so với trình hiện tại, bài đã từng thử hay chưa, độ phổ biến và khả năng AC ước lượng.\nHiểu đơn giản: bài được gợi ý vì nó giúp vá điểm yếu hoặc phục vụ mục tiêu bạn chọn, không phải vì nó nằm trong các chủ đề đang mạnh nhất.",
  attemptedUnsolved:
    "Danh sách các bài đã có submission nhưng chưa có verdict OK.\nCông thức:\nattemptedUnsolved = attempted && not solved\nĐây là backlog tốt để upsolve vì bạn đã từng chạm vào bài đó.",
  manualGoals:
    "Mục tiêu tự thêm là chủ đề bạn muốn ép hệ thống đưa vào lộ trình, dù dữ liệu hiện tại chưa xem đó là điểm yếu lớn nhất.\nBạn chỉ có thể chọn tag/chủ đề có trong kho bài Codeforces. Khi thêm mục tiêu hợp lệ, hệ thống sẽ ưu tiên chủ đề đó trong lộ trình học và danh sách bài nên luyện tiếp.\nNếu đã phân tích một handle, việc thêm/xóa mục tiêu sẽ tự cập nhật lại dashboard."
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const handle = input.value.trim();
  if (!handle) {
    setStatus("error", "Vui lòng nhập tên Codeforces.");
    return;
  }

  await analyze(handle);
});

manualGoalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = manualGoalInput.value.trim();
  if (!value) return;

  const goals = loadManualGoals();
  const resolved = resolveManualGoal(value);
  if (!resolved) {
    showManualGoalError(`Không tìm thấy tag hoặc chủ đề "${value}". Hãy chọn một mục trong danh sách gợi ý.`);
    return;
  }

  if (!goals.some((goal) => goal.topic === resolved.topic)) {
    goals.push({
      id: String(Date.now()),
      label: resolved.label,
      topic: resolved.topic,
      input: value
    });
    saveManualGoals(goals.slice(-8));
    scheduleManualGoalRefresh(`Đã thêm "${resolved.label}" vào mục tiêu luyện.`);
  } else {
    showManualGoalError(`"${resolved.label}" đã có trong danh sách mục tiêu.`);
  }
  manualGoalInput.value = "";
  renderManualGoals();
});

manualGoalList?.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-remove-goal]");
  if (!button) return;
  saveManualGoals(loadManualGoals().filter((goal) => goal.id !== button.dataset.removeGoal));
  renderManualGoals();
  scheduleManualGoalRefresh("Đã xóa mục tiêu và cập nhật lại lộ trình.");
});

dashboard.addEventListener("click", (event) => {
  const button = event.target.closest?.("[data-activity-range]");
  if (!button) return;
  const container = document.querySelector("#activity-heatmap");
  container.dataset.activeRange = button.dataset.activityRange || "today";
  if (lastDashboardData) renderActivitySummary(lastDashboardData);
});

input.value = localStorage.getItem("lastHandle") || "";
setupManualGoalCatalog();
saveManualGoals(loadManualGoals());
renderManualGoals();
hydrateInfoButtons();
setupFloatingTooltip();
renderEmptyDashboard();

async function analyze(handle) {
  const button = form.querySelector("button");
  button.disabled = true;
  dashboard.classList.remove("hidden");
  setStatus("loading", "Đang tải dữ liệu cá nhân từ Codeforces và đọc kho bài từ data.js...");

  try {
    const analyzeHandleStatic = getAnalyzeHandleStatic();
    if (typeof analyzeHandleStatic !== "function") {
      throw new Error("API phân tích chưa sẵn sàng.");
    }
    const payload = await analyzeHandleStatic(handle, { manualGoals: loadManualGoals() });
    localStorage.setItem("lastHandle", handle);
    lastAnalyzedHandle = payload.profile.handle || handle;
    renderDashboard(payload);
    setStatus("success", `Đã phân tích ${payload.profile.handle}. Cập nhật lúc ${formatDateTime(payload.generatedAt)}. ${dataSourceStatus(payload.dataSources)}`);
  } catch (error) {
    setStatus("error", error.message || "Không thể phân tích handle này.");
  } finally {
    button.disabled = false;
  }
}

function setStatus(type, message) {
  statusPanel.className = `status-panel ${type}`;
  statusText.textContent = message;
}

function loadManualGoals() {
  try {
    const parsed = JSON.parse(localStorage.getItem("manualGoals") || "[]");
    if (!Array.isArray(parsed)) return [];
    if (!manualGoalCatalog.size) return parsed;
    const cleaned = [];
    const seen = new Set();
    for (const goal of parsed) {
      const resolved = resolveManualGoal(goal.topic || goal.label || goal.input);
      if (!resolved || seen.has(resolved.topic)) continue;
      seen.add(resolved.topic);
      cleaned.push({
        id: goal.id || `${resolved.topic}-${cleaned.length}`,
        label: goal.label || resolved.label,
        topic: resolved.topic,
        input: goal.input || goal.label || resolved.label
      });
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveManualGoals(goals) {
  localStorage.setItem("manualGoals", JSON.stringify(goals));
}

function setupManualGoalCatalog() {
  manualGoalCatalog = buildManualGoalCatalog();
  if (!manualGoalOptions) return;

  const options = [...manualGoalCatalog.values()]
    .filter((item, index, all) => all.findIndex((other) => other.label === item.label) === index)
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 160)
    .map((item) => `<option value="${escapeHtml(item.label)}">${escapeHtml(item.topic === item.label ? "Codeforces tag" : `Quy về: ${item.topic}`)}</option>`)
    .join("");
  manualGoalOptions.innerHTML = options;
}

function buildManualGoalCatalog() {
  const catalog = new Map();
  const add = (label, topic, source = "topic") => {
    const cleanLabel = String(label || "").trim();
    const cleanTopic = String(topic || "").trim();
    if (!cleanLabel || !cleanTopic) return;
    catalog.set(normalizeGoalKey(cleanLabel), {
      label: cleanLabel,
      topic: cleanTopic,
      source
    });
  };

  for (const [alias, topic] of MANUAL_TOPIC_ALIASES) {
    add(alias, topic, "alias");
    add(topic, topic, "topic");
  }

  for (const problem of window.CF_LEARNING_PROBLEMSET?.problems || []) {
    for (const tag of problem.tags || []) {
      if (!tag || tag === "*special") continue;
      const topic = normalizeCodeforcesTopic(tag);
      add(tag, topic, "codeforces-tag");
      add(topic, topic, "topic");
    }
  }

  return catalog;
}

function resolveManualGoal(value) {
  const key = normalizeGoalKey(value);
  if (!key) return null;
  return manualGoalCatalog.get(key) || null;
}

function normalizeGoalKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeCodeforcesTopic(tag) {
  return CODEFORCES_TOPIC_MAP.get(String(tag || "").trim().toLowerCase()) || String(tag || "").trim().toLowerCase();
}

function showManualGoalError(message = "") {
  if (!manualGoalError) return;
  manualGoalError.textContent = message;
  manualGoalError.classList.toggle("visible", Boolean(message));
}

function scheduleManualGoalRefresh(message) {
  showManualGoalError("");
  const handle = lastAnalyzedHandle || input.value.trim();
  if (!handle) {
    setStatus("success", `${message} Nhập tên Codeforces rồi bấm Phân tích để áp dụng.`);
    return;
  }
  setStatus("loading", `${message} Đang cập nhật lại lộ trình và bài gợi ý...`);
  analyze(handle);
}

function renderManualGoals() {
  if (!manualGoalList) return;
  const goals = loadManualGoals();
  manualGoalList.innerHTML = goals.length
    ? goals
      .map((goal) => `
        <span class="goal-chip">
          ${escapeHtml(goal.label)}
          <small>${escapeHtml(goal.topic)}</small>
          <button type="button" aria-label="Xóa mục tiêu" data-remove-goal="${escapeHtml(goal.id)}">×</button>
        </span>
      `)
      .join("")
    : `<span class="empty">Chưa có mục tiêu tự thêm.</span>`;
}

function renderDashboard(data) {
  lastDashboardData = data;
  dashboard.classList.remove("hidden");
  document.querySelector("#activity-heatmap").dataset.activeRange = "today";
  renderProfile(data);
  renderKpis(data.summary);
  renderActivitySummary(data);
  renderSubmissionTrend(data.charts.submissionTrend);
  renderRatingHistory(data.charts.ratingHistory);
  renderContestDelta(data.charts.contestDeltas);
  renderVerdicts(data.charts.verdicts);
  renderBuckets(data.buckets);
  renderTopics(data.strengths?.length ? data.strengths : data.topics);
  renderWeakTopics(data.weaknesses?.length ? data.weaknesses : weakestTopics(data.topics));
  renderWeaknessMatrix(data.charts.weaknessMatrix);
  renderLearningPath(data.learningPath);
  renderRecommendations(data.recommendations);
  renderAttemptedUnsolved(data.attemptedUnsolved);
}

function renderProfile(data) {
  const avatar = document.querySelector("#avatar");
  avatar.src = data.profile.avatar || "";
  avatar.hidden = !data.profile.avatar;

  document.querySelector("#profile-handle").textContent = data.profile.handle;
  document.querySelector("#profile-rank").textContent = `Xếp hạng: ${rankLabel(data.profile.rank)} · Cao nhất: ${rankLabel(data.profile.maxRank)}`;
  document.querySelector("#learning-stage").textContent = stageLabel(data.summary.learningStage);
  document.querySelector("#learning-stage-reason").textContent = normalizeStageReason(data.summary.learningStageReason);
}

function renderKpis(summary) {
  const items = [
    ["Điểm hiện tại", summary.rating ?? "chưa có", "currentRating"],
    ["Điểm cao nhất", summary.maxRating ?? "chưa có", "maxRating"],
    ["Bài đã AC", formatNumber(summary.uniqueSolved), "solved"],
    ["Bài AC hôm nay", formatNumber(summary.solvedToday), "solvedToday"],
    ["Tỉ lệ AC", percent(summary.acRate), "acRate"],
    ["Ngày hoạt động 30 ngày", summary.activeDays30d, "activeDays"],
    ["Độ tin cậy dữ liệu", percent(summary.dataConfidence), "dataConfidence"]
  ];

  document.querySelector("#kpi-grid").innerHTML = items
    .map(([label, value, infoKey]) => `
      <article class="kpi-card">
        <span class="label label-with-info">${escapeHtml(label)} ${infoButton(infoKey)}</span>
        <strong>${escapeHtml(String(value))}</strong>
      </article>
    `)
    .join("");
}

function renderActivitySummary(data) {
  const activity = data.charts.activity || [];
  const container = document.querySelector("#activity-heatmap");
  const stats = buildActivityStats(activity, data.summary);
  const activeKey = container.dataset.activeRange || "today";
  const active = stats[activeKey] ? activeKey : "today";
  const item = stats[active];

  container.innerHTML = `
    <div class="activity-tabs" role="tablist" aria-label="Khoảng thời gian hoạt động">
      ${Object.values(stats)
        .map((stat) => `
          <button type="button" class="${stat.key === active ? "active" : ""}" data-activity-range="${stat.key}">
            ${escapeHtml(stat.label)}
          </button>
        `)
        .join("")}
    </div>
    <div class="activity-focus">
      <span class="label">${escapeHtml(item.caption)}</span>
      <strong>${formatNumber(item.accepted)}</strong>
      <span>${escapeHtml(item.acceptedLabel)}</span>
    </div>
    <div class="activity-metrics">
      <span><b>${formatNumber(item.submissions)}</b> lần nộp</span>
      <span><b>${formatNumber(item.activeDays)}</b> ngày hoạt động</span>
      <span><b>${item.acceptance}</b> tỉ lệ OK</span>
    </div>
    <details class="heatmap-toggle">
      <summary>Xem lịch 12 tháng</summary>
      <div class="heatmap">${heatmapMarkup(activity)}</div>
    </details>
  `;
}

function buildActivityStats(activity, summary) {
  const total = {
    accepted: summary.uniqueSolved || 0,
    okSubmissions: summary.okSubmissions || 0,
    submissions: summary.totalSubmissions || 0,
    activeDays: activity.filter((item) => item.total > 0).length
  };
  const todayStats = {
    accepted: summary.solvedToday || 0,
    okSubmissions: summary.okSubmissionsToday || 0,
    submissions: summary.submissionsToday || 0,
    activeDays: summary.submissionsToday ? 1 : 0
  };
  const weekStats = {
    accepted: summary.solvedThisWeek || 0,
    okSubmissions: summary.okSubmissionsThisWeek || 0,
    submissions: summary.submissionsThisWeek || 0,
    activeDays: summary.activeDaysThisWeek || 0
  };
  const monthStats = {
    accepted: summary.solvedThisMonth || 0,
    okSubmissions: summary.okSubmissionsThisMonth || 0,
    submissions: summary.submissionsThisMonth || 0,
    activeDays: summary.activeDaysThisMonth || 0
  };

  return {
    today: activityStat("today", "Hôm nay", "Hôm nay", todayStats, "bài AC hôm nay"),
    week: activityStat("week", "Tuần này", "Từ thứ Hai tuần này", weekStats, "bài AC tuần này"),
    month: activityStat("month", "Tháng này", "Từ đầu tháng này", monthStats, "bài AC tháng này"),
    all: activityStat("all", "Tổng thể", "Từ trước đến giờ", total, "bài đã AC")
  };
}

function activityStat(key, label, caption, values, acceptedLabel) {
  return {
    key,
    label,
    caption,
    accepted: values.accepted || 0,
    submissions: values.submissions || 0,
    activeDays: values.activeDays || 0,
    acceptedLabel,
    acceptance: values.submissions ? percent((values.okSubmissions || 0) / values.submissions) : "0%"
  };
}

function heatmapMarkup(activity) {
  const byDate = new Map(activity.map((item) => [item.date, item.total]));
  const today = new Date();
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 370);

  let max = 1;
  for (const value of byDate.values()) max = Math.max(max, value);

  const cells = [];
  const monthMarkers = [];
  for (let i = 0; i < 371; i += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    const value = byDate.get(key) || 0;
    if (date.getUTCDate() === 1 || i === 0) {
      monthMarkers.push({
        index: i,
        label: new Intl.DateTimeFormat("vi-VN", { month: "short" }).format(date)
      });
    }
    cells.push(`<span class="heat-cell" title="${key}: ${value} lần nộp" style="background:${heatColor(value, max)}"></span>`);
  }
  return `
    <div class="heatmap-months">
      ${monthMarkers
        .map((marker) => `<span style="grid-column:${Math.floor(marker.index / 7) + 1}">${escapeHtml(marker.label)}</span>`)
        .join("")}
    </div>
    <div class="heatmap-grid">${cells.join("")}</div>
    <div class="heatmap-footer">
      <span>Khoảng 12 tháng gần nhất</span>
      <span class="heatmap-legend">
        Ít
        <i style="background:#ece9df"></i>
        <i style="background:#cfe8dc"></i>
        <i style="background:#8cc7ad"></i>
        <i style="background:#479672"></i>
        <i style="background:#1f7a5c"></i>
        Nhiều
      </span>
    </div>
  `;
}

function renderSubmissionTrend(items) {
  const labels = items.map((item) => item.week.slice(5));
  const accepted = items.map((item) => item.accepted);
  const wrong = items.map((item) => item.wrong);
  document.querySelector("#submission-trend").innerHTML = stackedBarSvg(labels, [
    { name: "Đã AC", values: accepted, color: COLORS.accent },
    { name: "Chưa AC", values: wrong, color: COLORS.accent2 }
  ]);
}

function renderRatingHistory(items) {
  document.querySelector("#rating-history").innerHTML = ratingHistoryCard(items);
}

function renderContestDelta(items) {
  document.querySelector("#contest-delta").innerHTML = contestDeltaCard(items);
}

function renderVerdicts(items) {
  const labels = items.slice(0, 8).map((item) => compactVerdict(item.verdict));
  const values = items.slice(0, 8).map((item) => item.count);
  document.querySelector("#verdict-chart").innerHTML = horizontalBarSvg(labels, values, COLORS.accent2);
}

function renderBuckets(items) {
  const labels = items.map((item) => item.bucket);
  document.querySelector("#bucket-chart").innerHTML = stackedBarSvg(labels, [
    { name: "Đã AC", values: items.map((item) => item.solvedCount), color: COLORS.accent },
    { name: "Chưa AC", values: items.map((item) => item.attemptedUnsolvedCount), color: COLORS.warn }
  ]);
}

function renderTopics(topics = []) {
  const top = topics.slice(0, 10);
  document.querySelector("#topic-mastery").innerHTML = top.length
    ? top
      .map((topic) => {
        const score = topic.strengthScore ?? topic.masteryScore;
        return `
          <details class="topic-card">
            <summary class="topic-row">
              <strong>${escapeHtml(topic.topic)}</strong>
              <span class="bar-track"><span class="bar-fill" style="width:${score}%"></span></span>
              <span class="score">${score}</span>
            </summary>
            <div class="topic-detail-grid">
              ${topicMetric("Điểm mạnh tổng hợp", `${score}/100`, "topicMastery")}
              ${topicMetric("Điểm nắm chủ đề", `${topic.masteryScore}/100`, "topicMastery")}
              ${topicMetric("Đã AC / đã thử", `${topic.solvedCount}/${topic.attemptedCount}`, "topicSolvedAttempted")}
              ${topicMetric("Năng lực theo rating", `${topic.abilityScore}/100`, "topicAbility")}
              ${topic.modelAbilityScore !== undefined ? topicMetric("Dự đoán bài mẫu", `${topic.modelAbilityScore}/100 · ${topic.modelSampleSize} bài`, "topicAiAbility") : ""}
              ${topicMetric("Độ ổn định", `${topic.stabilityScore}/100`, "topicStability")}
              ${topicMetric("Độ tin cậy bằng chứng", `${topic.evidenceScore}/100`, "topicEvidence")}
              ${topicMetric("AC có trọng số độ khó", percent(topic.difficultyAdjustedAccuracy), "topicWeightedAc")}
              ${topicMetric("Độ khó đã chinh phục", `${topic.difficultyScore}/100`, "topicDifficulty")}
              ${topicMetric("Rating hiệu dụng đã AC", formatRatingRange(topic.minSolvedRating, topic.maxSolvedRating, topic.avgSolvedRating), "topicEffectiveSolvedRating")}
              ${topicMetric("Phổ rating hiệu dụng", formatRatingRange(topic.topicMinRating, topic.topicMaxRating, topic.topicMedianRating, "median"), "topicEffectiveCorpusRating")}
              ${topicMetric("Bài 1800+ đã AC", topic.hardSolvedCount || 0, "topicHardSolved")}
            </div>
            <p class="muted">${escapeHtml(topic.reason)}</p>
          </details>
        `;
      })
      .join("")
    : `<p class="empty">Chưa có đủ dữ liệu topic.</p>`;
}

function renderWeakTopics(topics = []) {
  const top = topics.filter((topic) => topic.weaknessScore >= MIN_VISIBLE_WEAKNESS).slice(0, 10);
  document.querySelector("#topic-weakness-list").innerHTML = top.length
    ? `
      ${top
      .map((topic) => `
          <details class="topic-card weakness-card">
            <summary class="topic-row">
              <strong>${escapeHtml(topic.topic)}</strong>
              <span class="bar-track"><span class="bar-fill weakness-fill" style="width:${topic.weaknessScore}%; background:${weaknessBarColor(topic.weaknessScore)}"></span></span>
              <span class="score weakness-score" style="color:${weaknessBarColor(topic.weaknessScore)}">${topic.weaknessScore}</span>
            </summary>
            <div class="topic-detail-grid">
              ${topicMetric("Mức ưu tiên", weaknessLevelLabel(topic.weaknessScore), "topicWeakness")}
              ${topicMetric("Điểm cần cải thiện", `${topic.weaknessScore}/100`, "topicWeakness")}
              ${topicMetric("Điểm nắm chủ đề", `${topic.masteryScore}/100`, "topicMastery")}
              ${topicMetric("Đã AC / đã thử", `${topic.solvedCount}/${topic.attemptedCount}`, "topicSolvedAttempted")}
              ${topicMetric("Bài đã thử chưa AC", topic.attemptedUnsolvedCount || 0, "attemptedUnsolved")}
              ${topicMetric("Năng lực theo rating", `${topic.abilityScore}/100`, "topicAbility")}
              ${topicMetric("Độ ổn định", `${topic.stabilityScore}/100`, "topicStability")}
              ${topicMetric("Độ tin cậy bằng chứng", `${topic.evidenceScore}/100`, "topicEvidence")}
              ${topicMetric("Lần AC gần nhất", formatDaysSince(topic.daysSinceLastSolved), "activity")}
            </div>
            <p class="muted">${escapeHtml(topic.reason)}</p>
          </details>
        `)
      .join("")}
      <p class="list-note">Bảng này đã ẩn các chủ đề dưới 35 điểm vì đó chỉ là mức củng cố nhẹ.</p>
    `
    : `<p class="empty">Không có chủ đề nào vượt ngưỡng cần cải thiện 35 điểm.</p>`;
}

function weakestTopics(topics = []) {
  return topics
    .filter((topic) => topic.weaknessScore >= MIN_VISIBLE_WEAKNESS)
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 10);
}

function weaknessLevelLabel(score) {
  if (score >= 70) return "rất cần ôn";
  if (score >= 50) return "cần ôn";
  if (score >= 35) return "theo dõi";
  return "củng cố nhẹ";
}

function weaknessBarColor(score) {
  if (score >= 70) return COLORS.accent2;
  if (score >= 50) return "#d07a42";
  if (score >= 35) return COLORS.warn;
  return COLORS.accent;
}

function topicMetric(label, value, infoKey) {
  return `
    <span class="topic-metric">
      <b>${escapeHtml(label)} ${infoButton(infoKey)}</b>
      ${escapeHtml(String(value))}
    </span>
  `;
}

function renderWeaknessMatrix(matrix) {
  const cellMap = new Map(matrix.cells.map((cell) => [`${cell.topic}:${cell.bucket}`, cell]));
  const rows = matrix.topics
    .map((topic) => `
      <tr>
        <td>${escapeHtml(topic)}</td>
        ${matrix.buckets
        .map((bucket) => {
          const cell = cellMap.get(`${topic}:${bucket}`) || { score: null, solved: 0, attempted: 0, label: "Chưa có dữ liệu", detail: "Bạn chưa thử bài nào ở ô này." };
          const tooltip = `${cell.label}. ${cell.detail || ""}`;
          return `
            <td class="matrix-cell ${cell.confidence === "thấp" ? "low-confidence" : ""}" data-tooltip="${escapeHtml(tooltip)}" style="background:${weaknessColor(cell.score)}">
              ${cell.attempted ? cell.score : "-"}
            </td>
          `;
        })
        .join("")}
      </tr>
    `)
    .join("");

  document.querySelector("#weakness-matrix").innerHTML = matrix.topics.length
    ? `
      <table class="matrix">
        <thead>
          <tr><th>Chủ đề</th>${matrix.buckets.map((bucket) => `<th>${escapeHtml(bucket)}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="matrix-legend">
        <span><b>0-29</b> ổn</span>
        <span><b>30-49</b> theo dõi</span>
        <span><b>50-69</b> cần ôn</span>
        <span><b>70+</b> rất cần ôn</span>
        <span><b>-</b> chưa thử</span>
        <span>Ô mờ: ít dữ liệu, hover để xem AC/thử.</span>
      </div>
    `
    : `<p class="empty">Chưa có đủ dữ liệu ma trận.</p>`;
}

function renderLearningPath(items) {
  document.querySelector("#learning-path").innerHTML = items.length
    ? items
      .map((item) => `
          <details class="path-item">
            <summary><h4>${item.order}. ${escapeHtml(item.topic)}</h4></summary>
            <p class="muted">${escapeHtml(item.reason)}</p>
            <div class="path-meta">
              <span class="pill">Ưu tiên ${item.priorityScore}</span>
              <span class="pill">Mục tiêu ${escapeHtml(item.targetBucket)}</span>
              <span class="pill">${item.targetProblemCount} bài</span>
              <span class="pill">${item.source === "manual" ? "tự thêm" : "tự động"}</span>
            </div>
            ${item.recommendations?.length ? `
              <div class="mini-problem-list">
                ${item.recommendations.map((problem) => `
                  <a href="${problem.url}" target="_blank" rel="noreferrer">
                    ${escapeHtml(problem.key)} · ${escapeHtml(problem.name)}
                    <span>Độ khó ${problem.rating} · Khả năng AC ${percent(problem.acProbability)}</span>
                  </a>
                `).join("")}
              </div>
            ` : ""}
          </details>
        `)
      .join("")
    : `<p class="empty">Chưa có lộ trình học.</p>`;
}

function renderRecommendations(items) {
  document.querySelector("#recommendations").innerHTML = items.length
    ? items
      .slice(0, 10)
      .map((problem) => `
          <article class="problem-item">
            <h4><a href="${problem.url}" target="_blank" rel="noreferrer">${escapeHtml(problem.key)} · ${escapeHtml(problem.name)}</a></h4>
            <p class="muted">${escapeHtml(problem.reason)}</p>
            <div class="problem-meta">
              <span class="pill ${problem.difficultyLevel === "stretch" ? "warn" : ""}">Mức: ${escapeHtml(problem.difficultyLabel)}</span>
              <span class="pill">Nguồn: ${problem.source === "manual" ? "tự thêm" : "tự động"}</span>
              <span class="pill">Khả năng AC ${percent(problem.acProbability)}</span>
              <span class="pill">Độ khó ${problem.rating}</span>
              <span class="pill">Độ phổ biến ${formatNumber(problem.solvedCount)} AC</span>
            </div>
          </article>
        `)
      .join("")
    : `<p class="empty">Chưa có bài gợi ý phù hợp.</p>`;
}

function renderAttemptedUnsolved(items) {
  document.querySelector("#attempted-unsolved").innerHTML = items.length
    ? `
      <table class="data-table">
        <thead>
          <tr>
            <th>Bài</th>
            <th>Độ khó</th>
            <th>Số lần thử</th>
            <th>Kết quả chính</th>
            <th>Lần thử gần nhất</th>
          </tr>
        </thead>
        <tbody>
          ${items
      .map((item) => `
              <tr>
                <td><a href="${item.url}" target="_blank" rel="noreferrer">${escapeHtml(item.key)} · ${escapeHtml(item.name)}</a></td>
                <td>${item.rating ?? "-"}</td>
                <td>${item.attempts}</td>
                <td>${escapeHtml(compactVerdict(item.mainVerdict))}</td>
                <td>${formatDate(item.lastTriedAt)}</td>
              </tr>
            `)
      .join("")}
        </tbody>
      </table>
    `
    : `<p class="empty">Không có bài đã thử nhưng chưa AC.</p>`;
}

function renderEmptyDashboard() {
  renderDashboard({
    generatedAt: null,
    profile: {
      handle: "Chưa có dữ liệu",
      avatar: "",
      rank: "unrated",
      maxRank: "unrated"
    },
    summary: {
      rating: null,
      maxRating: null,
      totalSubmissions: 0,
      okSubmissions: 0,
      uniqueSolved: 0,
      solvedToday: 0,
      solvedThisWeek: 0,
      solvedThisMonth: 0,
      submissionsToday: 0,
      submissionsThisWeek: 0,
      submissionsThisMonth: 0,
      okSubmissionsToday: 0,
      okSubmissionsThisWeek: 0,
      okSubmissionsThisMonth: 0,
      acRate: 0,
      activeDays30d: 0,
      activeDaysThisWeek: 0,
      activeDaysThisMonth: 0,
      dataConfidence: 0,
      learningStage: null,
      learningStageReason: "Nhập tên Codeforces để hệ thống phân tích giai đoạn học hiện tại."
    },
    charts: {
      activity: [],
      submissionTrend: [],
      ratingHistory: [],
      contestDeltas: [],
      verdicts: [],
      weaknessMatrix: { topics: [], buckets: [], cells: [] }
    },
    buckets: [],
    topics: [],
    weaknesses: [],
    strengths: [],
    learningPath: [],
    recommendations: [],
    attemptedUnsolved: []
  });
}

function hydrateInfoButtons() {
  for (const button of document.querySelectorAll(".info-button[data-info-key]")) {
    const text = INFO_TEXTS[button.dataset.infoKey] || "Chưa có mô tả thuật toán.";
    button.textContent = "!";
    button.setAttribute("aria-label", "Giải thích cách tính");
    button.setAttribute("data-tooltip", text);
    button.removeAttribute("title");
  }
}

function setupFloatingTooltip() {
  document.addEventListener("pointerover", (event) => {
    const trigger = event.target.closest?.("[data-tooltip]");
    if (!trigger || trigger.id === "floating-tooltip") return;
    showTooltip(trigger);
  });

  document.addEventListener("pointerout", (event) => {
    const trigger = event.target.closest?.("[data-tooltip]");
    if (!trigger || trigger.id === "floating-tooltip") return;
    hideTooltip();
  });

  document.addEventListener("focusin", (event) => {
    const trigger = event.target.closest?.("[data-tooltip]");
    if (!trigger || trigger.id === "floating-tooltip") return;
    showTooltip(trigger);
  });

  document.addEventListener("focusout", (event) => {
    const trigger = event.target.closest?.("[data-tooltip]");
    if (!trigger || trigger.id === "floating-tooltip") return;
    hideTooltip();
  });

  window.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize", hideTooltip);
}

function showTooltip(button) {
  if (!floatingTooltip) return;

  floatingTooltip.textContent = button.dataset.tooltip || "";
  floatingTooltip.classList.add("visible");

  const buttonRect = button.getBoundingClientRect();
  const tooltipRect = floatingTooltip.getBoundingClientRect();
  const gap = 10;
  const margin = 12;

  let left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
  left = clampNumber(left, margin, window.innerWidth - tooltipRect.width - margin);

  let top = buttonRect.bottom + gap;
  if (top + tooltipRect.height + margin > window.innerHeight) {
    top = buttonRect.top - tooltipRect.height - gap;
  }
  top = clampNumber(top, margin, window.innerHeight - tooltipRect.height - margin);

  floatingTooltip.style.left = `${left}px`;
  floatingTooltip.style.top = `${top}px`;
}

function hideTooltip() {
  if (!floatingTooltip) return;
  floatingTooltip.classList.remove("visible");
}

function infoButton(key) {
  const text = INFO_TEXTS[key] || "Chưa có mô tả thuật toán.";
  return `<button type="button" class="info-button" aria-label="Giải thích cách tính" data-info-key="${escapeHtml(key)}" data-tooltip="${escapeHtml(text)}">!</button>`;
}

function ratingHistoryCard(items) {
  if (!items.length) {
    return `
      <div class="chart-empty-state">
        <strong>Chưa có dữ liệu rating.</strong>
        <span>Codeforces chỉ có lịch sử điểm khi tài khoản tham gia vòng thi có tính rating.</span>
      </div>
    `;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const best = items.reduce((max, item) => (item.rating > max.rating ? item : max), items[0]);
  const delta = last.rating - first.rating;
  const recent = items.slice(-8);

  return `
    <div class="chart-summary">
      <div><span>Hiện tại</span><strong>${last.rating}</strong></div>
      <div><span>Cao nhất</span><strong>${best.rating}</strong></div>
      <div><span>Từ đầu</span><strong class="${delta >= 0 ? "positive" : "negative"}">${delta >= 0 ? "+" : ""}${delta}</strong></div>
      <div><span>Số vòng thi</span><strong>${items.length}</strong></div>
    </div>
    ${lineSvg(
      items.map((item) => ({
        label: formatDate(item.date),
        value: item.rating,
        detail: `${item.contestName || `Vòng thi ${item.contestId}`}\n${formatDate(item.date)} · rating ${item.rating} (${item.delta >= 0 ? "+" : ""}${item.delta})`
      })),
      { color: COLORS.accent3 }
    )}
    <div class="chart-note">Đường xanh là rating sau mỗi vòng thi. Nhìn độ dốc để biết giai đoạn tăng nhanh, đi ngang hoặc giảm.</div>
    <div class="mini-contest-list">
      ${recent
        .map((item) => `
          <span title="${escapeHtml(item.contestName || "")}">
            ${formatDate(item.date)}
            <strong class="${item.delta >= 0 ? "positive" : "negative"}">${item.delta >= 0 ? "+" : ""}${item.delta}</strong>
          </span>
        `)
        .join("")}
    </div>
  `;
}

function contestDeltaCard(items) {
  if (!items.length) {
    return `
      <div class="chart-empty-state">
        <strong>Chưa có vòng thi tính điểm.</strong>
        <span>Khi tài khoản có contest rating, biến động từng vòng sẽ hiện ở đây.</span>
      </div>
    `;
  }

  const gains = items.filter((item) => item.delta > 0).length;
  const losses = items.filter((item) => item.delta < 0).length;
  const totalDelta = items.reduce((sum, item) => sum + item.delta, 0);
  const best = items.reduce((max, item) => (item.delta > max.delta ? item : max), items[0]);
  const worst = items.reduce((min, item) => (item.delta < min.delta ? item : min), items[0]);

  return `
    <div class="chart-summary">
      <div><span>Tổng gần đây</span><strong class="${totalDelta >= 0 ? "positive" : "negative"}">${totalDelta >= 0 ? "+" : ""}${totalDelta}</strong></div>
      <div><span>Tăng điểm</span><strong>${gains}/${items.length}</strong></div>
      <div><span>Tốt nhất</span><strong class="positive">+${best.delta}</strong></div>
      <div><span>Thấp nhất</span><strong class="negative">${worst.delta}</strong></div>
    </div>
    ${deltaBarSvg(
      items.map((item) => ({
        label: item.label,
        value: item.delta,
        detail: `Vòng ${item.label}: ${item.delta >= 0 ? "+" : ""}${item.delta} điểm`
      }))
    )}
    <div class="chart-note">Cột xanh là tăng điểm, cột đỏ là giảm điểm. Đường ngang ở giữa là mốc không đổi.</div>
  `;
}

function lineSvg(points, options = {}) {
  if (!points.length) return `<p class="empty">Chưa có dữ liệu.</p>`;
  const width = 680;
  const height = 260;
  const paddingLeft = 54;
  const paddingRight = 26;
  const paddingTop = 26;
  const paddingBottom = 46;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const yMin = Math.floor(min / 100) * 100;
  const yMax = Math.ceil(max / 100) * 100;
  const ySpan = yMax - yMin || 1;
  const x = (index) => paddingLeft + (index * plotWidth) / Math.max(1, points.length - 1);
  const y = (value) => paddingTop + (1 - (value - yMin) / ySpan) * plotHeight;
  const d = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.value)}`).join(" ");
  const gridValues = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const area = `${d} L ${x(points.length - 1)} ${paddingTop + plotHeight} L ${x(0)} ${paddingTop + plotHeight} Z`;
  const pointDots = points
    .map((point, index) => `<circle cx="${x(index)}" cy="${y(point.value)}" r="${index === points.length - 1 ? 4 : 2.5}" fill="${options.color || COLORS.accent}"><title>${escapeSvg(point.detail || `${point.label}: ${point.value}`)}</title></circle>`)
    .join("");
  const first = points[0];
  const last = points[points.length - 1];

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img">
      <rect x="${paddingLeft}" y="${paddingTop}" width="${plotWidth}" height="${plotHeight}" fill="#fffefa" stroke="${COLORS.line}" rx="6" />
      ${gridValues
        .map((value) => `
          <line x1="${paddingLeft}" y1="${y(value)}" x2="${width - paddingRight}" y2="${y(value)}" stroke="${COLORS.line}" stroke-dasharray="3 5" />
          <text x="12" y="${y(value) + 4}" fill="${COLORS.muted}" font-size="12">${value}</text>
        `)
        .join("")}
      <path d="${area}" fill="${options.color || COLORS.accent}" opacity="0.08" />
      <path d="${d}" fill="none" stroke="${options.color || COLORS.accent}" stroke-width="3" />
      ${pointDots}
      <text x="${paddingLeft}" y="${height - 16}" fill="${COLORS.muted}" font-size="12">${escapeSvg(first.label)}</text>
      <text x="${width - paddingRight}" y="${height - 16}" fill="${COLORS.muted}" font-size="12" text-anchor="end">${escapeSvg(last.label)}</text>
      <text x="${x(points.length - 1) - 8}" y="${y(last.value) - 10}" fill="${options.color || COLORS.accent}" font-size="12" text-anchor="end">${last.value}</text>
    </svg>
  `;
}

function horizontalBarSvg(labels, values, color) {
  if (!values.length) return `<p class="empty">Chưa có dữ liệu.</p>`;
  const width = 680;
  const rowHeight = 28;
  const height = Math.max(220, values.length * rowHeight + 36);
  const left = 150;
  const max = Math.max(1, ...values);

  const rows = values
    .map((value, index) => {
      const barWidth = ((width - left - 50) * value) / max;
      const y = 24 + index * rowHeight;
      return `
        <text x="0" y="${y + 14}" fill="${COLORS.muted}" font-size="12">${escapeSvg(labels[index])}</text>
        <rect x="${left}" y="${y}" width="${barWidth}" height="16" rx="4" fill="${color}" />
        <text x="${left + barWidth + 6}" y="${y + 13}" fill="${COLORS.muted}" font-size="12">${value}</text>
      `;
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" role="img">${rows}</svg>`;
}

function stackedBarSvg(labels, series) {
  if (!labels.length) return `<p class="empty">Chưa có dữ liệu.</p>`;
  const width = 680;
  const height = 250;
  const padding = 34;
  const barGap = 8;
  const totals = labels.map((_, index) => series.reduce((sum, item) => sum + (item.values[index] || 0), 0));
  const max = Math.max(1, ...totals);
  const barWidth = Math.max(8, (width - padding * 2 - barGap * (labels.length - 1)) / labels.length);

  const bars = labels
    .map((label, index) => {
      let yCursor = height - padding;
      const x = padding + index * (barWidth + barGap);
      const stacks = series
        .map((item) => {
          const value = item.values[index] || 0;
          const h = ((height - padding * 2) * value) / max;
          yCursor -= h;
          return `<rect x="${x}" y="${yCursor}" width="${barWidth}" height="${h}" fill="${item.color}" rx="2" />`;
        })
        .join("");
      const showLabel = index % Math.ceil(labels.length / 8) === 0;
      return `
        ${stacks}
        ${showLabel ? `<text x="${x}" y="${height - 8}" fill="${COLORS.muted}" font-size="10" transform="rotate(0 ${x} ${height - 8})">${escapeSvg(label)}</text>` : ""}
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="${COLORS.line}" />
      ${bars}
      <text x="${padding}" y="18" fill="${COLORS.muted}" font-size="12">${max}</text>
    </svg>
  `;
}

function deltaBarSvg(items) {
  if (!items.length) return `<p class="empty">Chưa có vòng thi tính điểm.</p>`;
  const width = 680;
  const height = 260;
  const paddingLeft = 54;
  const paddingRight = 26;
  const paddingTop = 28;
  const paddingBottom = 48;
  const maxAbs = Math.max(1, ...items.map((item) => Math.abs(item.value)));
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const zeroY = paddingTop + plotHeight / 2;
  const barGap = 7;
  const barWidth = Math.max(9, (plotWidth - barGap * (items.length - 1)) / items.length);

  const bars = items
    .map((item, index) => {
      const h = ((plotHeight / 2) * Math.abs(item.value)) / maxAbs;
      const x = paddingLeft + index * (barWidth + barGap);
      const y = item.value >= 0 ? zeroY - h : zeroY;
      const color = item.value >= 0 ? COLORS.accent : COLORS.accent2;
      const showLabel = index % Math.ceil(items.length / 8) === 0;
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(2, h)}" rx="3" fill="${color}">
          <title>${escapeSvg(item.detail || `${item.label}: ${item.value}`)}</title>
        </rect>
        ${showLabel ? `<text x="${x + barWidth / 2}" y="${height - 18}" fill="${COLORS.muted}" font-size="10" text-anchor="middle">${escapeSvg(item.label)}</text>` : ""}
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img">
      <rect x="${paddingLeft}" y="${paddingTop}" width="${plotWidth}" height="${plotHeight}" fill="#fffefa" stroke="${COLORS.line}" rx="6" />
      <line x1="${paddingLeft}" y1="${zeroY}" x2="${width - paddingRight}" y2="${zeroY}" stroke="${COLORS.line}" stroke-width="1.5" />
      <line x1="${paddingLeft}" y1="${paddingTop}" x2="${width - paddingRight}" y2="${paddingTop}" stroke="${COLORS.line}" stroke-dasharray="3 5" />
      <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="${COLORS.line}" stroke-dasharray="3 5" />
      ${bars}
      <text x="12" y="${paddingTop + 4}" fill="${COLORS.muted}" font-size="12">+${maxAbs}</text>
      <text x="12" y="${zeroY + 4}" fill="${COLORS.muted}" font-size="12">0</text>
      <text x="12" y="${height - paddingBottom + 4}" fill="${COLORS.muted}" font-size="12">-${maxAbs}</text>
    </svg>
  `;
}

function heatColor(value, max) {
  if (!value) return "#ece9df";
  const ratio = value / max;
  if (ratio < 0.25) return "#cfe8dc";
  if (ratio < 0.5) return "#8cc7ad";
  if (ratio < 0.75) return "#479672";
  return "#1f7a5c";
}

function weaknessColor(value) {
  if (!value) return "#fffdf8";
  const ratio = value / 100;
  if (ratio < 0.25) return "#e1f0e9";
  if (ratio < 0.5) return "#f0e6c9";
  if (ratio < 0.75) return "#ecc6b7";
  return "#dfa49d";
}

function compactVerdict(verdict) {
  const value = String(verdict || "UNKNOWN");
  const map = {
    OK: "AC",
    WRONG_ANSWER: "Sai đáp án",
    TIME_LIMIT_EXCEEDED: "Quá thời gian",
    MEMORY_LIMIT_EXCEEDED: "Quá bộ nhớ",
    RUNTIME_ERROR: "Lỗi runtime",
    COMPILATION_ERROR: "Lỗi biên dịch",
    PRESENTATION_ERROR: "Lỗi trình bày",
    IDLENESS_LIMIT_EXCEEDED: "Quá thời gian chờ",
    CHALLENGED: "Bị hack",
    SKIPPED: "Bị bỏ qua",
    UNKNOWN: "Không rõ"
  };
  return map[value] || value.replaceAll("_", " ");
}

function percent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function formatRatingRange(min, max, center = null, centerLabel = "TB") {
  if (!min && !max && !center) return "-";
  const range = min && max ? `${min}-${max}` : String(min || max || "-");
  return center ? `${range} · ${centerLabel} ${center}` : range;
}

function formatDaysSince(days) {
  if (!Number.isFinite(days)) return "chưa có";
  if (days <= 0) return "hôm nay";
  if (days === 1) return "1 ngày trước";
  if (days >= 365) return "chưa AC gần đây";
  return `${days} ngày trước`;
}

function formatDate(input) {
  if (!input) return "-";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(input));
}

function formatDateTime(input) {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(input));
}

function stageLabel(stage) {
  return STAGE_LABELS[stage] || stage || "Chưa xác định";
}

function rankLabel(rank) {
  return RANK_LABELS[rank] || rank || "Chưa có rating";
}

function normalizeStageReason(reason) {
  const map = new Map([
    ["Da vuot nen tang nhung con mot so topic/bucket can gia co.", "Đã vượt mức nền tảng nhưng còn một số chủ đề hoặc nhóm độ khó cần củng cố."],
    ["Dang mo rong coverage va xay topic core.", "Đang mở rộng độ phủ và xây chắc các chủ đề trọng tâm."],
    ["So bai AC hoac do kho cao nhat con o muc nen tang.", "Số bài AC hoặc độ khó cao nhất vẫn đang ở mức nền tảng."],
    ["Da co coverage dang ke o nhom bai 1800+.", "Đã có độ phủ đáng kể ở nhóm bài 1800+."],
    ["Coverage tot o nhieu topic va van dang hoat dong deu.", "Độ phủ tốt ở nhiều chủ đề và vẫn đang luyện đều."]
  ]);
  return map.get(reason) || reason || "Chưa có đủ dữ liệu để kết luận.";
}

function dataSourceStatus(dataSources) {
  const resources = Object.values(dataSources?.resources || {});
  if (!resources.length) return "";

  const networkCount = resources.filter((item) => item.source === "network").length;
  const parts = [];

  if (networkCount) {
    parts.push("dữ liệu cá nhân vừa tải từ Codeforces");
  }

  if (resources.some((item) => item.source === "data.js")) {
    parts.push("kho bài đọc từ data.js");
  }

  return parts.join("; ") + ".";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeSvg(value) {
  return escapeHtml(value);
}
