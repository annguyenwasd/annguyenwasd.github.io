---
layout: post
lang: vi
title: "Passkey hoạt động thế nào: đăng nhập không mật khẩu dưới mui xe"
description: "WebAuthn thay mật khẩu bằng cặp khóa bất đối xứng: private key ở lại thiết bị, server chỉ lưu public key. Giải thích hai luồng đăng ký và đăng nhập, vì sao passkey chống phishing, và nơi lưu secret trên macOS."
date: 2026-10-18
translations:
  en: /blog/en/passkey-how-it-works/
---

Mật khẩu mang theo ba vấn đề cố hữu: người dùng chọn mật khẩu yếu và dùng lại khắp nơi; trang giả mạo lừa được mật khẩu gõ vào; và server buộc phải lưu secret — chỉ cần một lần database bị lộ là cả kho mật khẩu đổ ra ngoài. **Passkey** (chuẩn WebAuthn/FIDO2) giải quyết bằng cách đổi hẳn mô hình: mỗi website nhận một **cặp khóa bất đối xứng** riêng. Private key không bao giờ rời thiết bị của bạn; server chỉ được gửi public key. Đăng nhập là chứng minh bạn đang giữ private key bằng một chữ ký — mà không bao giờ gửi chính khóa đó đi.

## Luồng 1 — Tạo passkey (chỉ làm một lần mỗi tài khoản)

1. Bạn bấm "Tạo passkey"; trình duyệt gọi WebAuthn API `navigator.credentials.create()`.
2. Server trả về một **challenge** — khoảng 32 byte ngẫu nhiên, dùng đúng một lần — kèm `rpId` (tên miền) và thông tin user.
3. Trình duyệt chuyển yêu cầu xuống **authenticator** (Touch ID, YubiKey, điện thoại…), nơi yêu cầu vân tay / khuôn mặt / PIN để xác minh bạn có mặt.
4. Authenticator sinh **cặp khóa mới** cho cặp (tài khoản, tên miền) này. Private key ở lại trong authenticator; challenge được ký bằng chính private key đó.
5. Trình duyệt gửi lên server: public key, credential ID và chữ ký.
6. Server kiểm tra chữ ký khớp challenge mình đã tạo, rồi lưu public key + credential ID vào tài khoản. Từ đây tài khoản không còn mật khẩu để lộ hay quên.

## Luồng 2 — Đăng nhập

1. Bạn chọn "Đăng nhập bằng passkey"; trình duyệt gọi `navigator.credentials.get()`.
2. Server tạo **challenge hoàn toàn mới** (không bao giờ tái sử dụng) cùng danh sách credential ID đã đăng ký.
3. Trình duyệt chỉ đưa ra passkey có `rpId` trùng đúng tên miền; bạn xác minh sinh trắc học.
4. Authenticator ký challenge bằng private key, tạo **assertion** gồm chữ ký, credential ID và bộ đếm chữ ký.
5. Trình duyệt gửi assertion lên server kèm **origin** — tên miền thực của trang đang chạy.
6. Server dùng public key lưu từ lúc đăng ký để xác minh chữ ký. Đúng → mở phiên đăng nhập.

## Vì sao mô hình này chặn được các tấn công cũ

- **Chống phishing**: passkey gắn chặt với tên miền (`rpId`). Trang giả mạo `bank-secure-login.com` không thể xin được passkey của `bank.com` — authenticator không trả về credential nào khớp. Không có secret nào để "gõ nhầm vào trang giả".
- **Chống replay**: mỗi assertion ký trên một challenge dùng một lần. Chụp lại phiên đăng nhập cũ cũng vô dụng vì challenge kế tiếp sẽ khác.
- **Database bị lộ vẫn vô hại**: server không lưu secret nào — thứ bị lộ chỉ là các public key, thứ không đăng nhập được vào đâu.
- **Không tái sử dụng chéo site**: mỗi tên miền có cặp khóa riêng; lộ một site không ảnh hưởng site khác.

Tất cả các bước trên gói lại trong demo tương tác dưới đây — bấm "Sau" để đi từng nhịp trao đổi tin nhắn giữa trình duyệt, authenticator và server:

{% include passkey-demo-vi.html %}

## Passkey nằm ở đâu trên Mac: Keychain

Trên macOS, kho secret gọi là **Keychain** — chứ không phải "Keystore" (tên tương đương trên Android/Java). Passkey bạn tạo trên Safari/Mac nằm trong **iCloud Keychain** và được đồng bộ end-to-end encrypted giữa các thiết bị Apple của bạn — tạo trên iPhone, đăng nhập trên Mac được luôn.

Cùng chiếc Keychain đó còn là nơi gọn gàng để lưu API key, token, mật khẩu service… và đọc/ghi được thẳng từ terminal bằng lệnh `security`:

```bash
# Lưu secret mới (giá trị được nhập ẩn, không dính shell history)
security add-generic-password -a "$USER" -s "my-api-key" -w

# Lưu kèm giá trị, hoặc cập nhật nếu đã tồn tại (-U)
security add-generic-password -a "$USER" -s "my-api-key" -w "sk-…" -U

# Đọc secret ra terminal (bỏ -w để chỉ xem metadata)
security find-generic-password -s "my-api-key" -w

# Gán vào biến môi trường trong script
export API_KEY="$(security find-generic-password -s "my-api-key" -w)"

# Cho một app cụ thể đọc mà không phải gõ mật khẩu keychain mỗi lần
security add-generic-password -s "my-api-key" -a "$USER" -w -T /duong/dan/toi/app

# Xóa
security delete-generic-password -s "my-api-key"
```

Item tạo bằng lệnh nằm trong keychain `login` — mở app **Keychain Access** (Spotlight → "Keychain Access") để xem và quản lý theo service name. Riêng mật khẩu website dạng cổ điển thì dùng `security add-internet-password`.

## Tóm lại

Passkey không phải "mật khẩu tốt hơn" — nó xóa bài toán mật khẩu: không có gì để gõ, để lừa, để dùng lại, và không có secret nào nằm trên server chờ bị đánh cắp. Phần xác minh khó nhất (giữ private key, gắn khóa với tên miền) được đẩy xuống thiết bị và trình duyệt. Apple, Google, GitHub và nhiều dịch vụ lớn đã hỗ trợ passkey — lần tới thấy nút "Dùng passkey", cứ thử: tài khoản của bạn sẽ khó bị lấy cắp hơn hẳn.
