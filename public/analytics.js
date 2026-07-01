const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 30;
const MIN_IMPROVEMENT_WEAKNESS = 35;
const TOPIC_STRENGTH_WEIGHTS = {
  modelAbility: 0.24,
  ability: 0.23,
  hardProof: 0.24,
  stability: 0.11,
  mastery: 0.07,
  evidence: 0.05,
  depth: 0.06
};
const BUCKETS = [
  [800, 999],
  [1000, 1199],
  [1200, 1399],
  [1400, 1599],
  [1600, 1799],
  [1800, 1999],
  [2000, 2399],
  [2400, Infinity]
];

const TOPIC_MAP = new Map([
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

const TOPIC_AFFINITY_MAP = new Map([
  ["trees", [
    ["graphs", 0.35],
    ["dsu/mst", 0.30],
    ["data structures", 0.24],
    ["dynamic programming", 0.20],
    ["shortest paths", 0.12]
  ]],
  ["graphs", [
    ["trees", 0.30],
    ["shortest paths", 0.30],
    ["dsu/mst", 0.28],
    ["flows/matching", 0.24],
    ["data structures", 0.14]
  ]],
  ["dsu/mst", [
    ["graphs", 0.36],
    ["trees", 0.32],
    ["data structures", 0.20],
    ["shortest paths", 0.12]
  ]],
  ["shortest paths", [
    ["graphs", 0.38],
    ["data structures", 0.22],
    ["dsu/mst", 0.16],
    ["flows/matching", 0.12]
  ]],
  ["flows/matching", [
    ["graphs", 0.35],
    ["shortest paths", 0.24],
    ["dsu/mst", 0.18],
    ["data structures", 0.12]
  ]],
  ["2-sat", [
    ["graphs", 0.30],
    ["dynamic programming", 0.10]
  ]],
  ["dynamic programming", [
    ["bitmasks", 0.30],
    ["combinatorics", 0.22],
    ["trees", 0.18],
    ["graphs", 0.16],
    ["probability", 0.16],
    ["advanced techniques", 0.12]
  ]],
  ["bitmasks", [
    ["dynamic programming", 0.32],
    ["brute force", 0.22],
    ["combinatorics", 0.18],
    ["advanced techniques", 0.14]
  ]],
  ["brute force", [
    ["implementation", 0.24],
    ["bitmasks", 0.18],
    ["math", 0.10]
  ]],
  ["combinatorics", [
    ["math", 0.28],
    ["dynamic programming", 0.22],
    ["probability", 0.20],
    ["number theory", 0.14]
  ]],
  ["probability", [
    ["combinatorics", 0.34],
    ["math", 0.24],
    ["dynamic programming", 0.18]
  ]],
  ["number theory", [
    ["math", 0.30],
    ["combinatorics", 0.18],
    ["advanced math", 0.16],
    ["chinese remainder theorem", 0.14]
  ]],
  ["math", [
    ["number theory", 0.24],
    ["combinatorics", 0.18],
    ["geometry", 0.14],
    ["probability", 0.12],
    ["advanced math", 0.12]
  ]],
  ["advanced math", [
    ["math", 0.30],
    ["number theory", 0.22],
    ["combinatorics", 0.16]
  ]],
  ["geometry", [
    ["math", 0.26],
    ["search", 0.18],
    ["implementation", 0.10]
  ]],
  ["strings", [
    ["data structures", 0.22],
    ["expression parsing", 0.20],
    ["dynamic programming", 0.12]
  ]],
  ["expression parsing", [
    ["strings", 0.30],
    ["implementation", 0.18],
    ["data structures", 0.14]
  ]],
  ["data structures", [
    ["trees", 0.24],
    ["graphs", 0.20],
    ["binary search", 0.18],
    ["divide and conquer", 0.16],
    ["strings", 0.12],
    ["dsu/mst", 0.12]
  ]],
  ["divide and conquer", [
    ["data structures", 0.28],
    ["binary search", 0.24],
    ["dynamic programming", 0.18],
    ["advanced techniques", 0.16]
  ]],
  ["binary search", [
    ["two pointers", 0.20],
    ["data structures", 0.18],
    ["divide and conquer", 0.18],
    ["math", 0.12]
  ]],
  ["two pointers", [
    ["binary search", 0.22],
    ["sorting", 0.18],
    ["greedy", 0.16],
    ["data structures", 0.12]
  ]],
  ["sorting", [
    ["greedy", 0.20],
    ["two pointers", 0.18],
    ["data structures", 0.12]
  ]],
  ["greedy", [
    ["constructive", 0.24],
    ["sorting", 0.18],
    ["math", 0.12],
    ["two pointers", 0.12]
  ]],
  ["constructive", [
    ["greedy", 0.24],
    ["math", 0.14],
    ["implementation", 0.12]
  ]],
  ["implementation", [
    ["brute force", 0.20],
    ["constructive", 0.12],
    ["strings", 0.10]
  ]],
  ["game theory", [
    ["dynamic programming", 0.22],
    ["math", 0.20],
    ["greedy", 0.12]
  ]],
  ["advanced techniques", [
    ["divide and conquer", 0.24],
    ["bitmasks", 0.18],
    ["dynamic programming", 0.16]
  ]],
  ["chinese remainder theorem", [
    ["number theory", 0.36],
    ["math", 0.20]
  ]],
  ["search", [
    ["binary search", 0.28],
    ["geometry", 0.18],
    ["math", 0.12]
  ]],
  ["communication", [
    ["interactive", 0.30],
    ["constructive", 0.12]
  ]],
  ["scheduling", [
    ["greedy", 0.22],
    ["constructive", 0.14]
  ]],
  ["interactive", [
    ["constructive", 0.16],
    ["binary search", 0.14],
    ["communication", 0.12]
  ]]
]);

const TOPIC_CREDIT_WEIGHTS = new Map([
  ["implementation", 0.45],
  ["brute force", 0.55],
  ["greedy", 0.65],
  ["math", 0.70],
  ["sorting", 0.65],
  ["constructive", 0.75],
  ["binary search", 0.75],
  ["two pointers", 0.75],
  ["data structures", 0.85],
  ["graphs", 0.90],
  ["dynamic programming", 0.95],
  ["trees", 1.10],
  ["geometry", 1.05],
  ["probability", 1.05],
  ["flows/matching", 1.10],
  ["advanced math", 1.10],
  ["advanced techniques", 1.10]
]);

const LOGISTIC_PFA_MODEL = {
  name: "PFA-style Logistic baseline",
  version: "heuristic-2026-06-30",
  target: "P_AC",
  intercept: -0.35,
  coefficients: {
    ratingGap: -1.25,
    topicAbility: 1.05,
    topicStability: 0.75,
    topicEvidence: 0.35,
    topicWeakness: -0.55,
    problemQuality: 0.35,
    manualGoal: 0.35,
    attemptedBefore: -0.45,
    stretchPenalty: -0.25
  },
  calibration: {
    scale: 0.9,
    bias: 0.03
  }
};

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.floor(sorted.length / 2)];
}

function average(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return null;
  return Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length);
}

function difficultyWeight(rating) {
  if (!rating) return 1;
  return clamp(1 + (rating - 800) / 800, 1, 3.4);
}

function dateKey(input) {
  return new Date(input).toISOString().slice(0, 10);
}

