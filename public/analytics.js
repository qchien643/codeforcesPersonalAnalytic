const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 30;
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

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function dateKey(input) {
  return new Date(input).toISOString().slice(0, 10);
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
    if (!tag || tag === "*special") continue;
    topics.add(TOPIC_MAP.get(tag) || tag);
  }
  return [...topics];
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

function aggregateTopics(statuses, now) {
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
          solvedAfterFailCount: 0,
          ratingSum: 0,
          ratedSolvedCount: 0,
          lastSolvedAt: null,
          verdictCounts: {}
        });
      }

      const item = topics.get(topic);
      item.attemptedCount += 1;
      item.submissionCount += status.submitCount;
      item.wrongCount += status.wrongSubmitCount;
      item.tleCount += status.verdictCounts.TIME_LIMIT_EXCEEDED || 0;

      for (const [verdict, count] of Object.entries(status.verdictCounts)) {
        item.verdictCounts[verdict] = (item.verdictCounts[verdict] || 0) + count;
      }

      if (status.solved) {
        item.solvedCount += 1;
        if (status.problem.rating) {
          item.ratingSum += status.problem.rating;
          item.ratedSolvedCount += 1;
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
      const acRate = (topic.solvedCount + 1) / (topic.attemptedCount + 2);
      const targetSolvedCount = topic.topic.includes("advanced") || topic.topic.includes("flows") ? 8 : 12;
      const coverage = 1 - Math.exp(-topic.solvedCount / targetSolvedCount);
      const daysSinceLastSolved = topic.lastSolvedAt ? Math.max(0, (now - topic.lastSolvedAt) / MS_PER_DAY) : 365;
      const recency = 2 ** (-daysSinceLastSolved / 30);
      const recovery = topic.solvedAfterFailCount / Math.max(1, topic.solvedAfterFailCount + topic.attemptedUnsolvedCount);
      const mastery = 100 * (0.4 * coverage + 0.25 * acRate + 0.2 * recency + 0.15 * recovery);
      const attemptedUnsolvedRatio = topic.attemptedUnsolvedCount / Math.max(1, topic.attemptedCount);
      const errorPressure = (topic.wrongCount + topic.tleCount) / Math.max(1, topic.submissionCount);
      const staleness = 1 - recency;
      const weakness = 100 * (0.35 * (1 - mastery / 100) + 0.25 * attemptedUnsolvedRatio + 0.2 * errorPressure + 0.2 * staleness);

      return {
        ...topic,
        acRate: round(acRate, 3),
        avgSolvedRating: topic.ratedSolvedCount ? Math.round(topic.ratingSum / topic.ratedSolvedCount) : null,
        daysSinceLastSolved: Math.round(daysSinceLastSolved),
        masteryScore: Math.round(clamp(mastery, 0, 100)),
        weaknessScore: Math.round(clamp(weakness, 0, 100)),
        lastSolvedAt: topic.lastSolvedAt ? topic.lastSolvedAt.toISOString() : null,
        reason: buildTopicReason(topic, acRate, weakness)
      };
    })
    .filter((topic) => topic.attemptedCount > 0)
    .sort((a, b) => b.masteryScore - a.masteryScore);
}

function buildTopicReason(topic, acRate, weakness) {
  if (topic.attemptedUnsolvedCount >= 3) {
    return `${topic.attemptedUnsolvedCount} bài đã thử nhưng chưa AC.`;
  }
  if (topic.tleCount >= 3) {
    return `Có ${topic.tleCount} lần quá thời gian, cần xem lại độ phức tạp hoặc cách cài đặt.`;
  }
  if (acRate < 0.45 && topic.attemptedCount >= 5) {
    return `Tỉ lệ AC thấp (${Math.round(acRate * 100)}%) so với số bài đã thử.`;
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
        attempted: 0
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
      cell.attempted += 1;
      if (status.solved) cell.solved += 1;
    }
  }

  return {
    topics: selectedTopics,
    buckets: selectedBuckets,
    cells: [...cells.values()].map((cell) => ({
      ...cell,
      score: cell.attempted ? Math.round(100 * (1 - (cell.solved + 1) / (cell.attempted + 2))) : 0
    }))
  };
}

