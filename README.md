# EnCiVi — Giao diện chia thành các trang và thành phần nhỏ

Tác giả: Nguyễn Công Việt.

## Chạy website

Giải nén toàn bộ `EnCiVi-TaiKhoan.zip` trước khi chạy. Trong ZIP, các trang HTML nằm trực tiếp trong thư mục `EnCiVi-TaiKhoan`; trong mã nguồn Sites, chúng nằm trong `dist`.

**Cách 1 — Visual Studio Code và Live Server:** mở thư mục website bằng VS Code, bấm chuột phải vào `index.html`, chọn **Open with Live Server**. Trong mã nguồn Sites, mở `dist/index.html`.

**Cách 2 — Windows có Python 3:** mở `Chay-website.bat`, rồi truy cập `http://127.0.0.1:5500/index.html`. Giữ cửa sổ lệnh mở khi sử dụng website; nhấn Ctrl+C để dừng.

**Cách 3 — Dùng dòng lệnh:** mở terminal trong thư mục chứa `index.html` và chạy:

```sh
python3 -m http.server 5500 --bind 127.0.0.1
```

Trên Windows có Python Launcher, dùng `py -3` thay cho `python3`. Sau đó mở `http://127.0.0.1:5500/index.html`.

Các phần HTML trong `components` được tải bằng JavaScript. Vì vậy, hãy chạy qua Live Server hoặc máy chủ tĩnh trên; không mở trực tiếp file bằng địa chỉ `file://`. Website không cần cài thư viện JavaScript hay có backend để trải nghiệm.

