/* ==========================================================================
   MỘC AN FURNITURE - HOME PAGE CONTROLLER (index.html)
   ========================================================================== */

function initHomePage() {
  renderHeader('home');
  renderFooter();

  const catGrid = document.getElementById('home-category-grid');
  const prodGrid = document.getElementById('home-product-grid');
  const catSelect = document.getElementById('home-cat-filter');
  const pills = document.querySelectorAll('.filter-pill[data-group]');

  const categories = DB.getCategories().filter(c => c.TrangThai !== 'Ẩn');
  const products = DB.getProducts();

  if (catGrid) {
    catGrid.innerHTML = categories.map(c => {
      const count = products.filter(p => p.MaDM === c.MaDM).length;
      return `
        <a href="products.html?cat=${encodeURIComponent(c.MaDM)}" class="category-card">
          <h3>${escapeHTML(c.TenDM)}</h3>
          <p>${escapeHTML(c.MoTa)}</p>
          <span class="category-count">${count} sản phẩm →</span>
        </a>
      `;
    }).join('');
  }

  if (catSelect) {
    catSelect.innerHTML = `<option value="">Tất cả không gian</option>` +
      categories.map(c => `<option value="${escapeHTML(c.MaDM)}">${escapeHTML(c.TenDM)}</option>`).join('');
  }

  let currentGroup = 'all';
  let currentCat = '';

  function renderHomeProducts() {
    let list = DB.getProducts().slice();
    if (currentCat) list = list.filter(p => p.MaDM === currentCat);
    if (currentGroup === 'new') list = list.filter(p => p.MoiVe);
    if (currentGroup === 'best') list = list.filter(p => p.BanChay);
    if (currentGroup === 'sale') list = list.filter(p => p.GiaCu && p.GiaCu > p.Gia);

    if (list.length === 0) {
      prodGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Chưa có sản phẩm phù hợp</h3><p>Vui lòng thử chọn nhóm lọc hoặc không gian khác.</p></div>`;
      return;
    }
    prodGrid.innerHTML = list.slice(0, 8).map(buildProductCardHTML).join('');
  }

  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      pills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGroup = btn.dataset.group;
      renderHomeProducts();
    });
  });

  if (catSelect) {
    catSelect.addEventListener('change', () => {
      currentCat = catSelect.value;
      renderHomeProducts();
    });
  }

  renderHomeProducts();
}
