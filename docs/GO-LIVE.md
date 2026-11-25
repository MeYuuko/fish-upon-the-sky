# Hướng dẫn đưa Fish Upon The Sky lên chạy trực tiếp (Go-Live)

Tài liệu này hướng dẫn từng bước thiết lập **Supabase** (cơ sở dữ liệu + realtime + lưu ảnh + đăng nhập Google), **Clerk** (tùy chọn đăng nhập username/password), **Google Calendar API** (tùy chọn đồng bộ lịch 2 chiều) và deploy lên **Cloudflare Pages**.

---

## 1. Tạo project Supabase & điền `.env`

1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard) → **New project**.
2. Chọn Region gần nhất (ví dụ **Singapore**) và đặt mật khẩu Database.
3. Sau khi project khởi tạo xong, vào **Project Settings → API**:
   - Copy **Project URL** → điền vào `VITE_SUPABASE_URL`
   - Copy **anon / public** key (hoặc Publishable key) → điền vào `VITE_SUPABASE_ANON_KEY`
4. Mở file `.env` ở thư mục gốc dự án (chỉ lưu ở máy bạn, không commit lên Git):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

---

## 2. Tạo bảng, RLS, Realtime và Storage trên Supabase

1. Trong Supabase Dashboard, mở **SQL Editor → New query**.
2. Dán toàn bộ nội dung file [supabase/schema.sql](../supabase/schema.sql) và bấm **Run**.
   - File này tạo các bảng `member_accounts`, `member_profiles`, `polls`, `poll_votes`, `outings`, `busy_days`, bật Row Level Security (RLS), bật Realtime cho 5 bảng dữ liệu, và tạo bucket Storage public tên `media`.
3. Mở file [supabase/member-accounts.sql](../supabase/member-accounts.sql), thay các email mẫu (`bao@gmail.com`, …) bằng **Gmail thật** của từng thành viên (và điền `clerk_user_id` dạng `'user_...'` nếu thành viên đó đăng nhập bằng Clerk).
4. Dán nội dung đã sửa vào **SQL Editor** và bấm **Run**.

> [!IMPORTANT]
> Chỉ những tài khoản có mặt trong bảng `member_accounts` mới đọc và ghi được dữ liệu nhóm. Người ngoài dù đăng nhập Google thành công cũng sẽ thấy màn hình **Tài khoản chưa được liên kết** và bị RLS chặn hoàn toàn.

---

## 3. Bật đăng nhập Google trên Supabase Auth

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → chọn hoặc tạo Project.
2. Vào **APIs & Services → OAuth consent screen**:
   - Chọn **External** (nếu dùng Gmail cá nhân), điền tên app `Fish Upon The Sky`.
   - Nếu app ở chế độ **Testing**, nhớ thêm đủ Gmail của 7 thành viên vào danh sách **Test users** (hoặc bấm **Publish App**).
3. Vào **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://<ten-project>.pages.dev` (domain Cloudflare Pages của bạn, và custom domain nếu có)
   - **Authorized redirect URIs**:
     - `https://<project-ref>.supabase.co/auth/v1/callback` *(lấy `<project-ref>` từ `VITE_SUPABASE_URL`)*
4. Copy **Client ID** và **Client Secret**.
5. Quay lại **Supabase Dashboard → Authentication → Providers**:
   - Bật **Google** → dán **Client ID** và **Client Secret** → **Save**.
   - Vào **Email** provider → **Tắt** đăng nhập/đăng ký bằng email trên Supabase (hoặc vào **Authentication → Settings** tắt **Enable email signup**) để tránh người lạ tự tạo tài khoản khớp email giả.
6. Vào **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `https://<ten-project>.pages.dev` (domain production).
   - **Redirect URLs**: thêm `http://localhost:5173` và `https://<ten-project>.pages.dev/**`.

---

## 4. Liên kết Clerk với Supabase (nếu dùng đăng nhập Username/Password)

