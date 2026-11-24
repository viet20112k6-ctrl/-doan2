/* ==========================================================================
   MỘC AN FURNITURE - CHECKOUT CONTROLLER (checkout.html - ND07)
   ========================================================================== */

function initCheckoutPage() {
  renderHeader('cart');
  renderFooter();

  const container = document.getElementById('checkout-container');
  if (!container) return;

  const cart = DB.getCurrentCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="max-width:620px;margin:40px auto;text-align:center;">
        <div style="font-size:3rem;margin-bottom:12px;">🛒</div>
        <h3>Giỏ hàng của bạn đang trống</h3>
        <p style="margin-bottom:20px;color:var(--text-muted);">
          Bạn cần có ít nhất 1 sản phẩm trong giỏ hàng để tiến hành đặt hàng và thanh toán.
        </p>
        <a href="products.html" class="btn btn-primary btn-lg">Khám phá sản phẩm ngay</a>
      </div>
    `;
    return;
  }

  const user = DB.getSession();
  const products = DB.getProducts();

  let subtotal = 0;
  const itemsSummaryHTML = cart.map(item => {
    const sp = products.find(p => p.MaSP === item.MaSP);
    if (!sp) return '';
    const lineTotal = sp.Gia * item.SoLuong;
    subtotal += lineTotal;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);font-size:0.9rem;">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${escapeHTML(safeImg(sp.HinhAnh))}" alt="${escapeHTML(sp.TenSP)}" style="width:48px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--border);" onerror="this.src='${FALLBACK_IMG}'">
          <div>
            <div style="font-weight:600;color:var(--olive-dark);">${escapeHTML(sp.TenSP)}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${formatPrice(sp.Gia)} × <strong>${item.SoLuong}</strong></div>
          </div>
        </div>
        <div style="font-weight:700;color:var(--terracotta);white-space:nowrap;">
          ${formatPrice(lineTotal)}
        </div>
      </div>
    `;
  }).join('');

  // Tính phí ship và voucher
  const rawShipping = subtotal >= 10000000 ? 0 : 250000;
  const appliedVoucherCode = DB.getAppliedVoucher();
  const discountRes = DB.calculateOrderDiscount(subtotal, rawShipping, appliedVoucherCode);
  const shipping = discountRes.freeShipping ? 0 : rawShipping;
  const discountAmount = discountRes.discount || 0;
  const grandTotal = Math.max(0, subtotal + shipping - discountAmount);

  // Sinh mã chuyển khoản tạm thời
  const tempOrderCode = 'MOCAN' + Math.floor(100000 + Math.random() * 900000);

  // Danh sách tỉnh thành phố
  const PROVINCES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Hưng Yên', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Bắc Ninh', 'Bình Dương', 'Đồng Nai', 'Quảng Ninh', 'Hải Dương', 'Nam Định',
    'Thái Bình', 'Nghệ An', 'Thừa Thiên Huế', 'Khánh Hòa', 'Bà Rịa - Vũng Tàu', 'Lâm Đồng'
  ];

  container.innerHTML = `
    <div class="checkout-stepper">
      <div class="step-item done"><span class="step-num">✓</span><span>Giỏ hàng</span></div>
      <div class="step-line active"></div>
      <div class="step-item active"><span class="step-num">2</span><span>Đặt hàng & Thanh toán</span></div>
      <div class="step-line"></div>
      <div class="step-item"><span class="step-num">3</span><span>Hoàn tất đơn hàng</span></div>
    </div>

    ${user ? `
      <div style="background:#eef5ea;border:1px solid #c9dec2;padding:10px 16px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.88rem;display:flex;align-items:center;justify-content:space-between;">
        <div>👤 Đang đặt hàng với tài khoản: <strong>${escapeHTML(user.HoTen)}</strong> (${escapeHTML(user.Email)})</div>
        <a href="orders.html" style="font-weight:600;color:var(--olive-dark);">Lịch sử đơn hàng →</a>
      </div>
    ` : `
      <div style="background:#fff9ed;border:1px solid #fae4b8;padding:12px 16px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.88rem;">
        💡 <strong>Bạn đã có tài khoản Mộc An?</strong>
        <a href="auth.html?return=checkout.html" style="font-weight:600;color:var(--terracotta);text-decoration:underline;margin-left:4px;">Đăng nhập ngay</a>
        để tự động lưu đơn hàng vào tài khoản và nhận ưu đãi tích điểm. Hoặc bạn có thể điền thông tin bên dưới để đặt hàng nhanh.
      </div>
    `}

    <div class="cart-layout">
      <!-- Cột trái: Form thông tin & Phương thức thanh toán -->
      <form class="card-box" id="checkout-form">
        <h2 style="font-size:1.3rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span>📍</span> 1. Thông tin giao nhận hàng
        </h2>
        <div id="checkout-error" class="alert alert-error" style="display:none;margin-bottom:16px;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label for="co-name">Họ và tên người nhận <span style="color:#dc2626;">*</span></label>
            <input type="text" id="co-name" class="form-control" value="${escapeHTML(user ? user.HoTen : '')}" placeholder="Ví dụ: Nguyễn Văn An" required>
          </div>
          <div class="form-group">
            <label for="co-phone">Số điện thoại liên hệ <span style="color:#dc2626;">*</span></label>
            <input type="tel" id="co-phone" class="form-control" value="${escapeHTML(user ? user.SoDienThoai || '' : '')}" placeholder="Ví dụ: 0988123456" required>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label for="co-email">Email nhận hóa đơn & thông báo <span style="color:#dc2626;">*</span></label>
            <input type="email" id="co-email" class="form-control" value="${escapeHTML(user ? user.Email : '')}" placeholder="email@example.com" required>
          </div>
          <div class="form-group">
            <label for="co-city">Tỉnh / Thành phố <span style="color:#dc2626;">*</span></label>
            <select id="co-city" class="form-control" required>
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              ${PROVINCES.map(p => `<option value="${escapeHTML(p)}" ${p === 'Hà Nội' ? 'selected' : ''}>${escapeHTML(p)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;">
          <div class="form-group">
            <label for="co-district">Quận / Huyện <span style="color:#dc2626;">*</span></label>
            <input type="text" id="co-district" class="form-control" placeholder="Quận/Huyện/Thị xã" required>
          </div>
          <div class="form-group">
            <label for="co-address">Địa chỉ chi tiết (Số nhà, đường...) <span style="color:#dc2626;">*</span></label>
            <input type="text" id="co-address" class="form-control" placeholder="Số nhà, ngõ/ngách, tòa nhà, tên đường..." required>
          </div>
        </div>

        <div class="form-group">
          <label for="co-note">Ghi chú giao hàng & lắp đặt (tùy chọn)</label>
          <textarea id="co-note" class="form-control" rows="2" placeholder="Ví dụ: Giao giờ hành chính, gọi trước 30 phút, căn hộ tầng 8 có thang máy..."></textarea>
        </div>

        <!-- Phương thức thanh toán -->
        <h2 style="font-size:1.3rem;margin:28px 0 14px;display:flex;align-items:center;gap:8px;">
          <span>💳</span> 2. Phương thức thanh toán
        </h2>

        <div class="payment-methods-list" id="payment-methods-group">
          <!-- 1. COD -->
          <div class="payment-card selected" id="card-pay-cod">
            <div class="payment-card-header" onclick="selectPaymentMethod('cod')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="COD" id="pay-cod" checked>
                <div>
                  <strong>💵 Thanh toán khi nhận hàng (COD)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Đồng kiểm tra sản phẩm trước khi thanh toán cho nhân viên giao vận Mộc An.</div>
                </div>
              </div>
              <span class="status-badge" style="background:#e5e7eb;color:#374151;">Phổ biến</span>
            </div>
          </div>

          <!-- 2. VietQR / Ngân hàng -->
          <div class="payment-card" id="card-pay-vietqr">
            <div class="payment-card-header" onclick="selectPaymentMethod('vietqr')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="VietQR" id="pay-vietqr">
                <div>
                  <strong>🏦 Chuyển khoản ngân hàng qua mã VietQR (Tự động 24/7)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Quét mã QR qua mọi ứng dụng ngân hàng hoặc ví điện tử. Xác nhận tức thì.</div>
                </div>
              </div>
              <span class="status-badge" style="background:#dcfce7;color:#15803d;">Khuyên dùng</span>
            </div>
            <div class="payment-card-body" id="body-pay-vietqr" style="display:none;">
              <div class="vietqr-box">
                <div style="text-align:center;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`2|99|0988123456|CONG TY NOI THAT MOC AN||0|0|${grandTotal}|${tempOrderCode}|transfer_myqr`)}" alt="VietQR Mộc An" class="vietqr-img" onerror="this.src='${FALLBACK_IMG}'">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Quét bằng app ngân hàng</div>
                </div>
                <div class="bank-info-table">
                  <div><strong>Ngân hàng:</strong> MBBank – Ngân hàng Quân Đội</div>
                  <div>
                    <strong>Số tài khoản:</strong> <span style="font-family:monospace;font-weight:700;font-size:1rem;color:var(--olive-dark);">0988123456</span>
                    <button type="button" class="copy-pill" onclick="copyToClipboard('0988123456', 'Đã sao chép số tài khoản!')">📋 Chép STK</button>
                  </div>
                  <div><strong>Chủ tài khoản:</strong> CONG TY NOI THAT MOC AN</div>
                  <div>
                    <strong>Số tiền:</strong> <span style="font-weight:700;color:var(--terracotta);">${formatPrice(grandTotal)}</span>
                    <button type="button" class="copy-pill" onclick="copyToClipboard('${grandTotal}', 'Đã sao chép số tiền!')">📋 Chép tiền</button>
                  </div>
                  <div>
                    <strong>Nội dung CK:</strong> <span style="font-family:monospace;font-weight:700;color:var(--olive-dark);">${tempOrderCode}</span>
                    <button type="button" class="copy-pill" onclick="copyToClipboard('${tempOrderCode}', 'Đã sao chép nội dung!')">📋 Chép cú pháp</button>
                  </div>
                  <div style="font-size:0.78rem;color:#b4684b;margin-top:6px;">
                    ⚡ Hệ thống sẽ tự động xác thực và cập nhật trạng thái đơn hàng ngay khi nhận tiền.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Thẻ quốc tế Visa/Mastercard -->
          <div class="payment-card" id="card-pay-card">
            <div class="payment-card-header" onclick="selectPaymentMethod('card')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="Card" id="pay-card">
                <div>
                  <strong>💳 Thẻ tín dụng / Ghi nợ quốc tế (Visa, MasterCard, JCB)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Cổng thanh toán bảo mật chuẩn PCI-DSS mã hóa 256-bit (Mô phỏng).</div>
                </div>
              </div>
              <span style="font-size:1.1rem;">💳</span>
            </div>
            <div class="payment-card-body" id="body-pay-card" style="display:none;">
              <div class="credit-card-form">
                <div class="form-group" style="margin-bottom:10px;">
                  <label for="cc-number">Số thẻ <span style="color:#dc2626;">*</span></label>
                  <input type="text" id="cc-number" class="form-control" placeholder="4111 •••• •••• 4242" maxlength="19" oninput="formatCardNumber(this)">
                </div>
                <div class="card-row-grid">
                  <div class="form-group" style="margin-bottom:10px;">
                    <label for="cc-holder">Tên in trên thẻ <span style="color:#dc2626;">*</span></label>
                    <input type="text" id="cc-holder" class="form-control" placeholder="NGUYEN VAN A" style="text-transform:uppercase;">
                  </div>
                  <div class="card-row-grid" style="gap:8px;">
                    <div class="form-group" style="margin-bottom:10px;">
                      <label for="cc-exp">Hạn dùng <span style="color:#dc2626;">*</span></label>
                      <input type="text" id="cc-exp" class="form-control" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group" style="margin-bottom:10px;">
                      <label for="cc-cvv">CVV <span style="color:#dc2626;">*</span></label>
                      <input type="password" id="cc-cvv" class="form-control" placeholder="•••" maxlength="4">
                    </div>
                  </div>
                </div>
                <div style="font-size:0.78rem;color:var(--text-muted);">🔒 Giao dịch được bảo vệ và mã hóa mô phỏng an toàn tuyệt đối.</div>
              </div>
            </div>
          </div>

          <!-- 4. Ví MoMo / VNPay -->
          <div class="payment-card" id="card-pay-wallet">
            <div class="payment-card-header" onclick="selectPaymentMethod('wallet')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="Wallet" id="pay-wallet">
                <div>
                  <strong>📱 Ví điện tử MoMo / ZaloPay / VNPay (Mô phỏng)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Thanh toán 1 chạm tiện lợi qua app Ví điện tử trên điện thoại.</div>
                </div>
              </div>
              <span style="font-size:1.1rem;">📱</span>
            </div>
            <div class="payment-card-body" id="body-pay-wallet" style="display:none;">
              <div style="text-align:center;padding:16px;background:#fff;border-radius:6px;margin-top:12px;border:1px solid var(--border);">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`momo://pay?action=pay&amount=${grandTotal}&orderId=${tempOrderCode}`)}" alt="Mã QR Ví điện tử" style="width:130px;height:130px;" onerror="this.src='${FALLBACK_IMG}'">
                <div style="font-size:0.85rem;color:var(--olive-dark);font-weight:600;margin-top:8px;">Mở ứng dụng MoMo / VNPay để quét mã thanh toán</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">Số tiền: <strong>${formatPrice(grandTotal)}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" id="btn-submit-order" class="btn btn-accent btn-lg" style="width:100%;font-size:1.1rem;padding:14px;margin-top:14px;">
          Xác nhận đặt hàng (${formatPrice(grandTotal)})
        </button>
        <div style="font-size:0.8rem;color:var(--text-muted);text-align:center;margin-top:10px;">
          Bằng việc nhấn đặt hàng, quý khách đồng ý với Chính sách mua hàng và bảo hành của Mộc An.
        </div>
      </form>

      <!-- Cột phải: Tóm tắt đơn hàng -->
      <div class="card-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="font-size:1.2rem;">Đơn hàng của bạn</h3>
          <a href="cart.html" style="font-size:0.84rem;color:var(--terracotta);">Sửa giỏ hàng</a>
        </div>

        <div style="max-height:340px;overflow-y:auto;padding-right:4px;">
          ${itemsSummaryHTML}
        </div>

        <!-- Khung áp dụng Voucher -->
        <div class="voucher-section" style="margin-top:16px;">
          <div style="font-weight:600;font-size:0.88rem;margin-bottom:8px;">Mã ưu đãi / Khuyến mãi</div>
          ${discountRes.voucher ? `
            <div class="applied-voucher-badge">
              <div>
                <strong>🎟 ${escapeHTML(discountRes.voucher.code)}</strong>: ${escapeHTML(discountRes.voucher.title)}
                <div style="font-size:0.78rem;opacity:0.9;">-${formatPrice(discountAmount)}</div>
              </div>
              <button type="button" onclick="removeCheckoutVoucher()" style="background:transparent;border:none;color:#dc2626;cursor:pointer;font-weight:600;">Gỡ</button>
            </div>
          ` : `
            <div class="voucher-input-row">
              <input type="text" id="checkout-voucher-input" class="form-control" placeholder="Nhập mã ưu đãi..." style="text-transform:uppercase;">
              <button type="button" class="btn btn-primary" onclick="applyCheckoutVoucher()">Áp dụng</button>
            </div>
            <div class="voucher-pill-list">
              ${AVAILABLE_VOUCHERS.map(v => `
                <button type="button" class="voucher-pill" onclick="quickApplyCheckoutVoucher('${escapeHTML(v.code)}')">
                  ${escapeHTML(v.code)}
                </button>
              `).join('')}
            </div>
          `}
        </div>

        <div class="summary-row" style="margin-top:12px;">
          <span>Tạm tính</span>
          <strong>${formatPrice(subtotal)}</strong>
        </div>
        <div class="summary-row">
          <span>Phí vận chuyển</span>
          <span>${shipping === 0 ? '<strong style="color:var(--olive);">Miễn phí</strong>' : formatPrice(shipping)}</span>
        </div>
        ${discountAmount > 0 ? `
          <div class="summary-row" style="color:var(--terracotta);">
            <span>Giảm giá (${escapeHTML(discountRes.voucher.code)})</span>
            <strong>-${formatPrice(discountAmount)}</strong>
          </div>
        ` : ''}
        <div class="summary-total">
          <span>Tổng thanh toán</span>
          <span>${formatPrice(grandTotal)}</span>
        </div>

        <div class="trust-badges-grid">
          <div class="trust-item">🚚 <span>Miễn phí giao hàng & lắp đặt tận phòng</span></div>
          <div class="trust-item">🛡️ <span>Bảo hành chính hãng 24 tháng tận nhà</span></div>
          <div class="trust-item">📞 <span>Hotline hỗ trợ 24/7: 0988 123 456</span></div>
        </div>
      </div>
    </div>
  `;

  // Tương tác phương thức thanh toán
  window.selectPaymentMethod = (method) => {
    ['cod', 'vietqr', 'card', 'wallet'].forEach(m => {
      const cardEl = document.getElementById(`card-pay-${m}`);
      const bodyEl = document.getElementById(`body-pay-${m}`);
      const radioEl = document.getElementById(`pay-${m}`);
      if (m === method) {
        if (cardEl) cardEl.classList.add('selected');
        if (bodyEl) bodyEl.style.display = 'block';
        if (radioEl) radioEl.checked = true;
      } else {
        if (cardEl) cardEl.classList.remove('selected');
        if (bodyEl) bodyEl.style.display = 'none';
        if (radioEl) radioEl.checked = false;
      }
    });
  };

  window.formatCardNumber = (el) => {
    let val = el.value.replace(/\D/g, '').substring(0, 16);
    el.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  window.copyToClipboard = (text, successMsg) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || 'Đã sao chép vào bộ nhớ đệm!');
    }).catch(() => {
      showToast('Đã sao chép: ' + text);
    });
  };

  window.applyCheckoutVoucher = () => {
    const input = document.getElementById('checkout-voucher-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá.', 'error');
      return;
    }
    const res = DB.calculateOrderDiscount(subtotal, 250000, code);
    if (!res.voucher) {
      showToast(res.message || 'Mã không hợp lệ.', 'error');
      return;
    }
    DB.setAppliedVoucher(code);
    showToast(res.message);
    initCheckoutPage();
  };

  window.quickApplyCheckoutVoucher = (code) => {
    const res = DB.calculateOrderDiscount(subtotal, 250000, code);
    if (!res.voucher) {
      showToast(res.message || 'Mã không hợp lệ.', 'error');
      return;
    }
    DB.setAppliedVoucher(code);
    showToast(res.message);
    initCheckoutPage();
  };

  window.removeCheckoutVoucher = () => {
    DB.setAppliedVoucher(null);
    showToast('Đã gỡ mã giảm giá.');
    initCheckoutPage();
  };

  // Xử lý gửi Form Đặt hàng
  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = document.getElementById('checkout-error');
    errEl.style.display = 'none';

    const hoTen = document.getElementById('co-name').value.trim();
    const sdt = document.getElementById('co-phone').value.trim();
    const email = document.getElementById('co-email').value.trim();
    const city = document.getElementById('co-city').value;
    const district = document.getElementById('co-district').value.trim();
    const address = document.getElementById('co-address').value.trim();
    const ghiChu = document.getElementById('co-note').value.trim();

    const selectedPayRadio = document.querySelector('input[name="payment_method"]:checked');
    const payVal = selectedPayRadio ? selectedPayRadio.value : 'COD';

    let ptTT = 'Thanh toán khi nhận hàng (COD)';
    let trangThaiTT = 'Chưa thanh toán (COD)';

    if (payVal === 'VietQR') {
      ptTT = 'Chuyển khoản ngân hàng qua VietQR';
      trangThaiTT = 'Đã thanh toán (Mô phỏng VietQR)';
    } else if (payVal === 'Card') {
      const ccNum = (document.getElementById('cc-number') || {}).value || '';
      const ccHolder = (document.getElementById('cc-holder') || {}).value || '';
      if (!ccNum || ccNum.replace(/\s/g, '').length < 15 || !ccHolder) {
        errEl.textContent = 'Vui lòng điền đầy đủ số thẻ và tên in trên thẻ thanh toán quốc tế.';
        errEl.style.display = 'block';
        return;
      }
      ptTT = 'Thẻ tín dụng / Ghi nợ quốc tế (Visa/Mastercard)';
      trangThaiTT = 'Đã thanh toán trực tuyến';
    } else if (payVal === 'Wallet') {
      ptTT = 'Ví điện tử MoMo / VNPay';
      trangThaiTT = 'Đã thanh toán qua Ví điện tử';
    }

    if (!hoTen || !sdt || !email || !city || !district || !address) {
      errEl.textContent = 'Vui lòng điền đầy đủ các thông tin giao nhận bắt buộc (*).';
      errEl.style.display = 'block';
      return;
    }

    if (!/^[0-9]{9,11}$/.test(sdt.replace(/\s/g, ''))) {
      errEl.textContent = 'Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).';
      errEl.style.display = 'block';
      return;
    }

    // Kiểm tra tồn kho trước khi lưu
    const freshProducts = DB.getProducts();
    const currentCart = DB.getCurrentCart();
    const chiTiet = [];

    for (const item of currentCart) {
      const sp = freshProducts.find(p => p.MaSP === item.MaSP);
      if (!sp || sp.SoLuongTon < item.SoLuong) {
        errEl.textContent = `Sản phẩm "${sp ? sp.TenSP : item.MaSP}" hiện không còn đủ tồn kho (còn ${sp ? sp.SoLuongTon : 0}). Vui lòng cập nhật giỏ hàng.`;
        errEl.style.display = 'block';
        return;
      }
      chiTiet.push({
        MaSP: sp.MaSP,
        TenSP: sp.TenSP,
        DonGia: sp.Gia,
        SoLuong: item.SoLuong,
        HinhAnh: sp.HinhAnh,
        ChatLieu: sp.ChatLieu || ''
      });
    }

    // Nút submit chuyển trạng thái loading
    const submitBtn = document.getElementById('btn-submit-order');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Đang xử lý đơn hàng & xác nhận...';

    setTimeout(() => {
      // Trừ tồn kho
      for (const ct of chiTiet) {
        const sp = freshProducts.find(p => p.MaSP === ct.MaSP);
        if (sp) sp.SoLuongTon = Math.max(0, sp.SoLuongTon - ct.SoLuong);
      }
      DB.saveProducts(freshProducts);

      // Sinh mã đơn hàng
      const maDon = DB.sinhMaDonHang();
      const fullAddress = `${address}, ${district}, ${city}`;

      const newOrder = {
        MaDon: maDon,
        MaTK: user ? user.MaTK : 'GUEST',
        NgayDat: new Date().toISOString(),
        HoTen: hoTen,
        SoDienThoai: sdt,
        Email: email,
        DiaChi: fullAddress,
        TinhThanh: city,
        GhiChu: ghiChu,
        PhuongThucTT: ptTT,
        TrangThaiTT: trangThaiTT,
        TamTinh: subtotal,
        PhiVanChuyen: shipping,
        GiamGia: discountAmount,
        MaVoucher: discountRes.voucher ? discountRes.voucher.code : '',
        TongTien: grandTotal,
        TrangThai: 'Chờ duyệt',
        ChiTiet: chiTiet
      };

      const orders = DB.getOrders();
      orders.unshift(newOrder);
      DB.saveOrders(orders);

      // Làm trống giỏ hàng & voucher
      DB.clearCurrentCart();
      DB.setAppliedVoucher(null);
      updateCartBadge();

      // Hiển thị Màn hình Đặt hàng thành công
      container.innerHTML = `
        <div class="checkout-stepper">
          <div class="step-item done"><span class="step-num">✓</span><span>Giỏ hàng</span></div>
          <div class="step-line active"></div>
          <div class="step-item done"><span class="step-num">✓</span><span>Đặt hàng & Thanh toán</span></div>
          <div class="step-line active"></div>
          <div class="step-item active"><span class="step-num">3</span><span>Hoàn tất đơn hàng</span></div>
        </div>

        <div class="card-box" style="max-width:720px;margin:0 auto 56px;text-align:center;padding:36px 28px;">
          <div style="font-size:3.8rem;margin-bottom:12px;animation:slideUp 0.3s ease;">✅</div>
          <h2 style="font-size:1.6rem;color:var(--olive-dark);margin-bottom:8px;">Đặt hàng thành công!</h2>
          <p style="color:var(--text-muted);font-size:0.95rem;max-width:540px;margin:0 auto 20px;">
            Cảm ơn quý khách <strong>${escapeHTML(hoTen)}</strong> đã tin chọn Nội Thất Mộc An. Đơn hàng của bạn đã được ghi nhận trên hệ thống và đang ở trạng thái <strong>Chờ duyệt</strong>.
          </p>

          <div style="background:var(--bg-page);border:1px dashed var(--border);border-radius:var(--radius-sm);padding:16px;max-width:520px;margin:0 auto 24px;text-align:left;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border);">
              <span style="font-size:0.9rem;color:var(--text-muted);">Mã đơn hàng:</span>
              <div>
                <strong style="font-size:1.1rem;color:var(--olive-dark);letter-spacing:0.5px;">${escapeHTML(maDon)}</strong>
                <button type="button" class="copy-pill" onclick="copyToClipboard('${escapeHTML(maDon)}', 'Đã chép mã đơn hàng!')">📋 Chép</button>
              </div>
            </div>
            <div style="font-size:0.88rem;line-height:1.7;">
              <div><strong>Người nhận:</strong> ${escapeHTML(hoTen)} – ${escapeHTML(sdt)}</div>
              <div><strong>Địa chỉ:</strong> ${escapeHTML(fullAddress)}</div>
              <div><strong>Phương thức:</strong> ${escapeHTML(ptTT)}</div>
              <div><strong>Trạng thái thanh toán:</strong> <span class="status-badge" style="background:#dcfce7;color:#15803d;">${escapeHTML(trangThaiTT)}</span></div>
              <div><strong>Tổng tiền thanh toán:</strong> <strong style="color:var(--terracotta);">${formatPrice(grandTotal)}</strong></div>
              <div><strong>Dự kiến giao hàng:</strong> 2 – 4 ngày làm việc (kèm thợ lắp ráp miễn phí)</div>
            </div>
          </div>

          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            ${user ? `
              <a href="orders.html?id=${encodeURIComponent(maDon)}" class="btn btn-primary btn-lg">
                Theo dõi đơn hàng của tôi →
              </a>
            ` : `
              <a href="orders.html?id=${encodeURIComponent(maDon)}" class="btn btn-primary btn-lg">
                Tra cứu đơn hàng này →
              </a>
            `}
            <button type="button" class="btn btn-outline btn-lg" onclick="openInvoicePrintModalById('${escapeHTML(maDon)}')">
              🖨 In hóa đơn / Lưu đơn
            </button>
            <a href="products.html" class="btn btn-outline btn-lg">
              Tiếp tục mua hàng
            </a>
          </div>
        </div>
      `;

      showToast(`Chúc mừng! Đặt hàng thành công mã ${maDon}`);
    }, 900);
  });
}
