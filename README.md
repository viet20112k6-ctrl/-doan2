# Mộc An — website tĩnh mở trực tiếp

## Mở trang

Giải nén ZIP rồi mở `index.html` bằng trình duyệt. Không cần chạy Python, máy chủ cục bộ hoặc cài thêm công cụ. CSS và JavaScript được liên kết bằng đường dẫn tương đối.

## Cấu trúc

- `index.html`: trang hoàn chỉnh đã ghép sẵn các phần HTML để trình duyệt có thể mở trực tiếp bằng `file://`.
- `html/`: các tệp HTML nguồn tách theo mục: thông báo, đầu trang, ảnh bìa, dịch vụ, showroom, sản phẩm, ưu đãi, câu chuyện, đăng ký nhận tin, chân trang và hộp thoại. Trình duyệt không cho trang `file://` tự tải các tệp HTML con bằng `fetch`; nếu sửa một phần trong `html/`, hãy cập nhật phần tương ứng trong `index.html`.
- `css/`: giao diện tách theo nền tảng, đầu trang, showroom, sản phẩm, ưu đãi, chân trang, hộp thoại, tài khoản, quản trị và responsive. `index.html` liên kết trực tiếp từng tệp.
- `js/du-lieu.js`: dữ liệu mẫu sản phẩm, showroom và bài viết.
- `js/cua-hang.js`: dữ liệu và chức năng lõi của cửa hàng.
- `js/features/`: sự kiện theo mục: sản phẩm, giỏ hàng/đơn hàng, showroom, câu chuyện, hộp thoại và điều hướng.
- `js/quan-tri.js`: đăng nhập demo và chức năng quản trị.

Các tệp JavaScript được nạp lần lượt bằng thẻ `<script defer>` trong `index.html`, nên vẫn giữ riêng mà không cần `type="module"`.

Ảnh và phông chữ lấy từ Internet nên cần kết nối mạng để hiển thị đầy đủ.

## Tài khoản quản trị demo

- Email: `admin@mocan.example`
- Mật khẩu: `demo123`

Đây là website tĩnh minh họa. Đăng nhập và dữ liệu chỉ lưu trong trình duyệt; chưa có máy chủ xác thực hoặc cơ sở dữ liệu dùng chung.
