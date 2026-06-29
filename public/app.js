const form = document.querySelector("#analyze-form");
const input = document.querySelector("#handle-input");
const dashboard = document.querySelector("#dashboard");
const statusPanel = document.querySelector("#status-panel");
const statusText = document.querySelector("#status-text");
const floatingTooltip = document.querySelector("#floating-tooltip");

function getAnalyzeHandleStatic() {
  return window.CfCodeforcesApi?.analyzeHandleStatic;
}

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
  dataConfidence:
    "Độ tin cậy dữ liệu cho biết hệ thống có đủ lịch sử để đánh giá chưa.\nCông thức gần đúng:\nconfidence = 0.55 * submissionConfidence + 0.45 * solvedConfidence\nTrong đó mỗi phần tăng chậm theo log khi có nhiều submit/bài AC hơn.\nHiểu đơn giản: dữ liệu càng nhiều thì kết luận càng đáng tin.",
  activity:
    "Mỗi ô là một ngày.\nCông thức:\nvalue(day) = số submission trong ngày đó\nMàu càng đậm nghĩa là ngày đó nộp càng nhiều.\nDùng để nhìn thói quen luyện tập có đều hay không.",
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
    "Điểm nắm chủ đề từ 0-100.\nCông thức :\nmastery = 100 * (0.40*coverage + 0.25*accuracy + 0.20*recency + 0.15*recovery)\ncoverage: đã AC đủ nhiều chưa.\naccuracy: tỉ lệ AC đã làm mượt.\nrecency: gần đây còn luyện không.\nrecovery: từng fail rồi sửa được không.\nHiểu đơn giản: chủ đề mạnh là chủ đề bạn giải được, giải ổn, còn luyện gần đây và biết sửa lỗi.",
  weaknessMatrix:
    "Mỗi ô là mức rủi ro yếu của một chủ đề trong một nhóm độ khó.\nCông thức ô:\nscore = 100 * (1 - (solved + 1) / (attempted + 2))\nĐiểm càng cao nghĩa là đã thử nhiều nhưng AC ít hơn.\nDùng để thấy rõ kiểu: không chỉ 'DP yếu', mà 'DP ở 1200-1399 yếu'.",
  learningPath:
    "Lộ trình chọn các chủ đề nên ưu tiên.\nCông thức ưu tiên gần đúng:\npriority = weaknessScore\nHiện  chọn các chủ đề có điểm yếu cao nhất, sau đó gắn mục tiêu số bài và nhóm độ khó phù hợp.\nHiểu đơn giản: hệ thống kéo những lỗ hổng rõ nhất lên trước.",
  recommendations:
    "Điểm gợi ý bài kết hợp nhiều yếu tố.\nCông thức:\nscore = 0.35*topicFit + 0.30*difficultyFit + 0.15*quality + 0.10*novelty + 0.10*diversity\nDịch đơn giản: bài được ưu tiên nếu khớp chủ đề đang yếu, vừa sức, nhiều người đã AC, không quá trùng lặp và chưa bị bạn thử quá gần đây.",
  attemptedUnsolved:
    "Danh sách các bài đã có submission nhưng chưa có verdict OK.\nCông thức:\nattemptedUnsolved = attempted && not solved\nĐây là backlog tốt để upsolve vì bạn đã từng chạm vào bài đó."
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

input.value = localStorage.getItem("lastHandle") || "";
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
    const payload = await analyzeHandleStatic(handle);
    localStorage.setItem("lastHandle", handle);
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

function renderDashboard(data) {
  dashboard.classList.remove("hidden");
  renderProfile(data);
  renderKpis(data.summary);
  renderHeatmap(data.charts.activity);
  renderSubmissionTrend(data.charts.submissionTrend);
  renderRatingHistory(data.charts.ratingHistory);
  renderContestDelta(data.charts.contestDeltas);
  renderVerdicts(data.charts.verdicts);
  renderBuckets(data.buckets);
  renderTopics(data.topics);
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

function renderHeatmap(activity) {
  const container = document.querySelector("#activity-heatmap");
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
  container.innerHTML = `
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

function renderTopics(topics) {
  const top = topics.slice(0, 12);
  document.querySelector("#topic-mastery").innerHTML = top.length
    ? top
      .map((topic) => `
          <div class="topic-row" title="${escapeHtml(topic.reason)}">
            <strong>${escapeHtml(topic.topic)}</strong>
            <span class="bar-track"><span class="bar-fill" style="width:${topic.masteryScore}%"></span></span>
            <span class="score">${topic.masteryScore}</span>
          </div>
        `)
      .join("")
    : `<p class="empty">Chưa có đủ dữ liệu topic.</p>`;
}

function renderWeaknessMatrix(matrix) {
  const cellMap = new Map(matrix.cells.map((cell) => [`${cell.topic}:${cell.bucket}`, cell]));
  const rows = matrix.topics
    .map((topic) => `
      <tr>
        <td>${escapeHtml(topic)}</td>
        ${matrix.buckets
        .map((bucket) => {
          const cell = cellMap.get(`${topic}:${bucket}`) || { score: 0, solved: 0, attempted: 0 };
          return `<td title="${cell.solved}/${cell.attempted} bài đã AC" style="background:${weaknessColor(cell.score)}">${cell.attempted ? cell.score : "-"}</td>`;
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
    `
    : `<p class="empty">Chưa có đủ dữ liệu ma trận.</p>`;
}

function renderLearningPath(items) {
  document.querySelector("#learning-path").innerHTML = items.length
    ? items
      .map((item) => `
          <article class="path-item">
            <h4>${item.order}. ${escapeHtml(item.topic)}</h4>
            <p class="muted">${escapeHtml(item.reason)}</p>
            <div class="path-meta">
              <span class="pill">Ưu tiên ${item.priorityScore}</span>
              <span class="pill">Mục tiêu ${escapeHtml(item.targetBucket)}</span>
              <span class="pill">${item.targetProblemCount} bài</span>
            </div>
          </article>
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
              <span class="pill ${problem.difficultyLevel === "stretch" ? "warn" : ""}">${escapeHtml(problem.difficultyLabel)}</span>
              <span class="pill">${problem.rating}</span>
              <span class="pill">${formatNumber(problem.solvedCount)} lượt AC</span>
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
      uniqueSolved: 0,
      acRate: 0,
      activeDays30d: 0,
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
    const button = event.target.closest?.(".info-button[data-tooltip]");
    if (!button) return;
    showTooltip(button);
  });

  document.addEventListener("pointerout", (event) => {
    const button = event.target.closest?.(".info-button[data-tooltip]");
    if (!button) return;
    hideTooltip();
  });

  document.addEventListener("focusin", (event) => {
    const button = event.target.closest?.(".info-button[data-tooltip]");
    if (!button) return;
    showTooltip(button);
  });

  document.addEventListener("focusout", (event) => {
    const button = event.target.closest?.(".info-button[data-tooltip]");
    if (!button) return;
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
