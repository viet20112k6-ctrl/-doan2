/* ==========================================================================
   MỘC AN FURNITURE - PRODUCT DETAIL CONTROLLER (product-detail.html - ND03)
   ========================================================================== */

function initProductDetailPage() {
  renderHeader('products');
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('product-detail-container');
  const relatedGrid = document.getElementById('related-products-grid');

  const sp = DB.getProducts().find(p => p.MaSP === id);
  if (!sp) {
    container.innerHTML = `<div class="empty-state"><h3>Không tìm thấy sản phẩm</h3><p>Sản phẩm bạn tìm không tồn tại hoặc đã bị xóa.</p><a href="products.html" class="btn btn-primary" style="margin-top:14px">Quay lại danh mục</a></div>`;
    return;
  }

  document.title = `${sp.TenSP} – Nội thất Mộc An`;
  const isOut = sp.SoLuongTon <= 0;
  const hasSale = sp.GiaCu && sp.GiaCu > sp.Gia;
  const images = (sp.HinhAnhPhu && sp.HinhAnhPhu.length > 0) ? sp.HinhAnhPhu : [sp.HinhAnh];

  container.innerHTML = `
    <div style="margin-bottom:16px;font-size:0.9rem;color:var(--text-muted);">
      <a href="index.html">Trang chủ</a> / <a href="products.html?cat=${encodeURIComponent(sp.MaDM)}">${escapeHTML(getCategoryName(sp.MaDM))}</a> / <strong>${escapeHTML(sp.TenSP)}</strong>
    </div>
    <div class="detail-grid">
      <div>
        <div class="gallery-main">
          <img id="detail-main-img" src="${escapeHTML(safeImg(images[0]))}" alt="${escapeHTML(sp.TenSP)}" onerror="this.src='${FALLBACK_IMG}'">
        </div>
        <div class="gallery-thumbs">
          ${images.map((img, idx) => `
            <img src="${escapeHTML(safeImg(img))}" class="${idx === 0 ? 'active' : ''}" data-src="${escapeHTML(safeImg(img))}" alt="Ảnh ${idx + 1}" onerror="this.src='${FALLBACK_IMG}'">
          `).join('')}
        </div>
      </div>

      <div>
        <div class="product-cat" style="margin-bottom:6px;">${escapeHTML(getCategoryName(sp.MaDM))} · Mã: ${escapeHTML(sp.MaSP)}</div>
        <h1 style="font-size:1.85rem;margin-bottom:12px;">${escapeHTML(sp.TenSP)}</h1>
        <div class="product-price-row" style="margin-bottom:16px;">
          <span class="price-current" style="font-size:1.55rem;">${formatPrice(sp.Gia)}</span>
          ${hasSale ? `<span class="price-old" style="font-size:1.05rem;">${formatPrice(sp.GiaCu)}</span>` : ''}
        </div>

        <table class="spec-table">
          <tr><th>Chất liệu</th><td>${escapeHTML(sp.ChatLieu || 'Đang cập nhật')}</td></tr>
          <tr><th>Kích thước</th><td>${escapeHTML(sp.KichThuoc || 'Đang cập nhật')}</td></tr>
          <tr><th>Màu sắc</th><td>${escapeHTML(sp.MauSac || 'Đang cập nhật')}</td></tr>
          <tr><th>Tình trạng</th><td>
            ${isOut
              ? '<span class="status-badge st-cancel">Hết hàng</span>'
              : `<span class="status-badge st-done">Còn hàng (${sp.SoLuongTon} sản phẩm)</span>`}
          </td></tr>
        </table>

        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:22px 0;">
          <div class="qty-control">
            <button type="button" id="qty-minus" ${isOut ? 'disabled' : ''}>−</button>
            <input type="number" id="detail-qty" value="1" min="1" max="${Math.max(1, sp.SoLuongTon)}" ${isOut ? 'disabled' : ''}>
            <button type="button" id="qty-plus" ${isOut ? 'disabled' : ''}>+</button>
          </div>
          <button class="btn btn-outline btn-lg" id="btn-add-detail" style="flex:1;" ${isOut ? 'disabled' : ''}>
            ${isOut ? 'Hết hàng' : '🛒 Thêm vào giỏ'}
          </button>
          <button class="btn btn-accent btn-lg" id="btn-buy-now" style="flex:1;" ${isOut ? 'disabled' : ''}>
            ⚡ Mua ngay
          </button>
        </div>

        <div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--border);">
          <h3 style="font-size:1.1rem;margin-bottom:8px;">Mô tả chi tiết</h3>
          <p style="color:var(--text-muted);font-size:0.95rem;">${escapeHTML(sp.MoTa || 'Chưa có mô tả chi tiết.')}</p>
        </div>
      </div>
    </div>
  `;

  // Thumbnails
  document.querySelectorAll('.gallery-thumbs img').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.getElementById('detail-main-img').src = thumb.dataset.src;
      document.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  if (!isOut) {
    const qtyInput = document.getElementById('detail-qty');
    document.getElementById('qty-minus').addEventListener('click', () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
      const next = Number(qtyInput.value) + 1;
      if (next > sp.SoLuongTon) {
        showToast(`Chỉ còn ${sp.SoLuongTon} sản phẩm trong kho.`, 'error');
        qtyInput.value = sp.SoLuongTon;
      } else {
        qtyInput.value = next;
      }
    });
    document.getElementById('btn-add-detail').addEventListener('click', () => {
      const val = Math.max(1, Math.min(sp.SoLuongTon, parseInt(qtyInput.value, 10) || 1));
      quickAddToCart(sp.MaSP, val);
    });
    const buyNowBtn = document.getElementById('btn-buy-now');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        const val = Math.max(1, Math.min(sp.SoLuongTon, parseInt(qtyInput.value, 10) || 1));
        quickAddToCart(sp.MaSP, val);
        setTimeout(() => { window.location.href = 'checkout.html'; }, 300);
      });
    }
  }

  // Sản phẩm liên quan
  const related = DB.getProducts().filter(p => p.MaDM === sp.MaDM && p.MaSP !== sp.MaSP).slice(0, 4);
  if (relatedGrid) {
    relatedGrid.innerHTML = related.length
      ? related.map(buildProductCardHTML).join('')
      : '<p style="color:var(--text-muted)">Chưa có sản phẩm liên quan.</p>';
  }
}