Hướng dẫn chính thức: [Live Server](https://github.com/ritwickdey/vscode-live-server) và [Python http.server](https://docs.python.org/3/library/http.server.html#command-line-interface).

## Các trang giao diện

| File HTML                | Nội dung                                    | Liên kết chính                                 |
| ------------------------ | ------------------------------------------- | ---------------------------------------------- |
| `index.html`             | Trang chủ, bộ sưu tập theo phòng, cảm hứng  | Danh sách sản phẩm và danh mục phòng           |
| `san-pham.html`          | Danh mục, tìm kiếm, lọc và sắp xếp          | Chi tiết từng sản phẩm; thêm vào giỏ           |
| `chi-tiet-san-pham.html` | Ảnh, mô tả, màu, kích thước, số lượng       | Ví dụ: `chi-tiet-san-pham.html?id=2`           |
| `gio-hang.html`          | Các món đã chọn, số lượng, tổng tiền        | Chi tiết sản phẩm; tiếp tục chọn; đặt hàng     |
| `dat-hang.html`          | Thông tin người nhận và thanh toán mô phỏng | Giỏ hàng; danh sách đơn sau khi đặt            |
| `don-hang.html`          | Theo dõi đơn và hủy đơn chờ xác nhận        | Menu chung; xác nhận hủy                       |
| `dang-nhap.html`         | Đăng nhập khách hàng và admin               | Đăng ký; quay lại trang đặt hàng hoặc quản trị |
| `dang-ky.html`           | Đăng ký tài khoản khách hàng                | Đăng nhập; tự tiếp tục sau khi tạo tài khoản   |
| `quan-tri.html`          | Sản phẩm, đơn hàng, doanh thu               | Cửa hàng; hộp thoại thêm/sửa sản phẩm          |

Mỗi trang chỉ chứa phần nội dung riêng. Khi bấm menu hoặc liên kết sản phẩm, trình duyệt chuyển sang file HTML tương ứng. Tham số URL giữ bộ lọc và sản phẩm đang xem, ví dụ `san-pham.html?q=sofa&sort=price-asc`.

## Các phần dùng chung

| File/thư mục              | Chức năng                                                                     |
| ------------------------- | ----------------------------------------------------------------------------- |
| `components/header.html`  | Thanh thông báo, logo, menu, tìm kiếm, tài khoản và biểu tượng giỏ hàng       |
| `components/footer.html`  | Chân trang và các liên kết thông tin                                          |
| `components/dialogs.html` | Giỏ hàng nhanh, thông tin tài khoản, thêm/sửa sản phẩm, xác nhận và thông báo |
| `components/icons.html`   | Bộ biểu tượng SVG dùng chung                                                  |
| `css/style.css`           | Màu sắc, kiểu chữ, bố cục, hiển thị trên điện thoại                           |
| `js/layout.js`            | Ghép các phần HTML dùng chung vào mỗi trang                                   |
| `js/auth.js`              | Đăng ký, kiểm tra mật khẩu, phiên đăng nhập và tài khoản admin duy nhất       |
| `js/script.js`            | Tìm kiếm, liên kết trang, giỏ hàng, đơn hàng, quản trị và dữ liệu             |
| `images/`                 | Ảnh nội thất và favicon                                                       |

Để sửa menu trên toàn website, chỉnh `components/header.html` một lần. Để sửa chân trang, chỉnh `components/footer.html`. Sửa nội dung riêng ở file HTML của trang đó; giữ các thuộc tính `id`, `data-page` và `data-action` đang được JavaScript sử dụng. Tải lại trang sau khi sửa.

Để thêm một trang mới, sao chép khung trang gồm liên kết CSS, các vị trí `data-include`, và ba file JavaScript; đặt nội dung mới bên trong `<main>`. Thêm liên kết vào menu chung. Nếu trang mới cần chức năng riêng, bổ sung tên trang vào `PAGES` và phần khởi tạo tương ứng trong `js/script.js`.

## Đăng ký và đăng nhập

**Khách hàng:** bấm biểu tượng tài khoản trên đầu trang → Đăng ký ngay. Nhập họ tên, tên tài khoản, email, mật khẩu và nhập lại mật khẩu. Tên tài khoản gồm 4–30 chữ không dấu, số, dấu chấm hoặc gạch dưới; mật khẩu từ 8 đến 128 ký tự. Không đăng ký trùng tên tài khoản hoặc email. Đăng nhập được bằng tên tài khoản hoặc email, không phân biệt chữ hoa/thường; mật khẩu có phân biệt chữ hoa/thường.

**Admin:** tại trang Đăng nhập, chọn Đăng nhập quản trị. Bản đồ án có đúng một tài khoản admin mẫu:

| Tên tài khoản | Mật khẩu mẫu |
| ------------- | ------------ |
| `admin`       | `Admin@123`  |

Đăng ký thông thường chỉ tạo khách hàng, không tạo thêm admin. Admin xem tất cả đơn hàng trên trình duyệt đang dùng, chỉnh sản phẩm và cập nhật trạng thái đơn. Khách chỉ có các thao tác dành cho khách; không còn nút tự chọn vai trò.

**Dữ liệu riêng:** mỗi khách có giỏ hàng và danh sách đơn riêng. Các món chọn trước khi đăng nhập được ghép vào giỏ của tài khoản vừa đăng nhập, tối đa 99 món cho mỗi lựa chọn. Đăng xuất không xóa dữ liệu; đăng nhập lại cùng tài khoản sẽ khôi phục giỏ và đơn. Người nhận có thể khác người đứng tên tài khoản.

Mật khẩu không lưu dưới dạng văn bản; `js/auth.js` dùng Web Crypto PBKDF2-HMAC-SHA-256 (600.000 vòng, salt ngẫu nhiên riêng cho khách hàng). Đăng ký và đăng nhập cần HTTPS hoặc địa chỉ localhost/127.0.0.1 như hướng dẫn chạy ở trên. Tài khoản admin và mật khẩu mẫu chỉ phục vụ trình diễn đồ án; hãy dùng mật khẩu thử cho các tài khoản khách.

Nguồn kỹ thuật: [Web Crypto deriveBits](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits) và [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Dữ liệu liên kết giữa các trang

Các trang dùng chung khóa `encivi_store_v3` trong localStorage. Sản phẩm là danh mục chung; giỏ hàng được tách theo mã tài khoản; mỗi đơn hàng có `userId` của người đặt. Tài khoản lưu ở `encivi_accounts_v1`; phiên đăng nhập lưu ở `encivi_session_v1` trong sessionStorage, dùng cùng một tab và hết hạn sau 8 giờ.

Dữ liệu `encivi_store_v2` và các khóa `moho_*` được nhập khi chưa có dữ liệu mới. Sản phẩm và giỏ khách vãng lai cũ được giữ. Đơn cũ chưa có chủ tài khoản chỉ hiển thị trong trang quản trị, không gán tự động cho khách mới. Vai trò cũ `encivi_role` / `moho_role` không còn cho phép vào quản trị.

Hãy chạy tất cả trang trên cùng địa chỉ, cổng và trình duyệt. Ví dụ, luôn dùng `http://127.0.0.1:5500`; đổi sang `http://localhost:5500` hoặc địa chỉ website trực tuyến sẽ có bộ dữ liệu riêng. Xóa dữ liệu trình duyệt sẽ xóa thay đổi và đơn hàng thử.

## Chức năng giữ lại

- Tìm kiếm không dấu; lọc phòng khách, phòng ngủ, phòng ăn; sắp xếp theo giá.
- Chọn màu, kích thước, số lượng; giỏ hàng nhanh và trang giỏ hàng cùng cập nhật.
- Đặt hàng mô phỏng với họ tên, điện thoại, email, địa chỉ và ghi chú.
- Hủy đơn đang chờ; quản trị cập nhật từ Chờ xác nhận → Đang giao → Hoàn thành, hoặc hủy trước khi hoàn thành.
- Thêm, sửa, xóa sản phẩm sau khi đăng nhập tài khoản admin; chỉnh sản phẩm không thay đổi tên và giá trong đơn đã đặt.
- Doanh thu tính các đơn hoàn thành; trạng thái kết thúc không chỉnh tiếp.
- Menu điện thoại, hộp thoại đóng bằng Escape và trạng thái trống khi URL sản phẩm không còn tồn tại.

Đây là website đồ án tĩnh. Đăng nhập và phân quyền mô phỏng trên trình duyệt; người có quyền sửa dữ liệu hoặc mã nguồn trình duyệt có thể thay đổi chúng. Các tài khoản không dùng chung giữa các thiết bị, không phải cơ chế xác thực trên máy chủ và không dùng để lưu tài khoản bán hàng thực tế. Đơn hàng và thanh toán được mô phỏng; website không thu tiền, gửi email hay chuyển đơn đến người bán.

Ảnh mặc định nằm trong `images`; ảnh mới bằng đường dẫn HTTPS cần kết nối mạng. Nguồn ảnh có trong `ASSET-CREDITS.md`.
