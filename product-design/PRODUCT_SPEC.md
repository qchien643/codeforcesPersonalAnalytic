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
  "excludedTopics": ["geometry"]
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
  "masteryScore": 74,
  "weaknessScore": 31,
  "lastSolvedAt": "2026-06-20T10:00:00Z",
  "reason": "Coverage tot nhung gan day con nhieu WA."
}
```

### Một mục trong lộ trình học

```json
{
  "topic": "binary search",
  "targetBucket": "1200-1399",
  "targetProblemCount": 6,
  "priorityScore": 82,
  "reason": "AC rate thap hon trung binh va con nhieu bai attempted chua AC.",
  "recommendations": []
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
coverage = 1 - exp(-solved_count / target_solved_count)
accuracy = smoothed_ac_rate
recency = 2 ^ (-days_since_last_solved / 30)
recovery = solved_after_fail_count / max(1, solved_after_fail_count + attempted_unsolved_count)

mastery =
  100 * (
    0.40 * coverage
    + 0.25 * accuracy
    + 0.20 * recency
    + 0.15 * recovery
  )
```

### Điểm yếu

```text
weakness =
  100 * (
    0.35 * (1 - mastery / 100)
    + 0.25 * attempted_unsolved_ratio
    + 0.20 * error_pressure
    + 0.20 * staleness
  )
```

### Điểm gợi ý bài

```text
score =
  0.35 * topic_fit
  + 0.30 * difficulty_fit
  + 0.15 * quality
  + 0.10 * novelty
  + 0.10 * diversity
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
