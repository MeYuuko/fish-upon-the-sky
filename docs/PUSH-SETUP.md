# Hướng dẫn bật Web Push Notifications cho app FISH (Android & iOS)

Ứng dụng **FISH** đã tích hợp sẵn Service Worker (`public/sw.js`), giao diện đăng ký (nút chuông trên thanh tiêu đề) và Edge Function (`supabase/functions/send-push`). Để thông báo đẩy hoạt động thật trên điện thoại, bạn chỉ cần làm **3 bước** sau:

---

## Bước 1 — Tạo cặp khóa VAPID miễn phí
Chạy lệnh sau trên máy (không cần cài thêm gì):

```bash
npx web-push generate-vapid-keys
```

Bạn sẽ nhận được 2 chuỗi:
- **Public Key** (dùng ở cả Frontend và Supabase Secret)
- **Private Key** (chỉ lưu bí mật ở Supabase Secret)

---

## Bước 2 — Cập nhật Database & Deploy Edge Function trên Supabase

1. Mở **Supabase Dashboard → SQL Editor** và chạy phần bảng `push_subscriptions` trong [supabase/schema.sql](../supabase/schema.sql).
2. Cài/đăng nhập Supabase CLI (hoặc deploy qua Dashboard) và lưu 3 biến bí mật cho Edge Function:

```bash
supabase secrets set VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY" VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY" VAPID_SUBJECT="mailto:your-email@gmail.com"
supabase functions deploy send-push
```

---

## Bước 3 — Thêm `VITE_VAPID_PUBLIC_KEY` vào Frontend & Cloudflare Pages

1. Thêm dòng sau vào `.env` (ở máy) và **Cloudflare Pages → Settings → Environment variables**:

```env
VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

2. Redeploy Cloudflare Pages.

### Cách bật trên điện thoại
- **Android (Chrome):** Mở web hoặc app **FISH** → bấm biểu tượng **Chuông (🔔)** trên thanh trên cùng → chọn **Allow**.
- **iPhone / iPad (iOS 16.4+):** Mở bằng Safari → bấm **Share → Add to Home Screen (Thêm vào màn hình chính)** → mở app **FISH** từ màn hình chính → bấm biểu tượng **Chuông (🔔)** → chọn **Allow**.
