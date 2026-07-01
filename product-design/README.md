# Product Design - Codeforces Learning Analytics

Bo tai lieu nay thiet ke mot he thong phan tich so lieu va toi uu lo trinh hoc cho mot nguoi hoc competitive programming dua tren tai khoan Codeforces.

San pham khong phai online judge, khong thay the Codeforces va khong tap trung vao social/team. Gia tri chinh la doc du lieu cong khai cua mot Codeforces handle, bien no thanh dashboard hoc tap, chan doan diem yeu va lo trinh bai tap tiep theo.

## Scope da chot

- Input chinh: Codeforces username/handle.
- Data source chinh: Codeforces API cong khai.
- Doi tuong phan tich: mot profile Codeforces tai mot thoi diem.
- Output chinh: thong ke, tien do hoc hien tai, chu de nam tot nhat, chu de can cai thien, learning path va problem recommendations.
- Vong lap san pham: sync data -> analyze -> diagnose -> recommend -> user luyen tren Codeforces -> sync lai.

## Tai lieu trong thu muc

- `PRODUCT_SPEC.md`: ban dac ta chinh de trien khai MVP.
- `00-scope.md`: pham vi san pham da chot.
- `01-product-analysis.md`: bai toan, nguoi dung, gia tri cot loi, metric thanh cong.
- `02-feature-spec.md`: module chuc nang cho dashboard analytics va learning path.
- `03-learning-model.md`: cach tinh mastery, weakness, learning stage va recommendation.
- `04-system-architecture.md`: kien truc static-only, `data.js`, Codeforces client va analytics pipeline.
- `05-data-model.md`: model runtime hien tai va bang du lieu neu mo rong backend sau MVP.
- `06-roadmap.md`: lo trinh phat trien theo giai doan.
- `07-mvp-backlog.md`: backlog co the dua thang vao task code.
- `08-input-output-spec.md`: dac ta dau vao, dau ra va contract API/UI.
- `09-algorithm-design.md`: thuat toan danh gia nguoi hoc va sinh learning path.
- `10-research-notes.md`: nghien cuu IRT, BKT, PFA, HLR, DKT va recommender.
- `11-features-and-charts.md`: danh sach tinh nang va chart se trien khai cho dashboard ca nhan.

## MVP nen xay truoc

1. Nguoi dung nhap Codeforces handle.
2. Browser doc problemset tu `public/data.js`.
3. Browser goi Codeforces API de lay profile, submissions va rating changes.
4. He thong tinh solved/attempted, tag stats, rating bucket stats, verdict distribution va activity trend.
5. He thong xac dinh giai doan hoc hien tai: foundation, building, contest-ready, advanced.
6. He thong tao learning path 1-4 tuan voi topic uu tien va danh sach bai de xuat.
7. Sau khi nguoi dung luyen tren Codeforces, bam phan tich lai de cap nhat tien do.

## Analytics principle

Nen uu tien cac model de giai thich trong MVP:

- IRT/Rasch-style: uoc luong kha nang so voi do kho bai.
- PFA/BKT-style: uoc luong mastery theo topic dua tren chuoi correct/incorrect.
- Half-life/staleness: topic lau khong luyen thi diem tu tin giam dan.
- Ranking/recommender: chon bai bang weak topic + difficulty fit + quality + probability fit + manual goals.

## Cap nhat quan trong ve topic scoring

- `masteryScore`: giai thich muc nam chu de hien tai.
- `strengthScore`: dung de sap xep bang chu de nam tot nhat.
- `weaknessScore`: dung de tim chu de can cai thien; bang UI, learning path tu dong va bai goi y chi lay topic tu 35 diem tro len.

Ly do tach `strengthScore`: mot topic kho nhu `trees` co the chi co vai bai AC, nhung neu user da AC bai rating cao thi khong nen bi xep thap hon cac topic co nhieu bai de. Cong thuc moi uu tien peak rating da AC, nang luc theo rating, benchmark XGBoost va do on dinh, nhung van giu `evidence` de tranh danh gia qua cao khi du lieu qua mong.

Tu ban `topic-affinity-v4` tro di, `strengthScore` co them Topic Affinity Graph. Moi topic co the muon nhe bang chung tu topic gan nhau, vi Codeforces tag khong phai luc nao cung dien ta dung ky nang. Vi du `trees` co the muon tu `graphs`, `dsu/mst`, `data structures`, `dynamic programming`, nhung chi khi user da co bai `trees` that. Phan muon bi chan tran va duoc hien trong UI bang "Bang chung lien quan".

Tooltip dau `!` trong UI can tach ro: "Diem nam chu de" giai thich bang chung truc tiep, "Diem manh tong hop" giai thich diem xep hang mat manh, va "Bang chung lien quan" giai thich phan muon nhe tu topic gan nhau. Muc tieu la nguoi moi xem khong can biet XGBoost hay chi tiet code van hieu vi sao topic duoc xep cao/thap.

## Stack hien tai

- Frontend: static HTML/CSS/JavaScript.
- Analytics: JavaScript module chay trong browser.
- Data: `public/data.js` cho problemset, RAM cho du lieu ca nhan trong tab hien tai.
- Cache busting: `index.html` tu gan `?v=<appVersion>-<timestamp>` cho CSS/JS moi lan mo trang, nen double-click file van tranh tai nham asset cu.
- Activity window: UI dung "30 ngay" rolling window thay vi "thang nay" theo lich, de dau thang khong xay ra canh tuan nay co bai nhung thang nay bang 0.
- Localhost: Node `server.js` chi phuc vu file tinh.
- Backend/database/queue: khong bat buoc cho MVP; de sau neu can cloud app multi-user.

## Codeforces API

Can uu tien cac endpoint cong khai:

- `user.info`
- `user.status`
- `user.rating`
- `problemset.problems`

Nguon tham khao:

- https://codeforces.com/apiHelp
- https://codeforces.com/apiHelp/methods
