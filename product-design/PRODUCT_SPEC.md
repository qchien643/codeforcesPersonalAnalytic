# Đặc tả sản phẩm - Phân tích học tập Codeforces cá nhân

## 1. Mục tiêu sản phẩm

Xay dung mot dashboard ca nhan giup mot nguoi hoc competitive programming hieu tinh hinh hien tai cua minh dua tren Codeforces handle.

Nguoi dung nhap handle, he thong lay du lieu cong khai tu Codeforces API, phan tich submissions/rating/problems, sau do tra ve:

- Current status.
- Topic mastery.
- Weakness diagnosis.
- Rating bucket coverage.
- Activity and contest trend.
- Learning path 7/30 ngay.
- Recommended problems.

San pham khong nop bai, khong cham code va khong thay the Codeforces. User van luyen tren Codeforces, sau do sync lai de cap nhat dashboard.

## 2. Luồng người dùng chính

1. User mo dashboard.
2. User nhap Codeforces handle.
3. System validate handle bang `user.info`.
4. System đọc problemset từ `public/data.js`.
5. System fetch dữ liệu cá nhân:
   - `user.status`
   - `user.rating`
6. System normalize data.
7. System tinh analytics snapshot.
8. UI hien dashboard ca nhan.
9. System sinh learning path va recommended problems.

## 3. Đầu vào

### Đầu vào bắt buộc

```json
{
  "handle": "tourist"
}
```

### Đầu vào tuỳ chọn sau MVP

```json
{
  "goal": "improve_rating",
  "timeBudgetHoursPerWeek": 6,
  "targetHorizonDays": 30,
  "preferredTopics": ["dp", "graphs"],
  "excludedTopics": ["geometry"],
  "manualGoals": [
    { "label": "xstk", "topic": "probability" }
  ]
}
```

API key/secret khong bat buoc cho MVP. Handle public la du cho analytics ca nhan co ban.

## 4. Đầu ra

### Tóm tắt dashboard

```json
{
  "handle": "tourist",
  "rating": 3979,
  "maxRating": 3979,
  "rank": "legendary grandmaster",
  "uniqueSolved": 1234,
  "uniqueAttempted": 1500,
  "totalSubmissions": 5000,
  "acRate": 0.42,
  "activeDays30d": 12,
  "solvedToday": 3,
  "learningStage": "advanced",
  "dataConfidence": 0.96
}
```

### Mức độ nắm chủ đề

```json
{
  "topic": "dynamic programming",
  "solvedCount": 42,
  "attemptedCount": 70,
  "acRate": 0.6,
  "abilityScore": 78,
  "stabilityScore": 61,
  "evidenceScore": 72,
  "difficultyScore": 83,
  "modelAbilityScore": 80,
  "masteryScore": 74,
  "strengthScore": 78,
  "weaknessScore": 31,
  "lastSolvedAt": "2026-06-20T10:00:00Z",
  "reason": "Coverage tot nhung gan day con nhieu WA."
}
```

`masteryScore` dùng để giải thích mức nắm hiện tại của topic. `strengthScore` dùng để sắp xếp bảng "Chủ đề nắm tốt nhất"; điểm này ưu tiên hơn cho bài khó đã AC, năng lực theo rating và dự đoán bài mẫu. `weaknessScore` dùng cho bảng "Chủ đề cần cải thiện"; bảng này chỉ hiện topic có `weaknessScore >= 35`.

### Một mục trong lộ trình học

```json
{
  "topic": "binary search",
  "targetBucket": "1200-1399",
  "targetProblemCount": 6,
  "priorityScore": 82,
  "reason": "AC rate thap hon trung binh va con nhieu bai attempted chua AC.",
  "recommendations": [
    {
      "key": "1900/C",
      "rating": 1700,
      "acProbability": 0.63,
      "source": "auto"
    }
  ]
}
```

## 5. Tính năng sẽ triển khai

