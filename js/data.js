/* ==========================================================================
   MỘC AN FURNITURE - DATA LAYER (localStorage)
   Tương ứng 7 bảng thiết kế CSDL (Bảng 3-7 -> Bảng 3-13):
   - mocan_users      : tblTaiKhoan
   - mocan_categories : tblDanhMuc
   - mocan_catalog    : tblSanPham
   - mocan_cart       : tblGioHang + tblCTGioHang (theo MaTK)
   - mocan_orders     : tblDonHang + tblCTDonHang
   - mocan_session    : Phiên đăng nhập hiện tại
   ========================================================================== */

const STORAGE_KEYS = {
  USERS: 'mocan_users',
  CATEGORIES: 'mocan_categories',
  PRODUCTS: 'mocan_catalog',
  CARTS: 'mocan_cart',
  ORDERS: 'mocan_orders',
  SESSION: 'mocan_session',
  ADMIN_SESSION: 'mocan_admin_session',
  GUEST_CART: 'mocan_guest_cart',
  APPLIED_VOUCHER: 'mocan_applied_voucher'
};

const AVAILABLE_VOUCHERS = [
  {
    code: 'MOCAN10',
    title: 'Giảm 10% đơn hàng',
    desc: 'Giảm 10% tối đa 1.000.000₫ cho đơn từ 2.000.000₫',
    type: 'percent',
    value: 10,
    maxDiscount: 1000000,
    minOrder: 2000000
  },
  {
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển',
    desc: 'Miễn phí vận chuyển toàn quốc (tiết kiệm 250.000₫)',
    type: 'shipping',
    value: 250000,
    minOrder: 0
  },
  {
    code: 'NOITHAT500K',
    title: 'Giảm ngay 500.000₫',
    desc: 'Áp dụng cho đơn hàng từ 5.000.000₫',
    type: 'fixed',
    value: 500000,
    minOrder: 5000000
  },
  {
    code: 'MOCAN2026',
    title: 'Ưu đãi Tân gia 5%',
    desc: 'Giảm 5% cho tất cả đơn hàng từ 1.000.000₫ (tối đa 500.000₫)',
    type: 'percent',
    value: 5,
    maxDiscount: 500000,
    minOrder: 1000000
  }
];

