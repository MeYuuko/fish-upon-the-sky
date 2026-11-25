-- Danh sách liên kết 7 thành viên Fish Upon The Sky với tài khoản đăng nhập
-- Điền email Gmail thật của từng bạn (và/hoặc clerk_user_id dạng 'user_...' nếu dùng Clerk).
-- Có thể chạy lại file này bất kỳ lúc nào khi cập nhật email hoặc Clerk ID.

insert into public.member_accounts (member_id, email, clerk_user_id) values
  ('bao', 'bao@gmail.com', null),
  ('hang', 'hang@gmail.com', null),
  ('diem', 'diem@gmail.com', null),
  ('quynh', 'quynh@gmail.com', null),
  ('quoc-anh', 'quoc-anh@gmail.com', null),
  ('thu', 'thu@gmail.com', null),
  ('thien', 'thien@gmail.com', null)
on conflict (member_id) do update set
  email = excluded.email,
  clerk_user_id = excluded.clerk_user_id;