### Tính năng MVP

- Handle input and validation.
- Codeforces public API sync.
- Current status overview.
- Submission analytics.
- Verdict distribution.
- Rating history.
- Rating bucket coverage.
- Topic mastery.
- Weakness diagnosis.
- Learning stage classifier.
- Problem recommendations.
- Learning path summary.
- Manual goals: user tự thêm topic muốn luyện vào lộ trình.
- Today progress: số bài AC trong ngày hiện tại.

### Tính năng sau MVP

- Lưu nhiều hồ sơ đã phân tích.
- Tài khoản người dùng và mục tiêu cá nhân.
- So sánh tiến độ giữa các snapshot đã lưu.
- Xuất báo cáo.
- Xác minh chính chủ bằng API key nếu cần.

## 6. Biểu đồ sẽ triển khai

### Biểu đồ MVP

- Thẻ KPI.
- Lịch hoạt động dạng heatmap.
- Xu hướng nộp bài.
- Biểu đồ phân bố verdict.
- Biểu đồ đường lịch sử điểm.
- Biểu đồ cột biến động vòng thi.
- Biểu đồ cột chồng độ phủ theo nhóm độ khó.
- Biểu đồ thanh mức độ nắm chủ đề.
- Heatmap ma trận điểm yếu.
- Bảng/danh sách bài nên luyện.

### Biểu đồ sau MVP

- Xu hướng tỉ lệ AC.
- Mẫu lỗi theo chủ đề.
- Biểu đồ radar tổng quan chủ đề.
- Biểu đồ thay đổi tiến độ.

## 7. Thuật toán MVP

### Trạng thái bài

```text
solved = any submission verdict == OK
attempted = any submission exists
attempted_unsolved = attempted and not solved
```

### Tỉ lệ AC làm mượt

```text
smoothed_ac_rate = (solved_count + 1) / (attempted_count + 2)
```

### Độ phù hợp độ khó

```text
user_rating = current Codeforces rating or estimated rating
difficulty_fit = exp(-((problem_rating - target_rating)^2) / (2 * sigma^2))
sigma = 250
```

### Mức độ nắm chủ đề

```text
topic_credit =
  base_credit(topic) / max(base_credit(all_topics_in_problem))

effective_rating =
  800 + (problem_rating - 800) * topic_credit

weighted_coverage =
  1 - exp(-sum(difficulty_weight(effective_rating) for solved problems) / weighted_target)

difficulty_accuracy =
  (sum(difficulty_weight(effective_rating) for solved problems) + 1.5)
  / (sum(difficulty_weight(effective_rating) for attempted problems) + 3)

ability_score =
  0.30 * solved_rating_ceiling
  + 0.26 * peak_rating_edge
  + 0.20 * personal_rating_edge
  + 0.12 * topic_median_edge
  + 0.12 * hard_problem_coverage

difficulty_score =
  0.34 * solved_rating_ceiling
  + 0.28 * peak_rating_score
  + 0.16 * peak_vs_topic_median
  + 0.10 * average_vs_topic_median
  + 0.12 * hard_problem_coverage

evidence_score =
  evidence_from_weighted_solved_attempted
  + hard_solve_bonus

stability_score =
  0.62 * difficulty_accuracy
  + 0.18 * recovery
  + 0.20 * (1 - adjusted_error_pressure)

recency = 2 ^ (-days_since_last_solved / 30)
recovery =
  (solved_count + 0.5 * solved_after_fail_count)
  / max(1, solved_count + attempted_unsolved_count)

mastery =
  100 * (
    0.34 * ability_score
    + 0.18 * stability_score
    + 0.16 * evidence_score
    + 0.14 * difficulty_score
    + 0.10 * weighted_coverage
    + 0.05 * recency
    + 0.03 * recovery
)
```