// Ảnh dự phòng dạng SVG nếu mất kết nối Internet
const FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#e9ede6"/>
    <rect x="260" y="210" width="280" height="150" rx="14" fill="#52614b" opacity="0.22"/>
    <text x="400" y="295" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#354332">Mộc An Furniture</text>
  </svg>`
);

const SEED_USERS = [
  {
    MaTK: 'TK001',
    HoTen: 'Nguyễn Công Việt (Admin)',
    Email: 'admin@mocan.vn',
    SoDienThoai: '0988123456',
    MatKhau: 'admin123',
    VaiTro: 'admin',
    TrangThai: 'Hoạt động'
  },
  {
    MaTK: 'TK002',
    HoTen: 'Trần Minh Anh',
    Email: 'khachhang@mocan.vn',
    SoDienThoai: '0912345678',
    MatKhau: '123456',
    VaiTro: 'customer',
    TrangThai: 'Hoạt động'
  },
  {
    MaTK: 'TK003',
    HoTen: 'Lê Hoàng Nam',
    Email: 'hoangnam@gmail.com',
    SoDienThoai: '0976543210',
    MatKhau: '123456',
    VaiTro: 'customer',
    TrangThai: 'Hoạt động'
  },
  {
    MaTK: 'TK004',
    HoTen: 'Phạm Thu Hà',
    Email: 'thuha@gmail.com',
    SoDienThoai: '0934567890',
    MatKhau: '123456',
    VaiTro: 'customer',
    TrangThai: 'Bị khóa'
  }
];

const SEED_CATEGORIES = [
  { MaDM: 'DM01', TenDM: 'Phòng khách', MoTa: 'Sofa, bàn trà, kệ tivi và ghế thư giãn mang lại không gian tiếp khách ấm cúng.', TrangThai: 'Hiển thị' },
  { MaDM: 'DM02', TenDM: 'Phòng ngủ', MoTa: 'Giường gỗ tự nhiên, tủ quần áo, tab đầu giường tối giản cho giấc ngủ trọn vẹn.', TrangThai: 'Hiển thị' },
  { MaDM: 'DM03', TenDM: 'Phòng ăn', MoTa: 'Bàn ăn gỗ sồi, ghế ăn bọc nỉ và tủ bếp tinh tế cho bữa cơm sum vầy.', TrangThai: 'Hiển thị' },
  { MaDM: 'DM04', TenDM: 'Phòng làm việc', MoTa: 'Bàn làm việc, ghế công thái học và kệ sách giúp tối ưu hiệu suất làm việc.', TrangThai: 'Hiển thị' }
];

const SEED_PRODUCTS = [
  {
    MaSP: 'SP001', MaDM: 'DM01', TenSP: 'Sofa Gỗ Sồi Bọc Vải Linen An Nhiên',
    Gia: 14500000, GiaCu: 16800000,
    ChatLieu: 'Gỗ sồi Nga nhập khẩu, vải Linen chống thấm',
    KichThuoc: '220 x 85 x 78 cm', MauSac: 'Be kem / Gỗ tự nhiên',
    SoLuongTon: 6, MoiVe: true, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Thiết kế tối giản phong cách Bắc Âu kết hợp nét mộc mạc Á Đông. Khung gỗ sồi tự nhiên chắc chắn, đệm mút D40 đàn hồi cao và vỏ gối tháo rời dễ vệ sinh.'
  },
  {
    MaSP: 'SP002', MaDM: 'DM01', TenSP: 'Bàn Trà Tròn Mặt Đá Terrazzo Mộc',
    Gia: 4200000, GiaCu: 4900000,
    ChatLieu: 'Đá Terrazzo mài bóng, chân gỗ tần bì',
    KichThuoc: 'Đường kính 80 x Cao 42 cm', MauSac: 'Trắng vân đá / Nâu sáng',
    SoLuongTon: 11, MoiVe: true, BanChay: false,
    HinhAnh: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Mặt bàn đá Terrazzo chống ố, bo cạnh mềm mại an toàn cho gia đình có trẻ nhỏ. Phù hợp với mọi không gian căn hộ chung cư hiện đại.'
  },
  {
    MaSP: 'SP003', MaDM: 'DM01', TenSP: 'Kệ Tivi Gỗ Óc Chó Cánh Mây Đan',
    Gia: 7850000, GiaCu: null,
    ChatLieu: 'Gỗ óc chó tự nhiên, mây mắt cáo thủ công',
    KichThuoc: '180 x 40 x 52 cm', MauSac: 'Nâu óc chó',
    SoLuongTon: 2, MoiVe: false, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Điểm nhấn cánh mây đan mắt cáo thông thoáng cho thiết bị điện tử. Bản lề giảm chấn êm ái, ngăn chứa rộng rãi.'
  },
  {
    MaSP: 'SP004', MaDM: 'DM01', TenSP: 'Ghế Thư Giãn Bành Gỗ Tần Bì',
    Gia: 3950000, GiaCu: 4500000,
    ChatLieu: 'Gỗ tần bì, đệm vải bố cao cấp',
    KichThuoc: '72 x 76 x 80 cm', MauSac: 'Xanh ô liu / Gỗ tự nhiên',
    SoLuongTon: 0, MoiVe: false, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Góc tựa lưng nghiêng 105 độ ôm trọn cột sống, lý tưởng để đọc sách và thư giãn bên cửa sổ.'
  },
  {
    MaSP: 'SP005', MaDM: 'DM02', TenSP: 'Giường Ngủ Gỗ Sồi Đầu Giường Bọc Nỉ',
    Gia: 12900000, GiaCu: 14500000,
    ChatLieu: 'Gỗ sồi Mỹ, nỉ nhập khẩu',
    KichThuoc: '180 x 200 x 98 cm', MauSac: 'Gỗ sồi / Xám ấm',
    SoLuongTon: 5, MoiVe: true, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Kết cấu mộng gỗ chắc chắn, không phát tiếng kêu khi sử dụng. Tựa đầu bọc nỉ êm ái thuận tiện đọc sách trước khi ngủ.'
  },
  {
    MaSP: 'SP006', MaDM: 'DM02', TenSP: 'Tủ Đầu Giường 2 Ngăn Kéo Tối Giản',
    Gia: 2150000, GiaCu: null,
    ChatLieu: 'Gỗ cao su ghép phủ Veneer sồi',
    KichThuoc: '48 x 40 x 52 cm', MauSac: 'Vàng sồi tự nhiên',
    SoLuongTon: 14, MoiVe: false, BanChay: false,
    HinhAnh: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Hai ngăn kéo ray bi trượt mượt mà, kích thước nhỏ gọn tối ưu diện tích phòng ngủ.'
  },
  {
    MaSP: 'SP007', MaDM: 'DM02', TenSP: 'Tủ Quần Áo 3 Cánh Gỗ Sồi Thanh Lịch',
    Gia: 15600000, GiaCu: 17200000,
    ChatLieu: 'Gỗ sồi tự nhiên kết hợp MDF chống ẩm',
    KichThuoc: '160 x 58 x 210 cm', MauSac: 'Gỗ sáng / Tay nắm âm',
    SoLuongTon: 3, MoiVe: true, BanChay: false,
    HinhAnh: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Chia khoang khoa học gồm thanh treo đồ dài, kệ gấp và hộc kéo phụ kiện, phù hợp gia đình 2-4 người.'
  },
  {
    MaSP: 'SP008', MaDM: 'DM03', TenSP: 'Bộ Bàn Ăn 6 Ghế Gỗ Sồi Bắc Âu',
    Gia: 13800000, GiaCu: 15500000,
    ChatLieu: 'Gỗ sồi nguyên khối, đệm da Microfiber',
    KichThuoc: '160 x 85 x 75 cm', MauSac: 'Gỗ tự nhiên / Nâu đất',
    SoLuongTon: 4, MoiVe: false, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Bộ bàn ăn ấm cúng với mặt bàn dày dặn phủ sơn PU mờ chống nước, 6 ghế lưng cong nâng đỡ thoải mái.'
  },
  {
    MaSP: 'SP009', MaDM: 'DM03', TenSP: 'Ghế Ăn Wishbone Dây Cói Thủ Công',
    Gia: 1850000, GiaCu: 2100000,
    ChatLieu: 'Gỗ tần bì uốn cong, mặt đan dây cói',
    KichThuoc: '55 x 52 x 76 cm', MauSac: 'Gỗ sồi sáng',
    SoLuongTon: 18, MoiVe: true, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Biểu tượng thiết kế Đan Mạch, trọng lượng nhẹ, đan dây thủ công thoáng khí và bền bỉ theo năm tháng.'
  },
  {
    MaSP: 'SP010', MaDM: 'DM04', TenSP: 'Bàn Làm Việc Gỗ Sồi Có Hộc Kéo',
    Gia: 4650000, GiaCu: 5200000,
    ChatLieu: 'Gỗ sồi tự nhiên, sơn dầu lau an toàn',
    KichThuoc: '120 x 60 x 75 cm', MauSac: 'Vàng sồi ấm',
    SoLuongTon: 9, MoiVe: true, BanChay: true,
    HinhAnh: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Tích hợp 2 ngăn kéo gọn gàng và lỗ luồn dây điện tinh tế giúp góc làm việc tại nhà luôn ngăn nắp.'
  },
  {
    MaSP: 'SP011', MaDM: 'DM04', TenSP: 'Kệ Sách Đứng 5 Tầng Khung Gỗ Sồi',
    Gia: 3450000, GiaCu: null,
    ChatLieu: 'Gỗ sồi tự nhiên',
    KichThuoc: '80 x 32 x 175 cm', MauSac: 'Gỗ tự nhiên',
    SoLuongTon: 2, MoiVe: false, BanChay: false,
    HinhAnh: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Thiết kế mở 5 tầng chịu lực tốt, dễ dàng trưng bày sách, cây xanh và đồ trang trí.'
  },
  {
    MaSP: 'SP012', MaDM: 'DM04', TenSP: 'Ghế Làm Việc Lưng Lưới Công Thái Học',
    Gia: 3290000, GiaCu: 3800000,
    ChatLieu: 'Lưới thoáng khí, khung hợp kim nhôm',
    KichThuoc: '64 x 62 x 112 cm', MauSac: 'Xám ghi / Trắng kem',
    SoLuongTon: 7, MoiVe: true, BanChay: false,
    HinhAnh: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
    HinhAnhPhu: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80'
    ],
    MoTa: 'Hỗ trợ thắt lưng điều chỉnh linh hoạt, piston nâng hạ chuẩn BIFMA cho ngày làm việc dài không mỏi lưng.'
  }
];

const SEED_ORDERS = [
  {
    MaDon: 'DH20261120001',
    MaTK: 'TK002',
    NgayDat: '2026-11-20T09:15:00',
    HoTen: 'Trần Minh Anh',
    SoDienThoai: '0912345678',
    DiaChi: 'Số 18 Nguyễn Văn Linh, Mỹ Hào, Hưng Yên',
    GhiChu: 'Giao giờ hành chính giúp mình',
    PhuongThucTT: 'Thanh toán khi nhận hàng (COD)',
    TongTien: 18700000,
    TrangThai: 'Hoàn thành',
    ChiTiet: [
      { MaSP: 'SP001', TenSP: 'Sofa Gỗ Sồi Bọc Vải Linen An Nhiên', DonGia: 14500000, SoLuong: 1, HinhAnh: SEED_PRODUCTS[0].HinhAnh },
      { MaSP: 'SP002', TenSP: 'Bàn Trà Tròn Mặt Đá Terrazzo Mộc', DonGia: 4200000, SoLuong: 1, HinhAnh: SEED_PRODUCTS[1].HinhAnh }
    ]
  },
  {
    MaDon: 'DH20261122001',
    MaTK: 'TK003',
    NgayDat: '2026-11-22T14:30:00',
    HoTen: 'Lê Hoàng Nam',
    SoDienThoai: '0976543210',
    DiaChi: 'KĐT Ecopark, Văn Giang, Hưng Yên',
    GhiChu: 'Gọi trước khi giao 30 phút',
    PhuongThucTT: 'Thanh toán trực tuyến (Mô phỏng)',
    TongTien: 13800000,
    TrangThai: 'Đang giao',
    ChiTiet: [
      { MaSP: 'SP008', TenSP: 'Bộ Bàn Ăn 6 Ghế Gỗ Sồi Bắc Âu', DonGia: 13800000, SoLuong: 1, HinhAnh: SEED_PRODUCTS[7].HinhAnh }
    ]
  },
  {
    MaDon: 'DH20261124001',
    MaTK: 'TK002',
    NgayDat: '2026-11-24T10:05:00',
    HoTen: 'Trần Minh Anh',
    SoDienThoai: '0912345678',
    DiaChi: 'Số 18 Nguyễn Văn Linh, Mỹ Hào, Hưng Yên',
    GhiChu: '',
    PhuongThucTT: 'Thanh toán khi nhận hàng (COD)',
    TongTien: 8350000,
    TrangThai: 'Chờ duyệt',
    ChiTiet: [
      { MaSP: 'SP010', TenSP: 'Bàn Làm Việc Gỗ Sồi Có Hộc Kéo', DonGia: 4650000, SoLuong: 1, HinhAnh: SEED_PRODUCTS[9].HinhAnh },
      { MaSP: 'SP009', TenSP: 'Ghế Ăn Wishbone Dây Cói Thủ Công', DonGia: 1850000, SoLuong: 2, HinhAnh: SEED_PRODUCTS[8].HinhAnh }
    ]
  },
  {
    MaDon: 'DH20261118001',
    MaTK: 'TK003',
    NgayDat: '2026-11-18T16:45:00',
    HoTen: 'Lê Hoàng Nam',
    SoDienThoai: '0976543210',
    DiaChi: 'KĐT Ecopark, Văn Giang, Hưng Yên',
    GhiChu: 'Đổi sang mẫu khác',
    PhuongThucTT: 'Thanh toán khi nhận hàng (COD)',
    TongTien: 2150000,
    TrangThai: 'Đã hủy',
    ChiTiet: [
      { MaSP: 'SP006', TenSP: 'Tủ Đầu Giường 2 Ngăn Kéo Tối Giản', DonGia: 2150000, SoLuong: 1, HinhAnh: SEED_PRODUCTS[5].HinhAnh }
    ]
  }
];

const DB = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARTS)) {
      localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    }
  },

  getUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); },
  saveUsers(list) { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list)); },

  getCategories() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]'); },
  saveCategories(list) { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list)); },

  getProducts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'); },
  saveProducts(list) { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list)); },

  getAllCarts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CARTS) || '{}'); },
  saveAllCarts(obj) { localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(obj)); },

  getUserCart(maTK) {
    const carts = this.getAllCarts();
    return carts[maTK] || [];
  },
  saveUserCart(maTK, items) {
    const carts = this.getAllCarts();
    carts[maTK] = items;
    this.saveAllCarts(carts);
  },

  getGuestCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.GUEST_CART) || '[]');
    } catch {
      return [];
    }
  },
  saveGuestCart(items) {
    localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
  },
  getCurrentCart() {
    const user = this.getSession();
    return user ? this.getUserCart(user.MaTK) : this.getGuestCart();
  },
  saveCurrentCart(items) {
    const user = this.getSession();
    if (user) {
      this.saveUserCart(user.MaTK, items);
    } else {
      this.saveGuestCart(items);
    }
  },
  clearCurrentCart() {
    const user = this.getSession();
    if (user) {
      this.saveUserCart(user.MaTK, []);
    } else {
      this.saveGuestCart([]);
    }
  },
  mergeGuestCartToUser(maTK) {
    const guestCart = this.getGuestCart();
    if (!guestCart || guestCart.length === 0) return;
    const userCart = this.getUserCart(maTK);
    const products = this.getProducts();

    guestCart.forEach(gItem => {
      const existing = userCart.find(uItem => uItem.MaSP === gItem.MaSP);
      const sp = products.find(p => p.MaSP === gItem.MaSP);
      const maxStock = sp ? sp.SoLuongTon : 999;
      if (existing) {
        existing.SoLuong = Math.min(existing.SoLuong + gItem.SoLuong, maxStock);
      } else {
        userCart.push({ MaSP: gItem.MaSP, SoLuong: Math.min(gItem.SoLuong, maxStock) });
      }
    });

    this.saveUserCart(maTK, userCart);
    this.saveGuestCart([]);
  },

  getAppliedVoucher() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLIED_VOUCHER) || 'null');
    } catch {
      return null;
    }
  },
  setAppliedVoucher(voucher) {
    if (!voucher) {
      localStorage.removeItem(STORAGE_KEYS.APPLIED_VOUCHER);
    } else {
      localStorage.setItem(STORAGE_KEYS.APPLIED_VOUCHER, JSON.stringify(voucher));
    }
  },
  calculateOrderDiscount(subtotal, shippingFee, voucherCode) {
    if (!voucherCode) return { discount: 0, freeShipping: false, voucher: null, message: '' };
    const v = AVAILABLE_VOUCHERS.find(item => item.code.toUpperCase() === voucherCode.trim().toUpperCase());
    if (!v) {
      return { discount: 0, freeShipping: false, voucher: null, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
    }
    if (subtotal < v.minOrder) {
      return {
        discount: 0,
        freeShipping: false,
        voucher: null,
        message: `Mã ${v.code} chỉ áp dụng cho đơn hàng từ ${formatPrice(v.minOrder)}.`
      };
    }
    let discount = 0;
    let freeShipping = false;
    if (v.type === 'percent') {
      discount = Math.round((subtotal * v.value) / 100);
      if (v.maxDiscount && discount > v.maxDiscount) {
        discount = v.maxDiscount;
      }
    } else if (v.type === 'fixed') {
      discount = Math.min(v.value, subtotal);
    } else if (v.type === 'shipping') {
      freeShipping = true;
      discount = shippingFee;
    }
    return { discount, freeShipping, voucher: v, message: `Áp dụng thành công mã ${v.code}: ${v.title}!` };
  },

  getOrders() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'); },
  saveOrders(list) { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list)); },

  getSession() {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const sess = JSON.parse(raw);
    const fresh = this.getUsers().find(u => u.MaTK === sess.MaTK);
    if (!fresh || fresh.TrangThai === 'Bị khóa') {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
    return fresh;
  },
  setSession(user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ MaTK: user.MaTK }));
    try {
      this.mergeGuestCartToUser(user.MaTK);
    } catch (e) {
      console.warn('mergeGuestCart error', e);
    }
  },
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getAdminSession() {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!raw) return null;
    const sess = JSON.parse(raw);
    const fresh = this.getUsers().find(u => u.MaTK === sess.MaTK && u.VaiTro === 'admin');
    return fresh || null;
  },
  setAdminSession(user) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({ MaTK: user.MaTK }));
  },
  clearAdminSession() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  // Thuật toán SinhMaDonHang() theo Hình 3-41
  sinhMaDonHang() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `DH${yyyy}${mm}${dd}`;
    const orders = this.getOrders();
    const todayOrders = orders.filter(o => o.MaDon.startsWith(prefix));
    const nextSeq = todayOrders.length > 0 ? todayOrders.length + 1 : 1;
    let code = `${prefix}${String(nextSeq).padStart(3, '0')}`;
    let seq = nextSeq;
    while (orders.some(o => o.MaDon === code)) {
      seq++;
      code = `${prefix}${String(seq).padStart(3, '0')}`;
    }
    return code;
  }
};

// Bảo mật chống XSS (Bảng 3-6 mục 4)
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(num) {
  return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr || '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusClass(status) {
  switch (status) {
    case 'Chờ duyệt': return 'st-pending';
    case 'Đang giao': return 'st-shipping';
    case 'Hoàn thành': return 'st-done';
    case 'Đã hủy': return 'st-cancel';
    default: return 'st-pending';
  }
}

function getCategoryName(maDM) {
  const dm = DB.getCategories().find(c => c.MaDM === maDM);
  return dm ? dm.TenDM : 'Chưa phân loại';
}

function safeImg(url) {
  return url && url.trim() ? url : FALLBACK_IMG;
}

DB.init();
