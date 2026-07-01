function getAnalyzeProfile() {
  return window.CfAnalytics?.analyzeProfile;
}

const PROBLEMSET = window.CF_LEARNING_PROBLEMSET;

const CF_BASE_URL = "https://codeforces.com/api";
const CF_MIN_INTERVAL_MS = 2100;
const REQUEST_TIMEOUT_MS = 45000;
const MAX_SUBMISSIONS = 10000;

let lastCodeforcesRequestAt = 0;
let requestQueue = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidHandle(handle) {
  return /^[A-Za-z0-9_.-]{1,48}$/.test(handle);
}

function sourceMeta(source, detail = {}) {
  return {
    source,
    fetchedAt: detail.fetchedAt || new Date().toISOString(),
    stale: false,
    warning: null
  };
}

function bundledProblemsetMeta() {
  return {
    source: "data.js",
    fetchedAt: PROBLEMSET.generatedAt || null,
    stale: false,
    warning: null
  };
}

function friendlyCodeforcesError(comment) {
  if (/handle|user|not found|not exist/i.test(comment)) {
    return "Không tìm thấy tên Codeforces này.";
  }
  if (/limit|too many|request/i.test(comment)) {
    return "Codeforces đang giới hạn tần suất. Hãy đợi vài giây rồi thử lại.";
  }
  return `Codeforces báo lỗi: ${comment}`;
}

function friendlyNetworkError(error) {
  if (error?.name === "AbortError") {
    return "Codeforces phản hồi quá lâu. Hãy kiểm tra mạng rồi thử lại.";
  }
  if (!navigator.onLine) {
    return "Trình duyệt đang offline. Dữ liệu cá nhân cần internet để tải từ Codeforces.";
  }
  return error instanceof Error ? error.message : "Không thể tải dữ liệu từ Codeforces.";
}

function scheduleCodeforcesRequest(task) {
  const next = requestQueue.then(async () => {
    const elapsed = Date.now() - lastCodeforcesRequestAt;
    if (elapsed < CF_MIN_INTERVAL_MS) {
      await sleep(CF_MIN_INTERVAL_MS - elapsed);
    }

    lastCodeforcesRequestAt = Date.now();
    return task();
  });

  requestQueue = next.catch(() => {});
  return next;
}

async function codeforcesFetch(method, params = {}) {
  return scheduleCodeforcesRequest(async () => {
    const url = new URL(`${CF_BASE_URL}/${method}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, { cache: "no-store", signal: controller.signal });
    } catch (error) {
      throw new Error(friendlyNetworkError(error));
    } finally {
      clearTimeout(timeout);
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Không thể đọc phản hồi từ Codeforces (HTTP ${response.status}).`);
    }

    if (payload.status !== "OK") {
      throw new Error(friendlyCodeforcesError(payload.comment || `HTTP ${response.status}`));
    }

    return payload.result;
  });
}

async function getProfile(handle) {
  const [profile] = await codeforcesFetch("user.info", { handles: handle });
  return {
    data: profile,
    meta: sourceMeta("network")
  };
}

async function getSubmissions(handle) {
  return {
    data: await codeforcesFetch("user.status", { handle, from: 1, count: MAX_SUBMISSIONS }),
    meta: sourceMeta("network")
  };
}

async function getRating(handle) {
  return {
    data: await codeforcesFetch("user.rating", { handle }),
    meta: sourceMeta("network")
  };
}

function getProblemset() {
  return {
    data: PROBLEMSET,
    meta: bundledProblemsetMeta()
  };
}

async function analyzeHandleStatic(handle, options = {}) {
  const trimmedHandle = String(handle || "").trim();
  if (!trimmedHandle) {
    throw new Error("Vui lòng nhập tên Codeforces.");
  }
  if (!isValidHandle(trimmedHandle)) {
    throw new Error("Tên Codeforces có ký tự không được hỗ trợ.");
  }
  if (!PROBLEMSET?.problems?.length) {
    throw new Error("Không tìm thấy kho bài trong data.js.");
  }

  const profileResult = await getProfile(trimmedHandle);
  const canonicalHandle = profileResult.data?.handle || trimmedHandle;

  const [submissionsResult, ratingResult, problemsetResult] = await Promise.all([
    getSubmissions(canonicalHandle),
    getRating(canonicalHandle),
    getProblemset()
  ]);

  const analyzeProfile = getAnalyzeProfile();
  if (typeof analyzeProfile !== "function") {
    throw new Error("Chưa tải xong module phân tích.");
  }

  const analysis = analyzeProfile({
    profile: profileResult.data,
    submissions: submissionsResult.data,
    ratingChanges: ratingResult.data,
    problemset: problemsetResult.data,
    manualGoals: options.manualGoals || []
  });

  analysis.dataSources = {
    mode: "static-data-js",
    persistentCache: false,
    resources: {
      profile: profileResult.meta,
      submissions: submissionsResult.meta,
      rating: ratingResult.meta,
      problemset: problemsetResult.meta
    }
  };

  return analysis;
}

window.CfCodeforcesApi = {
  analyzeHandleStatic
};
