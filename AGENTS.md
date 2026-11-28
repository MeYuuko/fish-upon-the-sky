# Project Rules & Guidelines for Fish Upon The Sky

Tài liệu này quy định các quy tắc hoạt động và hướng dẫn phát triển dành cho Agent khi làm việc trong workspace này.

---

## 1. Quản lý Frontend Dev Server (Port Management)

- **Không tự ý mở nhiều frontend server:** Tuyệt đối không tự ý khởi chạy thêm tiến trình dev server (như `npm run dev`, `vite`, v.v.) nếu chưa có sự xác nhận rõ ràng từ người dùng.
- **Port mục tiêu mặc định:** Frontend server chủ yếu hoạt động tại port `5173`.
- **Quy trình kiểm tra trước khi chạy:**
  1. Trước khi chạy lệnh khởi động frontend server, Agent phải chủ động kiểm tra xem port `5173` (hoặc port liên quan) đã có tiến trình nào đang lắng nghe hay chưa (ví dụ: dùng PowerShell `Get-NetTCPConnection -LocalPort 5173` hoặc kiểm tra các tiến trình đang chạy).
  2. Nếu phát hiện port đã có service khác hoặc một frontend server đang chạy:
     - **Không tự ý kill tiến trình hay tự ý mở server ở port mới.**
     - **Dừng lại và hỏi ý kiến người dùng** với các phương án rõ ràng:
       - **(A) Đóng:** Tắt tiến trình cũ để mở server mới.
       - **(B) Tái sử dụng:** Giữ nguyên và sử dụng lại server đang chạy.
       - **(C) Mở port khác:** Khởi động server mới trên một port khác nếu thực sự cần thiết.

---

## 2. Quy chuẩn Thiết kế Web & Giao diện (UI/UX Design)

Khi thiết kế, tạo mới hoặc chỉnh sửa các thành phần giao diện web, Agent **bắt buộc** phải tuân thủ và kích hoạt skill thiết kế:
> **Skill tham chiếu:** `C:\Users\Admin\Downloads\Fish\.agents\skills\citrus-frontend-design\SKILL.md` (hoặc `.agents/skills/citrus-frontend-design/SKILL.md`)

### Các nguyên tắc cốt lõi cần đồng bộ:
1. **Phong cách tổng thể (Studio Minimalism):**
   - Định hướng Dark-first atmospheric studio concept kết hợp cảm giác ấm áp (Fish Upon The Sky).
   - Bố cục Bento grid với kính mờ (`backdrop-filter: blur(16px)`), viền mảnh hairline tinh tế (`1px solid var(--color-line)`).
   - Họa tiết HUD: dấu cộng căn chỉnh góc (`+`), đường kẻ ngăn cách có chấm tròn (`•———•`). Tránh dùng sticker/cartoon rườm rà.
   - Thanh điều hướng xúc giác dạng viên thuốc trượt (5Lab-style tactile sliding pill navigation).

2. **Bảng màu chuẩn (Palette Tokens):**
   - **Citrus (`#F1FF62`):** Điểm nhấn năng lượng cao, nút hành động chính (text đậm `#112358`), trạng thái kích hoạt viên thuốc (pill indicator), focus ring.
   - **Sea (`#0192C6`):** Màu xanh biển năng động, viền kính, điểm nhấn sóng.
   - **Amalfi (`#004499`):** Xanh thẫm sang trọng, nền kính sâu, pill/link cho chế độ light.
   - **Cream (`#D4EAFF`):** Nền highlight mềm, màu chữ phụ trên nền tối (`--color-ink-soft`), liên kết dễ đọc.
   - **Deep (`#112358` / `#0D1C47`):** Nền canvas dark-first mặc định, màu chữ tương phản cao trên nền Citrus/Cream.
   - **White (`#F4F5FA`):** Nền light page canvas, màu chữ chính trên dark mode.

3. **Hệ thống Typography:**
   - **Display / Heading:** `DL Calvera` (hero headlines, wordmark, số đếm telemetry, tracking `0.045em`).
   - **Body & UI:** `NANG Nexa Pro` (văn bản thường, form, controls, metadata).
   - **Tỷ lệ Modular scale 1.25** với base size `16px` (`1rem`).
