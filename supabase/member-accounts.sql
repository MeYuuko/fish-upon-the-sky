-- Danh sách liên kết 7 thành viên Fish Upon The Sky với tài khoản đăng nhập
-- Điền email Gmail thật của từng bạn (và/hoặc clerk_user_id dạng 'user_...' nếu dùng Clerk).
-- Có thể chạy lại file này bất kỳ lúc nào khi cập nhật email hoặc Clerk ID.

insert into public.member_accounts (member_id, email, clerk_user_id) values
  ('bao', 'chmyc04@gmail.com', null),
  ('hang', 'hang@gmail.com', null),
  ('diem', 'diem@gmail.com', null),
  ('quynh', 'quynhlenguyentruc2004@gmail.com', null),
  ('quoc-anh', 'qanh3007@gmail.com', null),
  ('thu', 'anhthunguyenle25@gmail.com', null),
  ('thien', 'nhokthien2004@gmail.com', null)
on conflict (member_id) do update set
  email = excluded.email,
  clerk_user_id = excluded.clerk_user_id;