function localDateKey(input) {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weekKey(input) {
  const date = new Date(input);
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  return date.toISOString().slice(0, 10);
}

function problemKey(problem) {
  if (!problem) return null;
  const contestId = problem.contestId ?? problem.contest_id;
  const index = problem.index;
  if (contestId === undefined || index === undefined) return null;
  return `${contestId}/${index}`;
}

function problemUrl(problem) {
  const key = problemKey(problem);
  if (!key) return "";
  const [contestId, index] = key.split("/");
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
}

function ratingBucket(rating) {
  if (!rating) return "unrated";
  for (const [min, max] of BUCKETS) {
    if (rating >= min && rating <= max) {
      return Number.isFinite(max) ? `${min}-${max}` : `${min}+`;
    }
  }
  return rating < 800 ? "<800" : "unrated";
}

function bucketFloor(bucket) {
  if (bucket === "<800") return 0;
  if (bucket.endsWith("+")) return Number(bucket.replace("+", ""));
  if (bucket.includes("-")) return Number(bucket.split("-")[0]);
  return 800;
}

function normalizeTopics(tags = []) {
  const topics = new Set();
  for (const tag of tags) {
    if (!tag || String(tag).startsWith("*")) continue;
    topics.add(TOPIC_MAP.get(tag) || tag);
  }
  return [...topics];
}

function topicBaseCredit(topic) {
  return TOPIC_CREDIT_WEIGHTS.get(topic) || 0.85;
}

function topicCredit(topic, problemTopics = []) {
  if (problemTopics.length <= 1) return 1;
  const maxCredit = Math.max(...problemTopics.map((item) => topicBaseCredit(item)));
  return clamp(topicBaseCredit(topic) / Math.max(0.1, maxCredit), 0.35, 1);
}

function creditedRating(rating, credit) {
  if (!rating) return null;
  return Math.round(800 + (rating - 800) * credit);
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function logit(probability) {
  const value = clamp(probability, 0.01, 0.99);
  return Math.log(value / (1 - value));
}

function calibrateProbability(rawProbability, calibration = LOGISTIC_PFA_MODEL.calibration) {
  return clamp(sigmoid(calibration.scale * logit(rawProbability) + calibration.bias), 0.01, 0.99);
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function smoothedRate(success, total) {
  return (safeNumber(success) + 1) / (safeNumber(total) + 2);
}

function percentFeature(value, fallback = 0.45) {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value / 100, 0, 1);
}

function featureName(prefix, value) {
  const normalized = String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${prefix}__${normalized || "unknown"}`;
}

function primaryTopic(topics = []) {
  if (!topics.length) return "unknown";
  return topics.slice().sort((a, b) => topicBaseCredit(b) - topicBaseCredit(a))[0];
}

function getXgbModelBundle() {
  if (typeof window === "undefined") return null;
  const bundle = window.CF_LEARNING_XGB_MODEL;
  if (!bundle?.booster?.learner?.gradient_booster?.model?.trees?.length) return null;
  return bundle;
}

function modelInfo() {
  const xgb = getXgbModelBundle();
  if (xgb) {
    const meta = xgb.meta || {};
    return {
      name: meta.name || "Codeforces XGBoost P_AC",
      version: meta.version || "unknown",
      target: "P_AC",
      calibrated: Boolean(meta.calibration),
      calibration: meta.calibration?.formula || "P_AC = calibrated(P_raw)",
      modelSource: "xgboost",
      trainRows: meta.trainRows || 0,
      validRows: meta.validRows || 0,
      metrics: meta.metrics || null,
      inputs: meta.featureColumns || [],
      note: "Đang dùng XGBoost đã train offline để dự đoán P_AC; heuristic cũ chỉ còn là fallback khi thiếu model."
    };
  }

  return {
    name: LOGISTIC_PFA_MODEL.name,
    version: LOGISTIC_PFA_MODEL.version,
    target: LOGISTIC_PFA_MODEL.target,
    calibrated: true,
    modelSource: "logistic-baseline",
    calibration: "P_AC = sigmoid(scale * logit(P_raw) + bias)",
    inputs: [
      "ratingGap",
      "topicAbility",
      "topicStability",
      "topicEvidence",
      "topicWeakness",
      "problemQuality",
      "manualGoal",
      "attemptedBefore",
      "stretchPenalty"
    ],
    note: "Baseline logistic/PFA-style chạy hoàn toàn ở trình duyệt. Trọng số hiện tại là heuristic có thể thay bằng trọng số train thật sau này."
  };
}

function xgbPredictProbability(featureMap) {
  const bundle = getXgbModelBundle();
  if (!bundle) return null;

  const learner = bundle.booster.learner;
  const model = learner.gradient_booster.model;
  const featureNames = learner.feature_names || bundle.meta?.featureColumns || [];
  const defaults = bundle.meta?.featureDefaults || {};
  let margin = parseXgbBaseMargin(learner.learner_model_param?.base_score);

  const getFeatureValue = (index) => {
    const name = featureNames[index];
    if (!name) return 0;
    if (Object.prototype.hasOwnProperty.call(featureMap, name)) {
      return safeNumber(featureMap[name], safeNumber(defaults[name], 0));
    }
    return safeNumber(defaults[name], 0);
  };

  for (const tree of model.trees || []) {
    margin += xgbTreeLeafValue(tree, getFeatureValue);
  }

  const rawProbability = sigmoid(margin);
  const calibration = bundle.meta?.calibration;
  const acProbability = calibration
    ? calibrateProbability(rawProbability, calibration)
    : rawProbability;

  return {
    rawProbability: round(rawProbability, 3),
    acProbability: round(acProbability, 3),
    modelSource: "xgboost"
  };
}

function parseXgbBaseMargin(baseScore) {
  const parsed = parseFloat(String(baseScore ?? "0.5").replace(/[^0-9eE+.-]/g, ""));
  const probability = Number.isFinite(parsed) ? parsed : 0.5;
  if (probability > 0 && probability < 1) return logit(probability);
  return probability;
}

function xgbTreeLeafValue(tree, getFeatureValue) {
  let node = 0;
  const leftChildren = tree.left_children || [];
  const rightChildren = tree.right_children || [];
  const splitIndices = tree.split_indices || [];
  const splitConditions = tree.split_conditions || [];
  const defaultLeft = tree.default_left || [];
  const baseWeights = tree.base_weights || [];

  while (node >= 0) {
    const left = leftChildren[node];
    const right = rightChildren[node];
    if (left === -1 && right === -1) {
      return safeNumber(splitConditions[node], safeNumber(baseWeights[node], 0));
    }

    const featureValue = getFeatureValue(splitIndices[node]);
    const threshold = safeNumber(splitConditions[node], 0);
    const goLeft = Number.isFinite(featureValue)
      ? featureValue < threshold
      : defaultLeft[node] === 1;
    node = goLeft ? left : right;
  }

  return 0;
}

function buildProblemMap(problemset) {
  const statsByKey = new Map();
  for (const stat of problemset.problemStatistics || []) {
    const key = problemKey(stat);
    if (key) statsByKey.set(key, stat.solvedCount || 0);
  }

  const map = new Map();
  for (const problem of problemset.problems || []) {
    const key = problemKey(problem);
    if (!key) continue;
    map.set(key, {
      ...problem,
      key,
      solvedCount: problem.solvedCount ?? statsByKey.get(key) ?? 0,
      topics: normalizeTopics(problem.tags || []),
      url: problemUrl(problem)
    });
  }
  return map;
}

function buildTopicCorpusStats(problemMap) {
  const stats = new Map();

  for (const problem of problemMap.values()) {
    if (!problem.rating || !problem.topics?.length) continue;

    for (const topic of problem.topics) {
      if (!stats.has(topic)) {
        stats.set(topic, {
          topic,
          ratedCount: 0,
          ratings: [],
          frequencyByBucket: {}
        });
      }

      const item = stats.get(topic);
      const credit = topicCredit(topic, problem.topics);
      const effectiveRating = creditedRating(problem.rating, credit) || problem.rating;
      item.ratedCount += 1;
      item.ratings.push(effectiveRating);
      const bucket = ratingBucket(effectiveRating);
      item.frequencyByBucket[bucket] = (item.frequencyByBucket[bucket] || 0) + 1;
    }
  }

  for (const item of stats.values()) {
    item.minRating = Math.min(...item.ratings);
    item.maxRating = Math.max(...item.ratings);
    item.medianRating = median(item.ratings);
    item.avgRating = average(item.ratings);
    item.hardRatio = item.ratings.filter((rating) => rating >= 1800).length / Math.max(1, item.ratedCount);
    delete item.ratings;
  }

  return stats;
}

function buildProblemStatuses(submissions, problemMap) {
  const statuses = new Map();

  for (const submission of submissions) {
    const key = problemKey(submission.problem);
    if (!key) continue;

    const metadata = problemMap.get(key) || {
      ...submission.problem,
      key,
      solvedCount: 0,
      topics: normalizeTopics(submission.problem?.tags || []),
      url: problemUrl(submission.problem)
    };

    if (!statuses.has(key)) {
      statuses.set(key, {
        key,
        problem: metadata,
        submitCount: 0,
        wrongSubmitCount: 0,
        verdictCounts: {},
        solved: false,
        firstTriedAt: null,
        solvedAt: null,
        lastTriedAt: null
      });
    }

    const status = statuses.get(key);
    const submittedAt = new Date((submission.creationTimeSeconds || 0) * 1000);
    const verdict = submission.verdict || "UNKNOWN";

    status.submitCount += 1;
    status.verdictCounts[verdict] = (status.verdictCounts[verdict] || 0) + 1;
    status.firstTriedAt = status.firstTriedAt && status.firstTriedAt < submittedAt ? status.firstTriedAt : submittedAt;
    status.lastTriedAt = status.lastTriedAt && status.lastTriedAt > submittedAt ? status.lastTriedAt : submittedAt;

    if (verdict === "OK") {
      status.solved = true;
      status.solvedAt = status.solvedAt && status.solvedAt < submittedAt ? status.solvedAt : submittedAt;
    } else {
      status.wrongSubmitCount += 1;
    }
  }

  return statuses;
}

function getEstimatedRating(profile, statuses) {
  if (profile.rating) return profile.rating;

  const solvedRatings = [...statuses.values()]
    .filter((status) => status.solved && status.problem.rating)
    .sort((a, b) => b.solvedAt - a.solvedAt)
    .slice(0, 50)
    .map((status) => status.problem.rating)
    .sort((a, b) => a - b);

  if (!solvedRatings.length) return 1000;
  return solvedRatings[Math.floor(solvedRatings.length / 2)];
}

function aggregateSubmissionCharts(submissions) {
  const verdictCounts = new Map();
  const languageCounts = new Map();
  const activity = new Map();
  const weekly = new Map();

  for (const submission of submissions) {
    const submittedAt = new Date((submission.creationTimeSeconds || 0) * 1000);
    const day = dateKey(submittedAt);
    const week = weekKey(submittedAt);
    const verdict = submission.verdict || "UNKNOWN";
    const accepted = verdict === "OK" ? 1 : 0;

    verdictCounts.set(verdict, (verdictCounts.get(verdict) || 0) + 1);
    languageCounts.set(submission.programmingLanguage || "unknown", (languageCounts.get(submission.programmingLanguage || "unknown") || 0) + 1);

    const dayValue = activity.get(day) || { date: day, total: 0, accepted: 0 };
    dayValue.total += 1;
    dayValue.accepted += accepted;
    activity.set(day, dayValue);

    const weekValue = weekly.get(week) || { week, total: 0, accepted: 0, wrong: 0 };
    weekValue.total += 1;
    weekValue.accepted += accepted;
    weekValue.wrong += verdict === "OK" ? 0 : 1;
    weekly.set(week, weekValue);
  }

  return {
    verdicts: [...verdictCounts.entries()]
      .map(([verdict, count]) => ({ verdict, count }))
      .sort((a, b) => b.count - a.count),
    languages: [...languageCounts.entries()]
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    activity: [...activity.values()].sort((a, b) => a.date.localeCompare(b.date)),
    submissionTrend: [...weekly.values()].sort((a, b) => a.week.localeCompare(b.week)).slice(-20)
  };
}

function aggregateBuckets(statuses) {
  const buckets = new Map();

  for (const status of statuses.values()) {
    const bucket = ratingBucket(status.problem.rating);
    if (!buckets.has(bucket)) {
      buckets.set(bucket, {
        bucket,
        solvedCount: 0,
        attemptedCount: 0,
        attemptedUnsolvedCount: 0,
        submissionCount: 0,
        acRate: 0,
        masteryScore: 0
      });
    }

    const item = buckets.get(bucket);
    item.attemptedCount += 1;
    item.submissionCount += status.submitCount;
    if (status.solved) item.solvedCount += 1;
    else item.attemptedUnsolvedCount += 1;
  }

  return [...buckets.values()]
    .map((bucket) => {
      const acRate = (bucket.solvedCount + 1) / (bucket.attemptedCount + 2);
      const coverage = 1 - Math.exp(-bucket.solvedCount / 25);
      return {
        ...bucket,
        acRate: round(acRate, 3),
        masteryScore: Math.round(100 * (0.55 * coverage + 0.45 * acRate))
      };
    })
    .sort((a, b) => bucketFloor(a.bucket) - bucketFloor(b.bucket));
}

function topicTargetSolvedCount(corpus) {
  if (!corpus) return 12;
  if (corpus.hardRatio >= 0.45 || (corpus.medianRating || 0) >= 1800) return 8;
  if (corpus.hardRatio >= 0.25 || (corpus.medianRating || 0) >= 1500) return 10;
  return 12;
}

function topicDifficultyScore(topic, corpus) {
  const maxSolved = topic.maxSolvedRating || 0;
  const avgSolved = topic.avgSolvedRating || 0;
  const corpusMedian = corpus?.medianRating || 1300;
  const ceiling = maxSolved ? clamp((maxSolved - 900) / 1600, 0, 1) : 0;
  const peak = maxSolved ? clamp((maxSolved - 1200) / 1000, 0, 1) : 0;
  const relativePeak = maxSolved ? clamp((maxSolved - corpusMedian + 700) / 1000, 0, 1) : 0;
  const relativeAverage = avgSolved ? clamp((avgSolved - corpusMedian + 450) / 900, 0, 1) : 0;
  const hardCoverage = 1 - Math.exp(-topic.hardSolvedCount / 4);
  return clamp(
    0.34 * ceiling
    + 0.28 * peak
    + 0.16 * relativePeak
    + 0.10 * relativeAverage
    + 0.12 * hardCoverage,
    0,
    1
  );
}

function topicAbilityScore(topic, corpus, currentRating) {
  const maxSolved = topic.maxSolvedRating || 0;
  const topSolved = topic.topSolvedRating || topic.avgSolvedRating || 0;
  const corpusMedian = corpus?.medianRating || 1300;
  const baseline = currentRating || 1000;
  const ceiling = maxSolved ? clamp((maxSolved - 800) / 1800, 0, 1) : 0;
  const peakEdge = maxSolved ? clamp((maxSolved - baseline + 450) / 900, 0, 1) : 0;
  const personalEdge = topSolved ? clamp((topSolved - baseline + 500) / 1000, 0, 1) : 0;
  const topicEdge = topSolved ? clamp((topSolved - corpusMedian + 500) / 1000, 0, 1) : 0;
  const hardCoverage = 1 - Math.exp(-topic.hardSolvedCount / 3);
  return clamp(
    0.30 * ceiling
    + 0.26 * peakEdge
    + 0.20 * personalEdge
    + 0.12 * topicEdge
    + 0.12 * hardCoverage,
    0,
    1
  );
}

function topicEvidenceScore(topic) {
  const solvedWeight = topic.solvedDifficultyWeight || 0;
  const attemptedWeight = topic.attemptedDifficultyWeight || 0;
  const unsolvedWeight = Math.max(0, attemptedWeight - solvedWeight);
  const baseEvidence = 1 - Math.exp(-(solvedWeight + 0.35 * unsolvedWeight) / 10);
  const hardEvidence = topic.maxSolvedRating ? clamp((topic.maxSolvedRating - 1500) / 1200, 0, 0.35) : 0;
  return clamp(baseEvidence + hardEvidence, 0, 1);
}

function masteryCap(topic, evidence, currentRating) {
  const maxSolved = topic.maxSolvedRating || 0;
  let cap = 45 + 55 * evidence;

  if (topic.solvedCount <= 2 && maxSolved < 1600) {
    cap = Math.min(cap, 58);
  }
  if (maxSolved && currentRating && maxSolved < currentRating - 300) {
    cap = Math.min(cap, 62);
  }
  if (maxSolved >= 1800) {
    cap = Math.max(cap, 72);
  }
  if (maxSolved >= 2200) {
    cap = Math.max(cap, 80);
  }

  return clamp(cap / 100, 0, 1);
}

function topicStrengthRawScore(topic) {
  const ability = percentFeature(topic.effectiveAbilityScore ?? topic.abilityScore, 0.45);
  const modelAbility = topic.modelAbilityScore !== undefined
    ? percentFeature(topic.modelAbilityScore, ability)
    : ability;
  const stability = percentFeature(topic.stabilityScore, 0.5);
  const evidence = percentFeature(topic.effectiveEvidenceScore ?? topic.evidenceScore, 0.4);
  const difficulty = percentFeature(topic.effectiveDifficultyScore ?? topic.difficultyScore, 0.4);
  const mastery = percentFeature(topic.masteryScore, 0.45);
  const maxSolvedRating = topic.effectiveMaxSolvedRating ?? topic.maxSolvedRating;
  const avgSolvedRating = topic.effectiveAvgSolvedRating ?? topic.avgSolvedRating;
  const hardSolvedCount = topic.effectiveHardSolvedCount ?? topic.hardSolvedCount;
  const solvedCount = topic.effectiveSolvedCount ?? topic.solvedCount;
  const peakSolved = maxSolvedRating ? clamp((maxSolvedRating - 1500) / 1700, 0, 1) : 0;
  const averageSolved = avgSolvedRating ? clamp((avgSolvedRating - 1200) / 1000, 0, 1) : 0;
  const hardDepth = clamp(Math.log1p(hardSolvedCount || 0) / Math.log(80), 0, 1);
  const solvedDepth = clamp(Math.log1p(solvedCount || 0) / Math.log(120), 0, 1);
  const practiceDepth = clamp(0.7 * hardDepth + 0.3 * solvedDepth, 0, 1);
  const hardProof = clamp(0.65 * Math.max(difficulty, peakSolved) + 0.35 * averageSolved, 0, 1);
  const reliability = 0.90 + 0.10 * clamp(0.55 + 0.45 * evidence, 0, 1);
  const raw = 100 * (
    TOPIC_STRENGTH_WEIGHTS.modelAbility * modelAbility
    + TOPIC_STRENGTH_WEIGHTS.ability * ability
    + TOPIC_STRENGTH_WEIGHTS.hardProof * hardProof
    + TOPIC_STRENGTH_WEIGHTS.stability * stability
    + TOPIC_STRENGTH_WEIGHTS.mastery * mastery
    + TOPIC_STRENGTH_WEIGHTS.evidence * evidence
    + TOPIC_STRENGTH_WEIGHTS.depth * practiceDepth
  );

  return clamp(raw * reliability, 0, 100);
}

function topicStrengthScore(topic) {
  return Math.round(topicStrengthRawScore(topic));
}

function withTopicStrength(topic) {
  const strengthRawScore = topicStrengthRawScore(topic);
  return {
    ...topic,
    strengthRawScore: round(strengthRawScore, 3),
    strengthScore: Math.round(strengthRawScore)
  };
}

function topicStrengthSortValue(topic) {
  return Number.isFinite(topic.strengthRawScore)
    ? topic.strengthRawScore
    : (topic.strengthScore ?? topic.masteryScore ?? 0);
}

function compareTopicStrength(a, b) {
  return topicStrengthSortValue(b) - topicStrengthSortValue(a)
    || (b.maxSolvedRating || 0) - (a.maxSolvedRating || 0)
    || (b.avgSolvedRating || 0) - (a.avgSolvedRating || 0)
    || (b.hardSolvedCount || 0) - (a.hardSolvedCount || 0)
    || (b.masteryScore || 0) - (a.masteryScore || 0)
    || (b.solvedCount || 0) - (a.solvedCount || 0)
    || String(a.topic).localeCompare(String(b.topic));
}

function topicAffinityGate(topic) {
  const solved = topic.solvedCount || 0;
  const maxSolved = topic.maxSolvedRating || 0;
  if (!solved) return 0;
  if (solved >= 5 || maxSolved >= 1900) return 1;
  if (solved >= 2 && maxSolved >= 1600) return 0.8;
  if (solved >= 3) return 0.6;
  return 0.25;
}

function relatedTopicConfidence(topic) {
  return clamp(
    0.58 * percentFeature(topic.evidenceScore, 0)
    + 0.22 * percentFeature(topic.stabilityScore, 0.5)
    + 0.20 * clamp(Math.log1p(topic.solvedCount || 0) / Math.log(24), 0, 1),
    0,
    1
  );
}

function applyRelatedTopicEvidence(topics) {
  const topicsByName = new Map(topics.map((topic) => [topic.topic, topic]));

  return topics
    .map((topic) => {
      const edges = TOPIC_AFFINITY_MAP.get(topic.topic) || [];
      const gate = topicAffinityGate(topic);
      if (!edges.length || gate <= 0) return withTopicStrength(topic);

      let relatedSolved = 0;
      let relatedAttempted = 0;
      let relatedHard = 0;
      let relatedEvidence = 0;
      let relatedDifficulty = 0;
      let relatedAbility = 0;
      let relatedWeight = 0;
      let relatedAvgNumerator = 0;
      let relatedAvgWeight = 0;
      let relatedMaxRating = topic.maxSolvedRating || null;
      const supportTopics = [];

      for (const [relatedTopic, affinity] of edges) {
        const neighbor = topicsByName.get(relatedTopic);
        if (!neighbor || neighbor.topic === topic.topic) continue;

        const confidence = relatedTopicConfidence(neighbor);
        const weight = clamp(affinity, 0, 0.5) * confidence;
        if (weight <= 0) continue;

        relatedSolved += weight * (neighbor.solvedCount || 0);
        relatedAttempted += weight * (neighbor.attemptedCount || 0);
        relatedHard += weight * (neighbor.hardSolvedCount || 0);
        relatedEvidence += weight * percentFeature(neighbor.evidenceScore, 0);
        relatedDifficulty += weight * percentFeature(neighbor.difficultyScore, 0);
        relatedAbility += weight * percentFeature(neighbor.abilityScore, 0);
        relatedWeight += weight;

        if (neighbor.avgSolvedRating) {
          const avgWeight = weight * Math.max(1, neighbor.solvedCount || 1);
          relatedAvgNumerator += neighbor.avgSolvedRating * avgWeight;
          relatedAvgWeight += avgWeight;
        }
        if (neighbor.maxSolvedRating) {
          const baseMax = topic.maxSolvedRating || 800;
          const creditedMax = Math.round(baseMax + gate * affinity * 0.35 * Math.max(0, neighbor.maxSolvedRating - baseMax));
          relatedMaxRating = relatedMaxRating ? Math.max(relatedMaxRating, creditedMax) : creditedMax;
        }

        supportTopics.push({
          topic: relatedTopic,
          weight: round(weight, 3),
          solved: neighbor.solvedCount || 0,
          maxSolvedRating: neighbor.maxSolvedRating || null
        });
      }

      if (relatedWeight <= 0) return withTopicStrength(topic);

      const maxBorrowedSolved = Math.min(12, Math.max(2.25, (topic.solvedCount || 0) * 0.35));
      const maxBorrowedHard = Math.min(8, Math.max(0.85, (topic.hardSolvedCount || 0) * 0.35));
      const borrowedSolved = round(Math.min(gate * relatedSolved, maxBorrowedSolved), 2);
      const borrowedAttempted = round(Math.min(gate * relatedAttempted, Math.min(14, Math.max(2.5, (topic.attemptedCount || 0) * 0.35))), 2);
      const borrowedHard = round(Math.min(gate * relatedHard, maxBorrowedHard), 2);
      const relatedEvidenceAverage = relatedEvidence / relatedWeight;
      const relatedDifficultyAverage = relatedDifficulty / relatedWeight;
      const relatedAbilityAverage = relatedAbility / relatedWeight;
      const relatedAvgRating = relatedAvgWeight ? Math.round(relatedAvgNumerator / relatedAvgWeight) : null;
      const evidenceBonus = Math.round(16 * gate * clamp(borrowedSolved / Math.max(3, (topic.solvedCount || 0) + 2), 0, 1));
      const hardBonus = clamp(borrowedHard / Math.max(1, (topic.hardSolvedCount || 0) + 1.5), 0, 1);
      const abilityBlend = clamp(0.18 * gate * (relatedAbilityAverage - percentFeature(topic.abilityScore, 0)), 0, 0.07);
      const difficultyBlend = clamp(0.18 * gate * (relatedDifficultyAverage - percentFeature(topic.difficultyScore, 0)), 0, 0.07);
      const effectiveAvgSolvedRating = relatedAvgRating && topic.avgSolvedRating
        ? Math.max(topic.avgSolvedRating, Math.round((topic.avgSolvedRating * Math.max(1, topic.solvedCount || 1) + relatedAvgRating * borrowedSolved * 0.4) / Math.max(1, (topic.solvedCount || 1) + borrowedSolved * 0.4)))
        : (topic.avgSolvedRating || relatedAvgRating);
      const enrichedTopic = {
        ...topic,
        relatedSolvedEquivalent: borrowedSolved,
        relatedAttemptedEquivalent: borrowedAttempted,
        relatedHardSolvedEquivalent: borrowedHard,
        relatedEvidenceScore: Math.round(relatedEvidenceAverage * 100),
        relatedSupportTopics: supportTopics
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 4),
        effectiveSolvedCount: round((topic.solvedCount || 0) + borrowedSolved, 2),
        effectiveAttemptedCount: round((topic.attemptedCount || 0) + borrowedAttempted, 2),
        effectiveHardSolvedCount: round((topic.hardSolvedCount || 0) + borrowedHard, 2),
        effectiveEvidenceScore: Math.max(topic.evidenceScore || 0, Math.min(100, (topic.evidenceScore || 0) + evidenceBonus)),
        effectiveAbilityScore: Math.round(100 * clamp(percentFeature(topic.abilityScore, 0) + abilityBlend, 0, 1)),
        effectiveDifficultyScore: Math.round(100 * clamp(percentFeature(topic.difficultyScore, 0) + difficultyBlend + 0.035 * hardBonus, 0, 1)),
        effectiveMaxSolvedRating: relatedMaxRating || topic.maxSolvedRating || null,
        effectiveAvgSolvedRating,
        affinityGate: round(gate, 2)
      };

      return withTopicStrength(enrichedTopic);
    })
    .sort(compareTopicStrength);
}

function aggregateTopics(statuses, now, topicCorpusStats, currentRating) {
  const topics = new Map();

  for (const status of statuses.values()) {
    const problemTopics = status.problem.topics?.length ? status.problem.topics : normalizeTopics(status.problem.tags || []);
    for (const topic of problemTopics) {
      if (!topics.has(topic)) {
        topics.set(topic, {
          topic,
          solvedCount: 0,
          attemptedCount: 0,
          attemptedUnsolvedCount: 0,
          submissionCount: 0,
          wrongCount: 0,
          tleCount: 0,
          weightedWrongCount: 0,
          weightedTleCount: 0,
          solvedAfterFailCount: 0,
          ratingSum: 0,
          ratedSolvedCount: 0,
          attemptedRatingSum: 0,
          ratedAttemptedCount: 0,
          solvedDifficultyWeight: 0,
          attemptedDifficultyWeight: 0,
          hardSolvedCount: 0,
          maxSolvedRating: null,
          minSolvedRating: null,
          solvedRatings: [],
          solvedBucketCounts: {},
          attemptedBucketCounts: {},
          lastSolvedAt: null,
          verdictCounts: {}
        });
      }

      const item = topics.get(topic);
      const rating = status.problem.rating || null;
      const credit = topicCredit(topic, problemTopics);
      const effectiveRating = creditedRating(rating, credit);
      const ratingForWeight = effectiveRating || rating;
      const weight = difficultyWeight(ratingForWeight) * (0.65 + 0.35 * credit);
      item.attemptedCount += 1;
      item.submissionCount += status.submitCount;
      item.wrongCount += status.wrongSubmitCount;
      item.tleCount += status.verdictCounts.TIME_LIMIT_EXCEEDED || 0;
      item.weightedWrongCount += status.wrongSubmitCount * credit;
      item.weightedTleCount += (status.verdictCounts.TIME_LIMIT_EXCEEDED || 0) * credit;
      item.attemptedDifficultyWeight += weight;

      if (ratingForWeight) {
        const bucket = ratingBucket(ratingForWeight);
        item.attemptedRatingSum += ratingForWeight;
        item.ratedAttemptedCount += 1;
        item.attemptedBucketCounts[bucket] = (item.attemptedBucketCounts[bucket] || 0) + 1;
      }

      for (const [verdict, count] of Object.entries(status.verdictCounts)) {
        item.verdictCounts[verdict] = (item.verdictCounts[verdict] || 0) + count;
      }

      if (status.solved) {
        item.solvedCount += 1;
        item.solvedDifficultyWeight += weight;
        if (ratingForWeight) {
          const bucket = ratingBucket(ratingForWeight);
          item.ratingSum += ratingForWeight;
          item.ratedSolvedCount += 1;
          item.hardSolvedCount += ratingForWeight >= 1800 ? 1 : 0;
          item.maxSolvedRating = item.maxSolvedRating ? Math.max(item.maxSolvedRating, ratingForWeight) : ratingForWeight;
          item.minSolvedRating = item.minSolvedRating ? Math.min(item.minSolvedRating, ratingForWeight) : ratingForWeight;
          item.solvedRatings.push(ratingForWeight);
          item.solvedBucketCounts[bucket] = (item.solvedBucketCounts[bucket] || 0) + 1;
        }
        if (status.wrongSubmitCount > 0) item.solvedAfterFailCount += 1;
        item.lastSolvedAt = item.lastSolvedAt && item.lastSolvedAt > status.solvedAt ? item.lastSolvedAt : status.solvedAt;
      } else {
        item.attemptedUnsolvedCount += 1;
      }
    }
  }

  return [...topics.values()]
    .map((topic) => {
      const corpus = topicCorpusStats.get(topic.topic);
      const acRate = (topic.solvedCount + 1) / (topic.attemptedCount + 2);
      topic.avgSolvedRating = topic.ratedSolvedCount ? Math.round(topic.ratingSum / topic.ratedSolvedCount) : null;
      topic.avgAttemptedRating = topic.ratedAttemptedCount ? Math.round(topic.attemptedRatingSum / topic.ratedAttemptedCount) : null;
      topic.topSolvedRating = average(topic.solvedRatings.slice().sort((a, b) => b - a).slice(0, 3));

      const targetSolvedCount = topic.topic.includes("advanced") || topic.topic.includes("flows")
        ? 8
        : topicTargetSolvedCount(corpus);
      const weightedCoverage = 1 - Math.exp(-topic.solvedDifficultyWeight / Math.max(1, targetSolvedCount * 1.6));
      const daysSinceLastSolved = topic.lastSolvedAt ? Math.max(0, (now - topic.lastSolvedAt) / MS_PER_DAY) : 365;
      const recency = 2 ** (-daysSinceLastSolved / 30);
      const recovery = clamp((topic.solvedCount + 0.5 * topic.solvedAfterFailCount) / Math.max(1, topic.solvedCount + topic.attemptedUnsolvedCount), 0, 1);
      const difficultyAdjustedAccuracy = (topic.solvedDifficultyWeight + 1.5) / (topic.attemptedDifficultyWeight + 3);
      const difficultyScore = topicDifficultyScore(topic, corpus);
      const abilityScore = topicAbilityScore(topic, corpus, currentRating);
      const evidenceScore = topicEvidenceScore(topic);
      const attemptedUnsolvedRatio = topic.attemptedUnsolvedCount / Math.max(1, topic.attemptedCount);
      const errorPressure = (topic.weightedWrongCount + topic.weightedTleCount) / Math.max(1, topic.submissionCount);
      const hardAttemptDiscount = topic.avgAttemptedRating ? clamp((topic.avgAttemptedRating - 1200) / 1400, 0, 0.35) : 0;
      const adjustedErrorPressure = clamp(errorPressure * (1 - hardAttemptDiscount), 0, 1);
      const stabilityScore = clamp(
        0.62 * clamp(difficultyAdjustedAccuracy, 0, 1)
        + 0.18 * recovery
        + 0.20 * (1 - adjustedErrorPressure),
        0,
        1
      );
      const rawMastery = (
        0.34 * abilityScore
        + 0.18 * stabilityScore
        + 0.16 * evidenceScore
        + 0.14 * difficultyScore
        + 0.10 * weightedCoverage
        + 0.05 * recency
        + 0.03 * recovery
      );
      const cap = masteryCap(topic, evidenceScore, currentRating);
      const abilityFloor = topic.maxSolvedRating >= 1800
        ? clamp(0.54 + 0.16 * evidenceScore + 0.12 * abilityScore, 0, 0.84)
        : 0;
      const mastery = 100 * Math.max(abilityFloor, Math.min(rawMastery, cap));
      const staleness = 1 - recency;
      const weakness = 100 * (
        0.28 * (1 - abilityScore)
        + 0.22 * (1 - stabilityScore)
        + 0.18 * (1 - difficultyScore)
        + 0.14 * attemptedUnsolvedRatio
        + 0.10 * staleness
        + 0.08 * (1 - evidenceScore)
      );

      return {
        ...topic,
        acRate: round(acRate, 3),
        difficultyAdjustedAccuracy: round(difficultyAdjustedAccuracy, 3),
        coverageScore: Math.round(weightedCoverage * 100),
        difficultyScore: Math.round(difficultyScore * 100),
        abilityScore: Math.round(abilityScore * 100),
        stabilityScore: Math.round(stabilityScore * 100),
        evidenceScore: Math.round(evidenceScore * 100),
        masteryCap: Math.round(cap * 100),
        recoveryScore: Math.round(recovery * 100),
        recencyScore: Math.round(recency * 100),
        targetSolvedCount,
        topicMinRating: corpus?.minRating || null,
        topicMedianRating: corpus?.medianRating || null,
        topicMaxRating: corpus?.maxRating || null,
        topicRatedCount: corpus?.ratedCount || 0,
        topicHardRatio: corpus?.hardRatio ? round(corpus.hardRatio, 3) : 0,
        topicFrequencyByBucket: corpus?.frequencyByBucket || {},
        daysSinceLastSolved: Math.round(daysSinceLastSolved),
        masteryScore: Math.round(clamp(mastery, 0, 100)),
        weaknessScore: Math.round(clamp(weakness, 0, 100)),
        lastSolvedAt: topic.lastSolvedAt ? topic.lastSolvedAt.toISOString() : null,
        reason: buildTopicReason(topic, acRate, weakness, abilityScore, evidenceScore, stabilityScore, corpus)
      };
    })
    .filter((topic) => topic.attemptedCount > 0)
    .map((topic) => withTopicStrength(topic))
    .sort(compareTopicStrength);
}

function buildTopicReason(topic, acRate, weakness, abilityScore, evidenceScore, stabilityScore, corpus) {
  if (abilityScore >= 0.60 && stabilityScore < 0.55) {
    return `Năng lực theo độ khó khá tốt, nhưng độ ổn định còn thấp do nhiều bài cần nhiều lần sửa trước khi AC. Nên upsolve và luyện lại các lỗi cài đặt/edge case.`;
  }
  if ((topic.maxSolvedRating || 0) >= 1800 && abilityScore >= 0.55) {
    return `Đã giải được bài ${topic.maxSolvedRating} trong topic này; điểm ưu tiên năng lực theo độ khó, còn bug được xem là độ ổn định cần cải thiện.`;
  }
  if (evidenceScore < 0.45 && (topic.maxSolvedRating || 0) < 1600) {
    return "Dữ liệu topic này còn mỏng hoặc chủ yếu là bài dễ, nên điểm bị giới hạn để tránh đánh giá quá cao.";
  }
  if (topic.attemptedUnsolvedCount >= 3) {
    return `${topic.attemptedUnsolvedCount} bài đã thử nhưng chưa AC; nên upsolve để tăng độ ổn định.`;
  }
  if (topic.tleCount >= 3) {
    return `Có ${topic.tleCount} lần quá thời gian, cần xem lại độ phức tạp hoặc cách cài đặt.`;
  }
  if (acRate < 0.45 && topic.attemptedCount >= 5) {
    const medianText = corpus?.medianRating ? ` Median của topic khoảng ${corpus.medianRating}.` : "";
    return `Tỉ lệ AC thấp (${Math.round(acRate * 100)}%) so với số bài đã thử.${medianText}`;
  }
  if (weakness > 60) {
    return "Chủ đề này nên được đưa vào lộ trình ôn tập.";
  }
  return "Dữ liệu của chủ đề này đang ổn định.";
}

function classifyLearningStage(summary, buckets, topics) {
  const solved1800Plus = buckets
    .filter((bucket) => bucketFloor(bucket.bucket) >= 1800)
    .reduce((sum, bucket) => sum + bucket.solvedCount, 0);
  const solved1400Plus = buckets
    .filter((bucket) => bucketFloor(bucket.bucket) >= 1400)
    .reduce((sum, bucket) => sum + bucket.solvedCount, 0);
  const strongTopicCount = topics.filter((topic) => topic.masteryScore >= 65).length;
  const weakTopicCount = topics.filter((topic) => topic.weaknessScore >= 60).length;

  if (summary.uniqueSolved < 50 || summary.highestSolvedRating < 1100) {
    return {
      stage: "foundation",
      reason: "Số bài AC hoặc độ khó cao nhất vẫn đang ở mức nền tảng."
    };
  }
  if (solved1800Plus >= 20) {
    return {
      stage: "advanced",
      reason: "Đã có độ phủ đáng kể ở nhóm bài 1800+."
    };
  }
  if (solved1400Plus >= 25 && strongTopicCount >= 6 && summary.activeDays30d >= 8) {
    return {
      stage: "contest-ready",
      reason: "Độ phủ tốt ở nhiều chủ đề và vẫn đang luyện đều."
    };
  }
  if (weakTopicCount >= 2 || solved1400Plus >= 10) {
    return {
      stage: "consolidating",
      reason: "Đã vượt mức nền tảng nhưng còn một số chủ đề hoặc nhóm độ khó cần củng cố."
    };
  }
  return {
    stage: "building",
    reason: "Đang mở rộng độ phủ và xây chắc các chủ đề trọng tâm."
  };
}

function dataConfidence(totalSubmissions, uniqueSolved) {
  const submissionConfidence = Math.min(1, Math.log(1 + totalSubmissions) / Math.log(301));
  const solvedConfidence = Math.min(1, Math.log(1 + uniqueSolved) / Math.log(101));
  return round(0.55 * submissionConfidence + 0.45 * solvedConfidence, 2);
}

function buildWeaknessMatrix(topics, statuses) {
  const selectedTopics = topics
    .slice()
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 8)
    .map((topic) => topic.topic);
  const selectedBuckets = ["800-999", "1000-1199", "1200-1399", "1400-1599", "1600-1799", "1800-1999", "2000+"];
  const cells = new Map();

  for (const topic of selectedTopics) {
    for (const bucket of selectedBuckets) {
      cells.set(`${topic}:${bucket}`, {
        topic,
        bucket,
        solved: 0,
        attempted: 0,
        submissionCount: 0,
        wrongCount: 0,
        tleCount: 0,
        solvedWeight: 0,
        attemptedWeight: 0
      });
    }
  }

  for (const status of statuses.values()) {
    const bucket = ratingBucket(status.problem.rating);
    const normalizedBucket = bucket === "2000-2399" || bucket === "2400+" ? "2000+" : bucket;
    const problemTopics = status.problem.topics?.length ? status.problem.topics : normalizeTopics(status.problem.tags || []);
    for (const topic of problemTopics) {
      const cell = cells.get(`${topic}:${normalizedBucket}`);
      if (!cell) continue;
      const credit = topicCredit(topic, problemTopics);
      const effectiveRating = creditedRating(status.problem.rating, credit) || status.problem.rating;
      const weight = difficultyWeight(effectiveRating) * (0.65 + 0.35 * credit);
      cell.attempted += 1;
      cell.attemptedWeight += weight;
      cell.submissionCount += status.submitCount;
      cell.wrongCount += status.wrongSubmitCount * credit;
      cell.tleCount += (status.verdictCounts.TIME_LIMIT_EXCEEDED || 0) * credit;
      if (status.solved) {
        cell.solved += 1;
        cell.solvedWeight += weight;
      }
    }
  }

  return {
    topics: selectedTopics,
    buckets: selectedBuckets,
    cells: [...cells.values()].map((cell) => {
      if (!cell.attempted) {
        return {
          ...cell,
          score: null,
          label: "Chưa có dữ liệu",
          confidence: "none",
          detail: "Bạn chưa thử bài nào ở ô này."
        };
      }

      const failRate = 1 - (cell.solved + 1) / (cell.attempted + 2);
      const difficultyMiss = 1 - (cell.solvedWeight + 1) / (cell.attemptedWeight + 2);
      const errorPressure = (cell.wrongCount + cell.tleCount) / Math.max(1, cell.submissionCount);
      const evidence = clamp(cell.attempted / 5, 0.2, 1);
      const rawScore = 0.55 * failRate + 0.25 * difficultyMiss + 0.20 * clamp(errorPressure, 0, 1);
      const score = Math.round(100 * rawScore * (0.50 + 0.50 * evidence));
      const confidence = cell.attempted >= 5 ? "cao" : cell.attempted >= 3 ? "vừa" : "thấp";
      const label = cell.attempted < 3
        ? "Ít dữ liệu"
        : score >= 70
          ? "Rất cần ôn"
          : score >= 50
            ? "Cần ôn"
            : score >= 30
              ? "Theo dõi"
              : "Ổn";

      return {
        ...cell,
        score,
        confidence,
        label,
        detail: `${cell.solved}/${cell.attempted} bài đã AC. Độ tin cậy ${confidence}.`
      };
    })
  };
}

function buildModelInferenceContext(statuses, submissions, topics, currentRating, now) {
  const recentCutoff = now.getTime() - RECENT_DAYS * MS_PER_DAY;
  const topicsByName = new Map(topics.map((topic) => [topic.topic, topic]));
  const attemptedKeys = new Set([...statuses.keys()]);
  const solvedKeys = new Set([...statuses.values()].filter((status) => status.solved).map((status) => status.key));
  const bucketStats = new Map();
  const topicBucketStats = new Map();
  let totalSolved = 0;
  let lastSolveTime = null;

  for (const status of statuses.values()) {
    const bucket = ratingBucket(status.problem.rating);
    const problemTopics = status.problem.topics?.length ? status.problem.topics : normalizeTopics(status.problem.tags || []);
    const mainTopic = primaryTopic(problemTopics);
    const bucketItem = ensureStats(bucketStats, bucket);
    const pairItem = ensureStats(topicBucketStats, `${mainTopic}:${bucket}`);

    bucketItem.attempted += 1;
    bucketItem.submissions += status.submitCount;
    bucketItem.wrong += status.wrongSubmitCount;
    bucketItem.tle += status.verdictCounts.TIME_LIMIT_EXCEEDED || 0;

    pairItem.attempted += 1;
    pairItem.submissions += status.submitCount;
    pairItem.wrong += status.wrongSubmitCount;
    pairItem.tle += status.verdictCounts.TIME_LIMIT_EXCEEDED || 0;

    if (status.solved) {
      totalSolved += 1;
      bucketItem.solved += 1;
      pairItem.solved += 1;
      if (!lastSolveTime || status.solvedAt > lastSolveTime) lastSolveTime = status.solvedAt;
    }
  }

  const totalSubmissions = submissions.length || [...statuses.values()].reduce((sum, status) => sum + status.submitCount, 0);
  const totalWrong = submissions.length
    ? submissions.filter((submission) => submission.verdict !== "OK").length
    : [...statuses.values()].reduce((sum, status) => sum + status.wrongSubmitCount, 0);
  const totalTle = submissions.length
    ? submissions.filter((submission) => submission.verdict === "TIME_LIMIT_EXCEEDED").length
    : [...statuses.values()].reduce((sum, status) => sum + (status.verdictCounts.TIME_LIMIT_EXCEEDED || 0), 0);
  const recentSubmissions = submissions.filter((submission) => (submission.creationTimeSeconds || 0) * 1000 >= recentCutoff).length;
  const recentSolved = [...statuses.values()].filter((status) => status.solvedAt && status.solvedAt.getTime() >= recentCutoff).length;

  return {
    now,
    xgbEnabled: Boolean(getXgbModelBundle()),
    targetRating: currentRating || 1000,
    topicsByName,
    attemptedKeys,
    solvedKeys,
    bucketStats,
    topicBucketStats,
    totalSubmissions,
    totalAttempted: statuses.size,
    totalSolved,
    totalWrong,
    totalTle,
    recentSubmissions,
    recentSolved,
    daysSinceLastSolve: lastSolveTime ? Math.max(0, (now - lastSolveTime) / MS_PER_DAY) : 999
  };
}

function ensureStats(map, key) {
  if (!map.has(key)) {
    map.set(key, {
      attempted: 0,
      solved: 0,
      wrong: 0,
      tle: 0,
      submissions: 0
    });
  }
  return map.get(key);
}

function buildXgbFeatureMap(problem, context) {
  const topics = problem.topics || [];
  const bucket = ratingBucket(problem.rating);
  const mainTopic = primaryTopic(topics);
  const matchedTopics = topics.map((topic) => context.topicsByName.get(topic)).filter(Boolean);
  const bucketItem = context.bucketStats.get(bucket) || {};
  const pairItem = context.topicBucketStats.get(`${mainTopic}:${bucket}`) || {};
  const topicAttempted = matchedTopics.map((topic) => topic.attemptedCount || 0);
  const topicSolved = matchedTopics.map((topic) => topic.solvedCount || 0);
  const topicAcRates = matchedTopics.map((topic) => smoothedRate(topic.solvedCount || 0, topic.attemptedCount || 0));
  const topicWrongPressures = matchedTopics.map((topic) => safeNumber(topic.weightedWrongCount ?? topic.wrongCount, 0) / Math.max(1, topic.submissionCount || 0));
  const topicTlePressures = matchedTopics.map((topic) => safeNumber(topic.weightedTleCount ?? topic.tleCount, 0) / Math.max(1, topic.submissionCount || 0));
  const topicDaysSince = matchedTopics.map((topic) => safeNumber(topic.daysSinceLastSolved, 999));
  const ratingGap = (problem.rating || context.targetRating) - context.targetRating;
  const features = {
    user_rating_at_t: context.targetRating,
    problem_rating: problem.rating || context.targetRating,
    rating_gap: ratingGap,
    abs_rating_gap: Math.abs(ratingGap),
    problem_solved_count: problem.solvedCount || 0,
    problem_solved_count_log: Math.log1p(problem.solvedCount || 0),
    problem_topic_count: topics.length,
    primary_topic_credit: topicBaseCredit(mainTopic),
    total_submissions_before: context.totalSubmissions,
    total_attempted_before: context.totalAttempted,
    total_solved_before: context.totalSolved,
    overall_ac_rate_before: smoothedRate(context.totalSolved, context.totalAttempted),
    overall_wrong_pressure_before: context.totalWrong / Math.max(1, context.totalSubmissions),
    overall_tle_pressure_before: context.totalTle / Math.max(1, context.totalSubmissions),
    recent_submissions_30d: context.recentSubmissions,
    recent_solved_30d: context.recentSolved,
    days_since_last_solve: context.daysSinceLastSolve,
    topic_attempted_sum: topicAttempted.reduce((sum, value) => sum + value, 0),
    topic_attempted_max: Math.max(0, ...topicAttempted),
    topic_solved_sum: topicSolved.reduce((sum, value) => sum + value, 0),
    topic_solved_max: Math.max(0, ...topicSolved),
    topic_ac_rate_mean: averageFraction(topicAcRates),
    topic_ac_rate_max: Math.max(0, ...topicAcRates),
    topic_solved_weight_max: Math.max(0, ...matchedTopics.map((topic) => topic.solvedDifficultyWeight || 0)),
    topic_attempted_weight_max: Math.max(0, ...matchedTopics.map((topic) => topic.attemptedDifficultyWeight || 0)),
    topic_max_solved_rating_max: Math.max(0, ...matchedTopics.map((topic) => topic.maxSolvedRating || 0)),
    topic_avg_solved_rating_max: Math.max(0, ...matchedTopics.map((topic) => topic.avgSolvedRating || 0)),
    topic_wrong_pressure_mean: averageFraction(topicWrongPressures),
    topic_tle_pressure_mean: averageFraction(topicTlePressures),
    topic_days_since_solve_min: Math.min(999, ...topicDaysSince),
    bucket_attempted_before: bucketItem.attempted || 0,
    bucket_solved_before: bucketItem.solved || 0,
    bucket_ac_rate_before: smoothedRate(bucketItem.solved || 0, bucketItem.attempted || 0),
    bucket_wrong_pressure_before: (bucketItem.wrong || 0) / Math.max(1, bucketItem.submissions || 0),
    bucket_tle_pressure_before: (bucketItem.tle || 0) / Math.max(1, bucketItem.submissions || 0),
    pfa_success_topic_bucket: pairItem.solved || 0,
    pfa_fail_topic_bucket: Math.max(0, (pairItem.attempted || 0) - (pairItem.solved || 0))
  };

  for (const topic of topics) {
    features[featureName("topic", topic)] = 1;
  }
  features[featureName("bucket", bucket)] = 1;
  return features;
}

function pickFeaturePreview(features) {
  const keys = [
    "user_rating_at_t",
    "problem_rating",
    "rating_gap",
    "overall_ac_rate_before",
    "topic_ac_rate_mean",
    "topic_max_solved_rating_max",
    "bucket_ac_rate_before",
    "pfa_success_topic_bucket",
    "pfa_fail_topic_bucket"
  ];
  return Object.fromEntries(keys.map((key) => [key, round(safeNumber(features[key], 0), 3)]));
}

function predictAcProbability(problem, context) {
  const xgbFeatures = context.xgbEnabled ? buildXgbFeatureMap(problem, context) : null;
  const xgbPrediction = xgbFeatures ? xgbPredictProbability(xgbFeatures) : null;
  if (xgbPrediction) {
    return {
      ...xgbPrediction,
      features: pickFeaturePreview(xgbFeatures)
    };
  }

  const {
    topicsByName,
    manualMatch,
    targetRating,
    maxSolvedCount,
    attemptedKeys
  } = context;
  const matchedTopics = (problem.topics || [])
    .map((topic) => topicsByName.get(topic))
    .filter(Boolean);
  const fallbackAbility = clamp((targetRating - 800) / 1800, 0.25, 0.65);

  const topicAbility = matchedTopics.length
    ? Math.max(...matchedTopics.map((topic) => percentFeature(topic.abilityScore, fallbackAbility)))
    : fallbackAbility;
  const topicStability = matchedTopics.length
    ? averageFraction(matchedTopics.map((topic) => percentFeature(topic.stabilityScore, 0.5)))
    : 0.5;
  const topicEvidence = matchedTopics.length
    ? Math.max(...matchedTopics.map((topic) => percentFeature(topic.evidenceScore, 0.35)))
    : 0.35;
  const topicWeakness = matchedTopics.length
    ? Math.max(...matchedTopics.map((topic) => percentFeature(topic.weaknessScore, 0.55)))
    : 0.55;

  const ratingGap = clamp((problem.rating - targetRating) / 800, -1.5, 1.5);
  const problemQuality = clamp(Math.log(1 + (problem.solvedCount || 0)) / Math.log(1 + maxSolvedCount), 0, 1);
  const attemptedBefore = attemptedKeys.has(problem.key) ? 1 : 0;
  const stretchPenalty = problem.rating > targetRating + 250 ? 1 : 0;

  const features = {
    ratingGap,
    topicAbility,
    topicStability,
    topicEvidence,
    topicWeakness,
    problemQuality,
    manualGoal: manualMatch ? 1 : 0,
    attemptedBefore,
    stretchPenalty
  };

  const coefficients = LOGISTIC_PFA_MODEL.coefficients;
  const z = Object.entries(features).reduce(
    (sum, [key, value]) => sum + (coefficients[key] || 0) * value,
    LOGISTIC_PFA_MODEL.intercept
  );
  const rawProbability = sigmoid(z);
  const acProbability = calibrateProbability(rawProbability);

  return {
    rawProbability: round(rawProbability, 3),
    acProbability: round(acProbability, 3),
    features: Object.fromEntries(Object.entries(features).map(([key, value]) => [key, round(value, 3)]))
  };
}

function averageFraction(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return 0;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function buildRecommendations(problemMap, statuses, topics, currentRating, manualGoals = [], inferenceContext = null) {
  const solvedKeys = new Set([...statuses.values()].filter((status) => status.solved).map((status) => status.key));
  const attemptedKeys = new Set([...statuses.keys()]);
  const topicsByName = new Map(topics.map((topic) => [topic.topic, topic]));
  const validTopics = new Set([...problemMap.values()].flatMap((problem) => problem.topics || []));
  const modelContext = inferenceContext || {
    xgbEnabled: false,
    topicsByName,
    attemptedKeys,
    targetRating: currentRating || 1000
  };
  const manualGoalTopics = normalizeManualGoals(manualGoals, validTopics);
  const weakTopics = topics
    .slice()
    .filter((topic) => topic.weaknessScore >= MIN_IMPROVEMENT_WEAKNESS)
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5);
  const weakTopicWeights = new Map(weakTopics.map((topic, index) => [topic.topic, 1 - index * 0.12]));
  for (const goal of manualGoalTopics) {
    weakTopicWeights.set(goal.topic, Math.max(weakTopicWeights.get(goal.topic) || 0, 1.05));
  }
  if (!weakTopicWeights.size) return [];
  const maxSolvedCount = Math.max(1, ...[...problemMap.values()].map((problem) => problem.solvedCount || 0));
  const targetRating = currentRating || 1000;

  const candidates = [];
  for (const problem of problemMap.values()) {
    if (solvedKeys.has(problem.key)) continue;
    if (!problem.rating || !problem.topics?.length) continue;
    const manualMatch = manualGoalTopics.find((goal) => problem.topics.includes(goal.topic));
    const maxCandidateRating = manualMatch ? targetRating + 600 : targetRating + 300;
    if (problem.rating < Math.max(800, targetRating - 400) || problem.rating > maxCandidateRating) continue;

    const topicFit = Math.max(0, ...problem.topics.map((topic) => weakTopicWeights.get(topic) || 0));
    if (topicFit <= 0 && weakTopicWeights.size > 0) continue;

    const difficultyFit = Math.exp(-((problem.rating - targetRating) ** 2) / (2 * 250 ** 2));
    const quality = Math.log(1 + (problem.solvedCount || 0)) / Math.log(1 + maxSolvedCount);
    const novelty = attemptedKeys.has(problem.key) ? 0.55 : 1;
    const prediction = predictAcProbability(problem, {
      ...modelContext,
      topicsByName,
      manualMatch,
      targetRating,
      maxSolvedCount,
      attemptedKeys
    });
    const probabilityFit = 1 - Math.min(1, Math.abs(prediction.acProbability - 0.62) / 0.62);
    const score = (
      0.32 * topicFit
      + 0.25 * difficultyFit
      + 0.15 * quality
      + 0.10 * novelty
      + 0.13 * probabilityFit
      + 0.05 * (manualMatch ? 1 : 0)
    );

    candidates.push({
      key: problem.key,
      name: problem.name,
      contestId: problem.contestId,
      index: problem.index,
      rating: problem.rating,
      tags: problem.tags || [],
      topics: problem.topics || [],
      solvedCount: problem.solvedCount || 0,
      url: problem.url,
      difficultyLevel: difficultyLevel(problem.rating, targetRating),
      difficultyLabel: difficultyLabel(difficultyLevel(problem.rating, targetRating)),
      score: round(score, 4),
      acProbability: prediction.acProbability,
      rawAcProbability: prediction.rawProbability,
      modelFeatures: prediction.features,
      modelSource: prediction.modelSource || "logistic-baseline",
      source: manualMatch ? "manual" : "auto",
      reason: recommendationReason(problem, weakTopics, manualGoalTopics, targetRating)
    });
  }

  return selectDiverse(candidates.sort((a, b) => b.score - a.score), 16);
}

function difficultyLevel(problemRating, userRating) {
  if (problemRating <= userRating - 150) return "warm-up";
  if (problemRating <= userRating + 100) return "core";
  return "stretch";
}

function difficultyLabel(level) {
  if (level === "warm-up") return "khởi động";
  if (level === "core") return "trọng tâm";
  return "thử thách";
}

function recommendationReason(problem, weakTopics, manualGoals, targetRating) {
  const manual = manualGoals.find((goal) => problem.topics.includes(goal.topic));
  const matched = weakTopics.find((topic) => problem.topics.includes(topic.topic));
  const label = difficultyLabel(difficultyLevel(problem.rating, targetRating));
  if (manual) {
    return `Khớp mục tiêu tự thêm "${manual.label || manual.topic}" và nằm ở mức ${label}.`;
  }
  if (matched) {
    return `Khớp chủ đề đang yếu "${matched.topic}" và nằm ở mức ${label}.`;
  }
  return `Độ khó phù hợp với mức hiện tại và có nhiều người đã AC.`;
}

function jaccard(a, b) {
  const left = new Set(a);
  const right = new Set(b);
  const intersection = [...left].filter((item) => right.has(item)).length;
  const union = new Set([...left, ...right]).size || 1;
  return intersection / union;
}

function selectDiverse(candidates, limit) {
  const selected = [];
  const remaining = [...candidates];

  while (selected.length < limit && remaining.length) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const similarity = selected.length
        ? Math.max(...selected.map((item) => jaccard(item.topics, candidate.topics)))
        : 0;
      const mmr = 0.75 * candidate.score - 0.25 * similarity;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestIndex = index;
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected;
}

function applyModelTopicScores(topics, problemMap, inferenceContext, currentRating) {
  if (!inferenceContext?.xgbEnabled) return topics;

  const maxSolvedCount = Math.max(1, ...[...problemMap.values()].map((problem) => problem.solvedCount || 0));
  const targetRating = currentRating || 1000;

  return topics
    .map((topic) => {
      const benchmark = selectTopicBenchmarkProblems(problemMap, topic.topic, inferenceContext.solvedKeys, targetRating);
      if (benchmark.length < 5) return topic;

      const predictions = benchmark
        .map((problem) => predictAcProbability(problem, {
          ...inferenceContext,
          maxSolvedCount,
          manualMatch: null,
          targetRating
        }).acProbability)
        .filter((value) => Number.isFinite(value));
      if (!predictions.length) return topic;

      const modelAbility = averageFraction(predictions);
      const modelAbilityScore = Math.round(modelAbility * 100);
      const modelMastery = 100 * (
        0.60 * modelAbility
        + 0.16 * percentFeature(topic.stabilityScore, 0.5)
        + 0.14 * percentFeature(topic.evidenceScore, 0.4)
        + 0.10 * percentFeature(topic.difficultyScore, 0.4)
      );
      const blendedMastery = 0.55 * topic.masteryScore + 0.45 * modelMastery;
      const blendedWeakness = 0.60 * topic.weaknessScore + 0.40 * (100 - modelMastery);
      const blendedAbility = 0.65 * topic.abilityScore + 0.35 * modelAbilityScore;
      const updatedTopic = {
        ...topic,
        abilityScore: Math.round(clamp(blendedAbility, 0, 100)),
        modelAbilityScore,
        modelMasteryScore: Math.round(clamp(modelMastery, 0, 100)),
        modelSampleSize: benchmark.length,
        modelSource: "xgboost",
        masteryScore: Math.round(clamp(blendedMastery, 0, 100)),
        weaknessScore: Math.round(clamp(blendedWeakness, 0, 100)),
        reason: `${topic.reason} AI benchmark ${benchmark.length} bài dự đoán P_AC trung bình ${Math.round(modelAbility * 100)}%.`
      };

      return withTopicStrength(updatedTopic);
    })
    .map((topic) => topic.strengthScore !== undefined ? topic : withTopicStrength(topic))
    .sort(compareTopicStrength);
}

function selectTopicBenchmarkProblems(problemMap, topic, solvedKeys, currentRating) {
  const lower = Math.max(800, currentRating - 500);
  const upper = currentRating + 650;
  const center = currentRating + 100;
  const relevant = [...problemMap.values()]
    .filter((problem) => problem.rating && problem.topics?.includes(topic))
    .filter((problem) => problem.rating >= lower && problem.rating <= upper);
  const unsolved = relevant.filter((problem) => !solvedKeys.has(problem.key));
  const pool = unsolved.length >= 8 ? unsolved : relevant;

  return pool
    .slice()
    .sort((a, b) => {
      const left = Math.abs(a.rating - center) - Math.log1p(a.solvedCount || 0) * 12;
      const right = Math.abs(b.rating - center) - Math.log1p(b.solvedCount || 0) * 12;
      return left - right;
    })
    .slice(0, 32);
}

function normalizeManualGoals(manualGoals = [], validTopics = null) {
  const seen = new Set();
  return manualGoals
    .map((goal) => ({
      label: String(goal.label || goal.topic || "").trim(),
      topic: String(goal.topic || goal.label || "").trim()
    }))
    .filter((goal) => goal.topic)
    .filter((goal) => !validTopics || validTopics.has(goal.topic))
    .filter((goal) => {
      const key = goal.topic.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildLearningPath(topics, recommendations, manualGoals = []) {
  const topicsWithRecommendations = new Set(
    recommendations.flatMap((problem) => problem.topics || [])
  );
  const targetTopics = topics
    .slice()
    .filter((topic) => topic.weaknessScore >= MIN_IMPROVEMENT_WEAKNESS)
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .filter((topic) => topicsWithRecommendations.has(topic.topic))
    .slice(0, 4);

  const items = targetTopics.map((topic, index) => {
    const topicRecommendations = recommendations
      .filter((problem) => problem.topics.includes(topic.topic))
      .slice(0, 4);

    return {
      order: index + 1,
      topic: topic.topic,
      targetBucket: topic.avgSolvedRating ? ratingBucket(topic.avgSolvedRating + 100) : "vùng phù hợp",
      targetProblemCount: topic.weaknessScore >= 65 ? 6 : 4,
      priorityScore: topic.weaknessScore,
      reason: topic.reason,
      recommendations: topicRecommendations,
      source: "auto"
    };
  });

  const included = new Set(items.map((item) => item.topic));
  for (const goal of normalizeManualGoals(manualGoals)) {
    if (included.has(goal.topic)) continue;
    const knownTopic = topics.find((topic) => topic.topic === goal.topic);
    const topicRecommendations = recommendations
      .filter((problem) => problem.topics.includes(goal.topic))
      .slice(0, 4);

    items.push({
      order: items.length + 1,
      topic: goal.topic,
      targetBucket: knownTopic?.avgSolvedRating ? ratingBucket(knownTopic.avgSolvedRating + 100) : "vùng phù hợp",
      targetProblemCount: 4,
      priorityScore: 100,
      reason: `Mục tiêu tự thêm: ${goal.label || goal.topic}.`,
      recommendations: topicRecommendations,
      source: "manual"
    });
    included.add(goal.topic);
  }

  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

function buildSummary(profile, submissions, statuses, now) {
  const totalSubmissions = submissions.length;
  const okSubmissions = submissions.filter((submission) => submission.verdict === "OK").length;
  const uniqueSolved = [...statuses.values()].filter((status) => status.solved).length;
  const uniqueAttempted = statuses.size;
  const attemptedUnsolvedCount = uniqueAttempted - uniqueSolved;
  const recentCutoff = now.getTime() - RECENT_DAYS * MS_PER_DAY;
  const today = localDateKey(now);
  const weekStart = new Date(now);
  const weekDay = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - weekDay);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const activeDays = new Set();
  const activeDaysThisWeek = new Set();
  const activeDaysThisMonth = new Set();
  const solvedTodayKeys = new Set();
  const solvedThisWeekKeys = new Set();
  const solvedThisMonthKeys = new Set();
  const solvedLast30dKeys = new Set();
  let solved30d = 0;
  let submissionsToday = 0;
  let submissionsThisWeek = 0;
  let submissionsThisMonth = 0;
  let submissionsLast30d = 0;
  let okSubmissionsToday = 0;
  let okSubmissionsThisWeek = 0;
  let okSubmissionsThisMonth = 0;
  let okSubmissionsLast30d = 0;
  let highestSolvedRating = 0;

  for (const status of statuses.values()) {
    if (status.solved && status.problem.rating) {
      highestSolvedRating = Math.max(highestSolvedRating, status.problem.rating);
    }
    if (status.solvedAt && status.solvedAt.getTime() >= recentCutoff) {
      solved30d += 1;
    }
  }

  for (const submission of submissions) {
    const submittedAt = new Date((submission.creationTimeSeconds || 0) * 1000);
    const submittedDay = localDateKey(submittedAt);
    const isToday = submittedDay === today;
    const isThisWeek = submittedAt >= weekStart;
    const isThisMonth = submittedAt >= monthStart;
    const isLast30d = submittedAt.getTime() >= recentCutoff;
    const isAccepted = submission.verdict === "OK";
    const key = problemKey(submission.problem);

    if (isToday) {
      submissionsToday += 1;
    }
    if (isThisWeek) {
      submissionsThisWeek += 1;
      activeDaysThisWeek.add(submittedDay);
    }
    if (isThisMonth) {
      submissionsThisMonth += 1;
      activeDaysThisMonth.add(submittedDay);
    }
    if (isLast30d) {
      submissionsLast30d += 1;
      activeDays.add(submittedDay);
    }

    if (isAccepted) {
      if (isToday) okSubmissionsToday += 1;
      if (isThisWeek) okSubmissionsThisWeek += 1;
      if (isThisMonth) okSubmissionsThisMonth += 1;
      if (isLast30d) okSubmissionsLast30d += 1;
      if (key && isToday) solvedTodayKeys.add(key);
      if (key && isThisWeek) solvedThisWeekKeys.add(key);
      if (key && isThisMonth) solvedThisMonthKeys.add(key);
      if (key && isLast30d) solvedLast30dKeys.add(key);
    }
  }

  return {
    handle: profile.handle,
    rating: profile.rating || null,
    maxRating: profile.maxRating || null,
    rank: profile.rank || "unrated",
    maxRank: profile.maxRank || "unrated",
    avatar: profile.avatar || null,
    contribution: profile.contribution ?? null,
    friendOfCount: profile.friendOfCount ?? null,
    totalSubmissions,
    okSubmissions,
    uniqueSolved,
    uniqueAttempted,
    attemptedUnsolvedCount,
    acRate: totalSubmissions ? round(okSubmissions / totalSubmissions, 3) : 0,
    activeDays30d: activeDays.size,
    activeDaysThisWeek: activeDaysThisWeek.size,
    activeDaysThisMonth: activeDaysThisMonth.size,
    solvedToday: solvedTodayKeys.size,
    solvedThisWeek: solvedThisWeekKeys.size,
    solvedThisMonth: solvedThisMonthKeys.size,
    solvedLast30d: solvedLast30dKeys.size,
    submissionsToday,
    submissionsThisWeek,
    submissionsThisMonth,
    submissionsLast30d,
    okSubmissionsToday,
    okSubmissionsThisWeek,
    okSubmissionsThisMonth,
    okSubmissionsLast30d,
    solved30d,
    highestSolvedRating,
    dataConfidence: dataConfidence(totalSubmissions, uniqueSolved)
  };
}

function buildRatingCharts(ratingChanges) {
  const sorted = [...ratingChanges].sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
  return {
    ratingHistory: sorted.map((change) => ({
      contestId: change.contestId,
      contestName: change.contestName,
      date: dateKey((change.ratingUpdateTimeSeconds || 0) * 1000),
      rating: change.newRating,
      oldRating: change.oldRating,
      delta: change.newRating - change.oldRating,
      rank: change.rank
    })),
    contestDeltas: sorted.slice(-20).map((change) => ({
      contestId: change.contestId,
      label: String(change.contestId),
      delta: change.newRating - change.oldRating,
      rating: change.newRating
    }))
  };
}

function attemptedUnsolvedList(statuses) {
  return [...statuses.values()]
    .filter((status) => !status.solved)
    .sort((a, b) => b.lastTriedAt - a.lastTriedAt)
    .slice(0, 20)
    .map((status) => ({
      key: status.key,
      name: status.problem.name,
      rating: status.problem.rating || null,
      tags: status.problem.tags || [],
      topics: status.problem.topics || [],
      attempts: status.submitCount,
      lastTriedAt: status.lastTriedAt ? status.lastTriedAt.toISOString() : null,
      mainVerdict: Object.entries(status.verdictCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "UNKNOWN",
      url: status.problem.url
    }));
}

function analyzeProfile({ profile, submissions, ratingChanges, problemset, manualGoals = [] }) {
  const now = new Date();
  const problemMap = buildProblemMap(problemset);
  const validManualTopics = new Set([...problemMap.values()].flatMap((problem) => problem.topics || []));
  const normalizedManualGoals = normalizeManualGoals(manualGoals, validManualTopics);
  const topicCorpusStats = buildTopicCorpusStats(problemMap);
  const statuses = buildProblemStatuses(submissions, problemMap);
  const summary = buildSummary(profile, submissions, statuses, now);
  const currentRating = getEstimatedRating(profile, statuses);
  const buckets = aggregateBuckets(statuses);
  const inferenceContext = buildModelInferenceContext(statuses, submissions, [], currentRating, now);
  let topics = aggregateTopics(statuses, now, topicCorpusStats, currentRating);
  inferenceContext.topicsByName = new Map(topics.map((topic) => [topic.topic, topic]));
  topics = applyModelTopicScores(topics, problemMap, inferenceContext, currentRating);
  topics = applyRelatedTopicEvidence(topics);
  inferenceContext.topicsByName = new Map(topics.map((topic) => [topic.topic, topic]));
  const stage = classifyLearningStage(summary, buckets, topics);
  const submissionCharts = aggregateSubmissionCharts(submissions);
  const ratingCharts = buildRatingCharts(ratingChanges || []);
  const recommendations = buildRecommendations(problemMap, statuses, topics, currentRating, normalizedManualGoals, inferenceContext);
  const learningPath = buildLearningPath(topics, recommendations, normalizedManualGoals);
  const weaknessMatrix = buildWeaknessMatrix(topics, statuses);

  return {
    generatedAt: now.toISOString(),
    profile: {
      handle: profile.handle,
      avatar: profile.avatar,
      rating: profile.rating || null,
      maxRating: profile.maxRating || null,
      rank: profile.rank || "unrated",
      maxRank: profile.maxRank || "unrated",
      contribution: profile.contribution ?? null,
      friendOfCount: profile.friendOfCount ?? null,
      lastOnlineAt: profile.lastOnlineTimeSeconds ? new Date(profile.lastOnlineTimeSeconds * 1000).toISOString() : null,
      registeredAt: profile.registrationTimeSeconds ? new Date(profile.registrationTimeSeconds * 1000).toISOString() : null
    },
    summary: {
      ...summary,
      estimatedRating: currentRating,
      learningStage: stage.stage,
      learningStageReason: stage.reason
    },
    charts: {
      ...submissionCharts,
      ...ratingCharts,
      weaknessMatrix
    },
    buckets,
    topics,
    weaknesses: topics
      .slice()
      .filter((topic) => topic.weaknessScore >= MIN_IMPROVEMENT_WEAKNESS)
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 10),
    strengths: topics
      .slice()
      .sort(compareTopicStrength)
      .slice(0, 10),
    model: modelInfo(),
    attemptedUnsolved: attemptedUnsolvedList(statuses),
    learningPath,
    recommendations
  };
}

window.CfAnalytics = {
  analyzeProfile
};
