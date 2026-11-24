# Website Bán Đồ Nội Thất – Nội Thất Mộc An (Đồ án 2)

Website bán đồ nội thất tĩnh được xây dựng bằng **HTML5, CSS3, JavaScript thuần** và lưu trữ dữ liệu trên trình duyệt bằng **localStorage**, tuân thủ đầy đủ phân tích thiết kế trong tài liệu Đồ án 2.

## Cách chạy dự án
1. Giải nén tệp `website-ban-noi-that-moc-an.zip`.
2. Mở trực tiếp tệp `index.html` bằng trình duyệt (Chrome, Edge, Firefox) — không cần cài đặt máy chủ.
3. Để vào phân hệ quản trị, mở tệp `admin.html` hoặc nhấn liên kết **Khu vực Quản trị (Admin)** ở chân trang.

## Tài khoản đăng nhập mẫu
- **Quản trị viên (Admin):** `admin@mocan.vn` / `admin123`
- **Khách hàng mẫu:** `khachhang@mocan.vn` / `123456`
- **Khách hàng bị khóa (để kiểm thử):** `thuha@gmail.com` / `123456`

## Cấu trúc thư mục
- `index.html`: Trang chủ (Hero, không gian, bộ lọc nhanh, sản phẩm nổi bật, câu chuyện, showroom)
- `products.html`: Danh mục sản phẩm, tìm kiếm, lọc khoảng giá, sắp xếp và phân trang (ND01, ND02)
- `product-detail.html`: Chi tiết sản phẩm, thông số kỹ thuật, chọn số lượng, sản phẩm liên quan (ND03)
- `auth.html`: Đăng nhập và đăng ký tài khoản (ND04, ND05)
- `cart.html`: Quản lý giỏ hàng (ND06) – Hỗ trợ cả khách vãng lai và thành viên, cập nhật số lượng nhập tay / nút bấm, thanh tiến trình miễn phí vận chuyển, áp dụng mã ưu đãi/Voucher (`MOCAN10`, `FREESHIP`, `NOITHAT500K`, `MOCAN2026`), xóa từng món và xóa toàn bộ giỏ hàng có xác nhận.
- `checkout.html`: Đặt hàng & Thanh toán (ND07) – Stepper quy trình 3 bước, tự điền thông tin thành viên / hỗ trợ khách vãng lai, chọn Tỉnh/Thành phố, Quận/Huyện, 4 phương thức thanh toán chuyên nghiệp: COD (đồng kiểm), Chuyển khoản VietQR tự động (có mã QR, sao chép STK MBBank, nội dung CK), Thẻ quốc tế Visa/Mastercard, Ví điện tử MoMo/VNPay. Sinh mã đơn tự động `SinhMaDonHang()`, trừ tồn kho, màn hình xác nhận đặt hàng thành công chuyên nghiệp.
- `orders.html`: Đơn hàng của tôi (ND08) – Bộ lọc tab theo trạng thái (Tất cả, Chờ duyệt, Đang giao, Hoàn thành, Đã hủy) kèm số lượng, tìm kiếm đơn theo mã hoặc tên sản phẩm, thanh tiến trình 4 bước theo dõi giao vận trực quan, chức năng Hủy đơn hàng có chọn lý do (hoàn trả tồn kho cho sản phẩm), Mua lại đơn hàng (Re-order), In hóa đơn bán hàng chuyên nghiệp (Print Invoice) và hỗ trợ tra cứu đơn hàng nhanh cho khách vãng lai.
- `admin.html`: Phân hệ quản trị gồm Đăng nhập (QT01), Bảng điều khiển, Danh mục (QT02), Sản phẩm (QT03), Đơn hàng (QT04), Tài khoản KH (QT05), Thống kê – Biểu đồ doanh thu (QT06)
- **CSS theo từng trang:**
  - `css/common.css`: Biến màu sắc (`:root`), reset, font, typography, header, footer, button, modal dialog, toast.
  - `css/home.css`: Dành riêng cho `index.html` (Hero banner, danh mục không gian, câu chuyện thương hiệu, showroom).
  - `css/products.css`: Dành riêng cho `products.html` (Layout danh mục, thanh sắp xếp, bộ lọc sidebar, phân trang).
  - `css/product-detail.css`: Dành riêng cho `product-detail.html` (Ảnh chi tiết gallery, bảng thông số kỹ thuật, chọn số lượng).
  - `css/auth.css`: Dành riêng cho `auth.html` (Form đăng nhập, đăng ký).
  - `css/cart.css`: Dành riêng cho `cart.html` (Bảng giỏ hàng, stepper, freeship meter, voucher box).
  - `css/checkout.css`: Dành riêng cho `checkout.html` (Form giao nhận, phương thức thanh toán VietQR / thẻ / ví).
  - `css/orders.css`: Dành riêng cho `orders.html` (Tab trạng thái, thẻ đơn hàng, timeline tiến trình, hóa đơn in ấn).
  - `css/admin.css`: Dành riêng cho `admin.html` (Bảng điều khiển quản trị, menu bên, modal thêm sửa xóa).
  - `css/style.css`: Tệp master bundle nhúng tất cả các mô-đun CSS trên.
- **JavaScript theo từng trang:**
  - `js/data.js`: CSDL LocalStorage 7 bảng (Users, Products, Categories, Cart, Orders...), hàm tính giảm giá voucher, sinh mã đơn.
  - `js/ui.js`: Giao diện dùng chung (Header, Footer, Toast thông báo, badge giỏ hàng, hàm render thẻ sản phẩm).
  - `js/home.js`: Bộ điều khiển trang chủ (`index.html`).
  - `js/products.js`: Bộ điều khiển danh mục sản phẩm (`products.html`).
  - `js/product-detail.js`: Bộ điều khiển trang chi tiết sản phẩm (`product-detail.html`).
  - `js/auth.js`: Bộ điều khiển đăng nhập / đăng ký (`auth.html`).
  - `js/cart.js`: Bộ điều khiển giỏ hàng (`cart.html`).
  - `js/checkout.js`: Bộ điều khiển đặt hàng & thanh toán (`checkout.html`).
  - `js/orders.js`: Bộ điều khiển đơn hàng của tôi (`orders.html`).
  - `js/admin.js`: Toàn bộ logic phân hệ quản trị (`admin.html`).
  - `js/store.js`: Tệp controller tổng hợp bảo tồn tính tương thích ngược.