function buildRecommendations(problemMap, statuses, topics, currentRating) {
  const solvedKeys = new Set([...statuses.values()].filter((status) => status.solved).map((status) => status.key));
  const attemptedKeys = new Set([...statuses.keys()]);
  const weakTopics = topics
    .slice()
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5);
  const weakTopicWeights = new Map(weakTopics.map((topic, index) => [topic.topic, 1 - index * 0.12]));
  const maxSolvedCount = Math.max(1, ...[...problemMap.values()].map((problem) => problem.solvedCount || 0));
  const targetRating = currentRating || 1000;

  const candidates = [];
  for (const problem of problemMap.values()) {
    if (solvedKeys.has(problem.key)) continue;
    if (!problem.rating || !problem.topics?.length) continue;
    if (problem.rating < Math.max(800, targetRating - 400) || problem.rating > targetRating + 300) continue;

    const topicFit = Math.max(0, ...problem.topics.map((topic) => weakTopicWeights.get(topic) || 0));
    if (topicFit <= 0 && weakTopics.length > 0) continue;

    const difficultyFit = Math.exp(-((problem.rating - targetRating) ** 2) / (2 * 250 ** 2));
    const quality = Math.log(1 + (problem.solvedCount || 0)) / Math.log(1 + maxSolvedCount);
    const novelty = attemptedKeys.has(problem.key) ? 0.55 : 1;
    const score = 0.35 * topicFit + 0.3 * difficultyFit + 0.15 * quality + 0.1 * novelty + 0.1;

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
      reason: recommendationReason(problem, weakTopics, targetRating)
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

function recommendationReason(problem, weakTopics, targetRating) {
  const matched = weakTopics.find((topic) => problem.topics.includes(topic.topic));
  const label = difficultyLabel(difficultyLevel(problem.rating, targetRating));
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

function buildLearningPath(topics, recommendations) {
  const targetTopics = topics
    .slice()
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 4);

  return targetTopics.map((topic, index) => {
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
      recommendations: topicRecommendations
    };
  });
}

function buildSummary(profile, submissions, statuses, now) {
  const totalSubmissions = submissions.length;
  const okSubmissions = submissions.filter((submission) => submission.verdict === "OK").length;
  const uniqueSolved = [...statuses.values()].filter((status) => status.solved).length;
  const uniqueAttempted = statuses.size;
  const attemptedUnsolvedCount = uniqueAttempted - uniqueSolved;
  const recentCutoff = now.getTime() - RECENT_DAYS * MS_PER_DAY;
  const activeDays = new Set();
  let solved30d = 0;
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
    if (submittedAt.getTime() >= recentCutoff) {
      activeDays.add(dateKey(submittedAt));
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

function analyzeProfile({ profile, submissions, ratingChanges, problemset }) {
  const now = new Date();
  const problemMap = buildProblemMap(problemset);
  const statuses = buildProblemStatuses(submissions, problemMap);
  const summary = buildSummary(profile, submissions, statuses, now);
  const currentRating = getEstimatedRating(profile, statuses);
  const buckets = aggregateBuckets(statuses);
  const topics = aggregateTopics(statuses, now);
  const stage = classifyLearningStage(summary, buckets, topics);
  const submissionCharts = aggregateSubmissionCharts(submissions);
  const ratingCharts = buildRatingCharts(ratingChanges || []);
  const recommendations = buildRecommendations(problemMap, statuses, topics, currentRating);
  const learningPath = buildLearningPath(topics, recommendations);
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
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 8),
    strengths: topics
      .slice()
      .sort((a, b) => b.masteryScore - a.masteryScore)
      .slice(0, 8),
    attemptedUnsolved: attemptedUnsolvedList(statuses),
    learningPath,
    recommendations
  };
}

window.CfAnalytics = {
  analyzeProfile
};
