---
layout: post
lang: vi
title: "Xây app iOS đầu tiên bằng ZCode, pstack và Jev"
description: "App đầu tiên của mình là Vehicle Care, app iOS quản lý bảo dưỡng xe bằng SwiftUI. Mình làm product owner chứ không gõ code: ZCode là agent lập trình, pstack gắn kỷ luật cho agent, Jev là model quyết định có kiểu cho khâu lái browser."
date: 2026-10-24
translations:
  en: /blog/en/building-my-first-ios-app-with-zcode-pstack-jev/
---

App iOS đầu tiên của mình tên là **Vehicle Care**: quản lý xe và lịch bảo dưỡng bằng SwiftUI, đăng nhập Apple/Google, đồng bộ Firebase, ghi nhận dịch vụ, biểu đồ chi tiêu, hai ngôn ngữ Việt/Anh, kèm gói trả phí trích hạng mục bảo dưỡng từ ảnh hóa đơn. Trước nó mình chưa từng ra mắt app iOS nào, và trong suốt quá trình làm gần như không tự gõ dòng Swift nào. Vai trò của mình là product owner: mô tả việc cần làm, xem bằng chứng nó chạy được, quyết định hướng sản phẩm. Còn đọc code, viết code, chạy test thuộc về bộ ba **ZCode** (agent lập trình), **pstack** (kỷ luật cho agent) và **Jev** (model ra quyết định có kiểu).

## ZCode: agent lập trình trên chính chiếc Mac

ZCode đọc repo, chạy lệnh, sửa code, chạy test, mở simulator khi cần. Kiểu hợp tác của hai bên:

1. Mình mô tả yêu cầu bằng ngôn ngữ không kỹ thuật: "nút Lưu không phản hồi khi thêm xe mới", "biểu đồ chi tiêu đang gộp sai tháng".
2. Agent tự đọc code, tìm nguyên nhân, sửa, rồi chạy lại các lớp test liên quan để chứng minh việc sửa có hiệu lực.
3. Toàn bộ quy ước của repo — cách thêm chuỗi dịch thuật, quy tắc Firestore, những cái bẫy đã từng mắc — nằm trong một file `AGENTS.md` mà agent đọc trước khi làm bất cứ việc gì.

Điểm đáng giá nhất với mình: kiến thức project nằm trong repo chứ không nằm trong đầu mình. Ví dụ thật: một lần bisect mất cả tiếng vì simulator cũ lặng lẽ từ chối mọi lần ghi dữ liệu, trong khi code không hề lỗi. Kết luận được ghi thành một dòng trong bảng quy tắc kèm cách xử lý (erase simulator, 20 giây), và các agent sau đó tự tránh.

## pstack: kỷ luật cho agent

Agent làm nhanh nhưng có kiểu hỏng riêng: sửa một bug lại phát sinh thêm tính năng, khai "xong" khi chưa chạy thử, hoặc nói yes với mọi yêu cầu. **pstack** là plugin gắn vào ZCode một bộ skill và playbook chặn đúng các điểm đó:

- Mỗi việc chia thành bước nhỏ, mỗi bước kết thúc bằng một kiểm chứng chạy được; "compile xong" không tính là xong.
- Bug phải tái hiện được trước khi sửa, và sửa tại nguyên nhân gốc thay vì dán một cái guard lên triệu chứng.
- Trước khi hỏi mình "nên làm cách nào", agent tự chạy thử để lấy câu trả lời; câu hỏi chỉ dành cho quyết định sản phẩm thật sự.
- "No is an acceptable answer": agent được từ chối thẳng một tính năng không đáng thêm.

Vế cuối là phần mình quý nhất. Mình đề xuất đủ thứ, trong đó có ý tưởng dở, và một cộng sự nói "cái này không đáng giá" còn hơn một cái gật đầu rồi để lại mớ code thừa.

## Jev: quyết định có kiểu ở khâu dễ hỏng nhất

Trong cả chuỗi automation, khâu hỏng nhiều nhất là lái browser: upload ảnh lên App Store Connect, điền metadata, những trang selector đổi bất kỳ lúc nào và một cú click sai phá việc của cả buổi. Repo của mình bắt mọi tác vụ browser đi qua skill `$jb`, phân công như sau:

1. **Jev** — model quyết định của TypeSafe AI — đọc trạng thái trang và trả về đúng một hành động có kiểu: phần tử nào, thao tác gì, kèm mức tự tin.
2. **browser-use** thực hiện đúng một bước giới hạn đó.
3. Bước không chắc chắn hoặc không thể hoàn tác thì dừng lại chờ mình, không bấm tiếp.

Sở trường của Jev là loại quyết định nhỏ mà khối lượng lớn: chọn route nào, mức khẩn cấp bao nhiêu, cho phép hay chặn. Câu trả lời luôn có kiểu — `choice` (chọn một trong các nhãn), `score` (chấm thang 2–10) hoặc `noul` (xác suất yes/no từ 0 đến 1) — nên code rẽ nhánh trực tiếp, không có bước "đọc văn bản tự do rồi đoán ý". Loại quyết định quá mơ hồ cho một cái `if` viết tay và quá nhỏ cho một lần gọi LLM lớn thì nằm gọn trong khoản đó.

## Tính đến hôm nay

- App đã lên **TestFlight**, chạy trên dự án Firebase staging riêng để việc thử nghiệm không đụng tới dữ liệu người dùng thật.
- Bảy lớp test hành vi gói trong một script; riêng lớp UI test iOS chạy khoảng 55 phút nên chia hai lane song song, mỗi lane một simulator và bộ port emulator riêng.
- Repo đã đi qua hơn 75 pull request, chưa kể issue; bug ghi thành GitHub issue theo ngôn ngữ PO.
- Metadata và screenshot App Store cho cả hai ngôn ngữ đã nằm sẵn trong repo, chờ nộp lên App Store.
