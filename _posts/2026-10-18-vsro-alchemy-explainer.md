---
layout: post
lang: vi
title: "Cơ chế đập đồ vSRO: công thức thật nằm trong code server"
description: "Dịch ngược SR_GameServer.exe của gói vSRO 2022 để trả lời câu hỏi đập đồ: ngưỡng thành công tính thế nào, Lucky cộng bao nhiêu điểm, và vì sao không thể canh số."
date: 2026-10-18
translations:
  en: /blog/en/vsro-alchemy-explainer/
---

![Trang Nguyên lý alchemy của Golden Silkroad Online]({{ '/assets/images/posts/alchemy-explainer.png' | relative_url }})

Hỏi bất kỳ ai đập đồ Silkroad về mẹo tăng cộng, bạn sẽ nhận được đủ loại nghi lễ: chờ giờ đẹp, chờ server vắng, đổi map, tháo phụ kiện trước khi đập... Sau khi dịch ngược `SR_GameServer.exe` của gói **vSRO 2022**, hóa ra một lần nâng cộng chỉ gồm **một phép cộng và một lần quay số** — không có biến nào mang tên "giờ đẹp".

Bài viết này giới thiệu [Golden Silkroad Online](https://goldenonline.netlify.app/index.html), trang mình dựng từ kết quả phân tích đó, kèm [bảng tính](https://goldenonline.netlify.app/calculator.html) ngưỡng thành công và [bộ mô phỏng](https://goldenonline.netlify.app/simulator.html) đập đồ; trang giờ có thêm [bảng giá WTB-WTS](https://goldenonline.netlify.app/market.html), [kiểm tra deal](https://goldenonline.netlify.app/deal.html) và [báo thức sự kiện](https://goldenonline.netlify.app/alarm.html). Toàn bộ bằng chứng — địa chỉ hàm, Evidence ID, 98 bản ghi — được ghi lại trong báo cáo kỹ thuật của repo phân tích (riêng, chưa công khai).

## Một lần nâng cộng diễn ra thế nào

Giả sử đập +7 lên +8 bằng Elixir B + Powder B, có Lucky, Premium đang cho 5 điểm và Avatar cho 4 điểm:

| Bước | Server làm gì | Tổng |
|---|---|---:|
| 1 | Tra Elixir B theo mức cộng **hiện tại +7** | 17 |
| 2 | Chưa đạt 100 → cộng Powder B, thêm 20 | 37 |
| 3 | Có Lucky → mất 1 lượt, cộng đúng 5 | 42 |
| 4 | Cộng bonus nhân vật: Premium 5 + Avatar 4 | 51 |
| 5 | Chặn vào khoảng 10–100 | 51 |
| 6 | Quay số 0–99; nhỏ hơn 51 thì thắng | — |

Vài hệ quả đáng chú ý:

- **Lucky không phải "may mắn"** — mỗi lượt dùng cộng cố định 5 điểm vào ngưỡng, và bị tiêu hao ở bước tính ngưỡng, kể cả khi lần đập thành công.
- **Số bằng ngưỡng vẫn trượt**: phép so dùng dấu "nhỏ hơn", nên ngưỡng 51 chỉ chấp nhận 0–50.
- Elixir và powder cộng **điểm**, không nhân phần trăm: từ 37 lên 42 là +5 điểm, không phải 37 × 1,05.

## Những thứ KHÔNG hề xuất hiện trong công thức

Loại trang bị, độ hiếm (SoS/SoM/SoN), degree, giờ server và số người online — không thành phần nào được đọc khi tính ngưỡng. Tỷ lệ elixir cơ bản đi từ 25% (+0→+1) xuống 5% (+9 trở lên) theo bảng dữ liệu server; phần còn lại chỉ là nguyên liệu, Lucky, bonus nhân vật và RNG.

## Thất bại: hai lần quay riêng biệt

Sau khi lần nâng đã trượt, server mới quay tiếp hậu quả:

1. Cơ bản dưới +5: không quay phá hủy hay giảm độ bền.
2. Từ +5: quay thêm số 0–99 — dưới 50 chọn **phá hủy**, từ 50 chọn **giảm độ bền tối đa**.
3. Đá bảo hộ làm việc đúng nhánh: **Immortal** chặn phá hủy, **Steady** chặn giảm độ bền; mỗi viên chỉ mất lượt khi hậu quả tương ứng thực sự được chọn.
4. Nếu vẫn phá hủy thì **Astral** không cứu được trang bị.
5. Còn giữ được đồ: có Astral và mức trước lần thử ≥ +4 → mất 1 lượt Astral và về +4; ngược lại về +0.

Luật gắn đá cũng đáng nhớ: số Astral trên một món đồ phải **ít hơn** số Immortal của nó.

## Vì sao không thể "canh số"

Server dùng bộ sinh số ngẫu nhiên LCG của Microsoft C rồi lấy phần dư chia 100. Vì 32768 không chia hết cho 100, kết quả lệch nhẹ: ngưỡng 50 thực ra cho **50,0488%** thành công. Quan trọng hơn: trạng thái RNG nằm trên server, client không bao giờ nhìn thấy. Bộ mô phỏng có chế độ X-ray cho bạn nhìn thấy từng số quay — và chế độ Blind được dựng ra để chứng minh rằng không có chiến thuật nào dự đoán được số kế tiếp trên server thật.

## Công cụ

- **[Nguyên lý](https://goldenonline.netlify.app/index.html)** — giải thích đầy đủ cơ chế, song ngữ Việt/Anh.
- **[Bảng tính](https://goldenonline.netlify.app/calculator.html)** — nhập mức cộng, nguyên liệu, Lucky, bonus nhân vật; các ô tỷ lệ chỉnh được để mô phỏng server khác.
- **[Mô phỏng](https://goldenonline.netlify.app/simulator.html)** — chơi chiến thuật "câu đồ" ở chế độ X-ray rồi chuyển sang Blind để tự kiểm chứng.
- **[Thị trường](https://goldenonline.netlify.app/market.html)** — bảng giá WTB-WTS từ kênh Discord #wtb-wts: tỷ giá silk/vàng, elixir, trang bị và tiền tệ.
- **[Kiểm tra deal](https://goldenonline.netlify.app/deal.html)** — so giá một món với khoảng mua/bán cả tuần để biết mình có bị hố không.
- **[Báo thức sự kiện](https://goldenonline.netlify.app/alarm.html)** — chọn số phút báo trước, chuông kêu theo lịch sự kiện hằng ngày; cài đặt lưu trên máy bạn.

## Giới hạn

Toàn bộ quy tắc được khôi phục bằng phân tích tĩnh `SR_GameServer.exe` của gói vSRO 2022; số liệu elixir/powder lấy từ dữ liệu SMC đi kèm. **Chưa xác minh trên server thật** — kể cả Golden Online. Nếu server bạn chơi sửa binary hoặc dữ liệu, con số sẽ khác; bảng tính cho phép tự điều chỉnh cho đúng.