Nếu nhóm chỉ dùng **Continue with Gmail**, bạn có thể bỏ qua bước này và để trống `VITE_CLERK_PUBLISHABLE_KEY`.

1. Đăng nhập [Clerk Dashboard](https://dashboard.clerk.com/) → chọn ứng dụng của bạn.
2. Vào **Integrations → Supabase** → bấm **Activate**. Bước này giúp JWT của Clerk tự động có claim `"role": "authenticated"`.
3. Copy **Clerk Frontend API URL / Domain** (ví dụ `https://xxxxx.clerk.accounts.dev`).
4. Vào **Supabase Dashboard → Authentication → Third-Party Auth** (hoặc **Sign In / Providers → Third-Party Auth**) → **Add provider → Clerk** → dán domain Clerk của bạn.
5. Lấy **User ID** của từng thành viên trong **Clerk Dashboard → Users** (dạng `user_2abc...`) và cập nhật vào cột `clerk_user_id` trong [supabase/member-accounts.sql](../supabase/member-accounts.sql), sau đó chạy lại query đó trong Supabase SQL Editor.

---

## 5. Bật Google Calendar API (tùy chọn đồng bộ lịch 2 chiều)

1. Trong cùng project trên [Google Cloud Console](https://console.cloud.google.com/), vào **APIs & Services → Library**.
2. Tìm **Google Calendar API** → bấm **Enable**.
3. Dùng lại **Client ID** đã tạo ở Bước 3 điền vào `VITE_GOOGLE_CLIENT_ID` trong `.env`.
4. Kiểm tra **OAuth consent screen → Scopes** đã bao gồm `https://www.googleapis.com/auth/calendar.events` (hoặc thêm khi cần).

---

## 6. Deploy lên Cloudflare Pages

### Cách A — Kết nối Git (Khuyên dùng)

1. Push code lên GitHub / GitLab.
2. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages → Create → Pages → Connect to Git**.
3. Cấu hình build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Vào **Settings → Environment variables** (cả Production & Preview), thêm:
   - `NODE_VERSION` = `22`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY` *(nếu dùng Clerk)*
   - `VITE_GOOGLE_CLIENT_ID` *(nếu dùng Google Calendar sync)*
5. Bấm **Save and Deploy**. File `public/_redirects` (`/* /index.html 200`) đã sẵn có để hỗ trợ điều hướng SPA.

### Cách B — Deploy trực tiếp từ máy bằng Wrangler

```bash
npm run build
npx wrangler pages deploy dist --project-name fish-upon-the-sky
```

*(Lưu ý: nếu deploy từ máy, file `.env` ở local phải có sẵn các biến `VITE_*` trước khi chạy `npm run build`.)*

---

## 7. Checklist kiểm tra sau khi lên mạng

- [ ] Mở trang bằng **2 trình duyệt / 2 máy khác nhau**, đăng nhập 2 thành viên khác nhau (ví dụ Bảo và Hằng).
- [ ] Tạo 1 poll mới ở máy A → máy B thấy poll xuất hiện ngay (Realtime) và vote được; F5 tải lại vẫn còn nguyên dữ liệu.
- [ ] Đánh dấu ngày bận trên Calendar ở máy A → tải lại trang vẫn giữ nguyên.
- [ ] Upload ảnh vào hồ sơ cá nhân hoặc **Trip Vault** → kiểm tra ảnh hiển thị bình thường qua URL Supabase Storage (`.../storage/v1/object/public/media/...`). *(Lưu ý: xóa ảnh khỏi hồ sơ/vault trong app chỉ gỡ liên kết trong database, chưa tự xóa file vật lý trong bucket `media`.)*
- [ ] Thử đăng nhập bằng một Gmail **không có** trong `member_accounts` → trang phải hiện **Tài khoản chưa được liên kết** và không xem/sửa được bất kỳ dữ liệu nào của nhóm.