`topic_credit` giúp giảm nhiễu khi một bài có nhiều tag. Tag rộng như `implementation` nhận ít tín hiệu hơn tag đặc thù như `trees`, `flows/matching`, `geometry`. Sau đó áp dụng `mastery_cap` theo `evidence_score`: topic chỉ làm vài bài dễ sẽ không được điểm quá cao. Nếu topic có bài rating cao đã AC, hệ thống có `ability_floor` và `peak_rating_edge` để không đánh tụt quá thấp chỉ vì nhiều bug ở bài khó. Điều này đặc biệt quan trọng với topic vốn khó như `trees`, nơi một bài AC rating 2000 có ý nghĩa hơn nhiều bài dễ.

Nếu `public/cf_xgb_model.js` tồn tại, hệ thống dùng thêm XGBoost để tính `modelAbilityScore`:

```text
topic_benchmark_set =
  up to 32 problems with same topic
  and rating near current user rating

modelAbilityScore =
  average(P_AC(user, benchmark_problem))

masteryScore =
  blend(heuristic_mastery, modelAbilityScore, stability, evidence, difficulty)
```

Benchmark trong bảng topic nghĩa là một nhóm bài đại diện của topic, không phải benchmark validation của model. Mục tiêu là trả lời: "với topic này, nếu gặp các bài vừa sức/hơi khó thì xác suất AC trung bình của user là bao nhiêu?"

### Điểm mạnh tổng hợp

Bảng "Chủ đề nắm tốt nhất" không sort trực tiếp bằng `masteryScore`. Nó dùng `strengthScore` để ưu tiên đúng hơn các topic người học thật sự mạnh, kể cả khi số bài chưa nhiều:

```text
peak_solved_rating_score =
  clamp((max_solved_rating - 1500) / 1700, 0, 1)

average_solved_rating_score =
  clamp((avg_solved_rating - 1200) / 1000, 0, 1)

hard_depth =
  clamp(log(1 + hard_solved_count) / log(80), 0, 1)

solved_depth =
  clamp(log(1 + solved_count) / log(120), 0, 1)

practice_depth =
  0.70 * hard_depth + 0.30 * solved_depth

hard_proof =
  0.65 * max(difficulty_score, peak_solved_rating_score)
  + 0.35 * average_solved_rating_score

reliability =
  0.90 + 0.10 * evidence_adjustment

strengthScore =
  clamp(
    100 * (
      0.28 * modelAbilityScore
      + 0.24 * abilityScore
      + 0.18 * hard_proof
      + 0.12 * stabilityScore
      + 0.10 * masteryScore
      + 0.06 * evidenceScore
      + 0.04 * practice_depth
    ) * reliability,
    0,
    100
  )
```

Lý do tách `strengthScore`: `masteryScore` thiên về mô tả trạng thái học tổng thể, còn `strengthScore` dùng cho ranking mặt mạnh. Nếu user AC ít bài nhưng trong đó có bài khó của topic, topic đó không nên bị xếp quá thấp chỉ vì coverage nhỏ. Ngược lại, topic làm nhiều bài dễ vẫn cần `ability/evidence/modelAbility` tốt mới đứng cao. Thang `peak_solved_rating_score` dùng khoảng 1500-3200 để tránh việc nhiều topic mạnh bị bão hòa 100 cùng lúc.

### Điểm yếu

```text
weakness =
  100 * (
    0.28 * (1 - ability_score)
    + 0.22 * (1 - stability_score)
    + 0.18 * (1 - difficulty_score)
    + 0.14 * attempted_unsolved_ratio
    + 0.10 * staleness
    + 0.08 * (1 - evidence_score)
  )
```

`adjusted_error_pressure` giảm nhẹ mức phạt lỗi khi người học đang thử nhiều bài rating cao, vì bài khó thường có nhiều bug/WA hơn.

Bảng "Chủ đề cần cải thiện" chỉ hiển thị topic có:

```text
weaknessScore >= 35
```

Mốc diễn giải:

- `35-49`: theo dõi.
- `50-69`: cần ôn.
- `70+`: rất cần ôn.

Topic dưới 35 được xem là "củng cố nhẹ" và không xuất hiện trong bảng cải thiện để tránh hiểu nhầm rằng một mặt mạnh cũng là điểm yếu. Lộ trình học tự động và danh sách bài nên luyện tiếp cũng chỉ lấy các topic có `weaknessScore >= 35`. Ngoài ra, một topic tự động chỉ được đưa vào lộ trình khi hệ thống tìm được ít nhất một bài gợi ý phù hợp cho topic đó; nếu không có topic nào vượt ngưỡng hoặc không có bài phù hợp thì lộ trình tự động có thể rỗng. Mục tiêu tự thêm vẫn được dùng như một nguồn ưu tiên riêng.

### Xác suất AC bằng XGBoost

```text
features =
  user_rating_at_t,
  problem_rating,
  rating_gap,
  topic history,
  bucket history,
  wrong/tle pressure,
  PFA success/fail,
  problem popularity,
  topic one-hot,
  bucket one-hot

P_raw = XGBoost(features)
P_AC = sigmoid(scale * logit(P_raw) + bias)
```

Model được train offline trong thư mục `Ai`, export thành `public/cf_xgb_model.js` và chạy trực tiếp trong trình duyệt. Nếu thiếu file XGBoost, hệ thống fallback về Logistic/PFA baseline cũ.

Benchmark validation hiện được ghi ở `Ai/MODEL_BENCHMARK.md`. Các metric chính:

- `Log loss`: phạt model tự tin sai.
- `Brier score`: sai số xác suất.
- `ROC AUC`: khả năng xếp case AC cao hơn case không AC.
- `ECE`: độ lệch calibration của xác suất.

### Điểm gợi ý bài

```text
score =
  0.32 * topic_fit
  + 0.25 * difficulty_fit
  + 0.15 * quality
  + 0.10 * novelty
  + 0.13 * probability_fit
  + 0.05 * manual_goal_bonus
```

## 8. Runtime static và dữ liệu

MVP hiện không dùng API nội bộ để phân tích. Browser đọc problemset từ `public/data.js`, gọi trực tiếp Codeforces API cho dữ liệu cá nhân và chạy analytics trong frontend.

Hàm chính phía frontend:

```text
analyzeHandleStatic(handle)
```

Kết quả trả về cho dashboard:

```json
{
  "profile": {},
  "summary": {},
  "charts": {},
  "topics": [],
  "buckets": [],
  "weaknesses": [],
  "learningPath": [],
  "recommendations": []
}
```

Dữ liệu runtime:

- `public/data.js`: kho bài Codeforces compact, được sinh từ `problemset.problems`.
- `public/cf_xgb_model.js`: model XGBoost đã train offline, dùng để dự đoán `P_AC`; nếu thiếu file này thì fallback về baseline.
- `user.info`: tải từ Codeforces mỗi lần phân tích.
- `user.status`: tải từ Codeforces mỗi lần phân tích.
- `user.rating`: tải từ Codeforces mỗi lần phân tích.
- `localStorage.lastHandle`: chỉ ghi nhớ handle gần nhất để điền lại input.

Chính sách lưu trữ:

- Không dùng IndexedDB.
- Không lưu submissions/rating/profile vào persistent cache.
- Tắt tab thì dữ liệu cá nhân trong RAM mất.
- Đổi handle không cần dọn cache lớn vì không có dữ liệu cá nhân persistent.

## 9. Nguyên tắc giao diện

- Màn hình đầu tiên là dashboard thật, không phải landing page.
- Mỗi chỉ số nên dẫn tới một kết luận hoặc hành động.
- Biểu đồ cần gọn, dễ đọc và phục vụ việc học.
- Giao diện nên trung tính, tập trung vào thông tin.
- Nếu dữ liệu có độ tin cậy thấp, cần nói rõ.
