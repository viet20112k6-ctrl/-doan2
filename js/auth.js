/* ==========================================================================
   MỘC AN FURNITURE - AUTH CONTROLLER (auth.html - ND04, ND05)
   ========================================================================== */

function initAuthPage() {
  renderHeader('auth');
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('return') || 'index.html';

  // Form đăng nhập
  const loginForm = document.getElementById('login-form');
  const loginErr = document.getElementById('login-error');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginErr.className = 'alert alert-error';
    loginErr.style.display = 'none';

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;

    if (!email || !pass) {
      loginErr.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      loginErr.style.display = 'block';
      return;
    }

    const user = DB.getUsers().find(u => u.Email.toLowerCase() === email && u.MatKhau === pass);
    if (!user) {
      loginErr.textContent = 'Email hoặc mật khẩu không chính xác. Vui lòng nhập lại.';
      loginErr.style.display = 'block';
      return;
    }
    if (user.TrangThai === 'Bị khóa') {
      loginErr.textContent = 'Tài khoản của bạn hiện đang bị khóa và không thể đăng nhập.';
      loginErr.style.display = 'block';
      return;
    }

    DB.setSession(user);
    showToast(`Chào mừng ${user.HoTen} quay trở lại!`);
    setTimeout(() => { window.location.href = returnUrl; }, 500);
  });

  // Form đăng ký
  const regForm = document.getElementById('register-form');
  const regMsg = document.getElementById('register-msg');

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    regMsg.style.display = 'none';

    const hoTen = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const sdt = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    const showRegErr = (msg) => {
      regMsg.className = 'alert alert-error';
      regMsg.textContent = msg;
      regMsg.style.display = 'block';
    };

    if (!hoTen || !email || !sdt || !pass || !confirm) {
      return showRegErr('Vui lòng điền đầy đủ tất cả các trường thông tin.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showRegErr('Định dạng email không hợp lệ.');
    }
    if (!/^[0-9]{9,11}$/.test(sdt)) {
      return showRegErr('Số điện thoại phải gồm 9–11 chữ số.');
    }
    if (pass.length < 6) {
      return showRegErr('Mật khẩu phải có ít nhất 6 ký tự.');
    }
    if (pass !== confirm) {
      return showRegErr('Mật khẩu xác nhận không khớp.');
    }

    const users = DB.getUsers();
    if (users.some(u => u.Email.toLowerCase() === email)) {
      return showRegErr('Email này đã được sử dụng. Vui lòng chọn email khác.');
    }

    const nextNum = users.length + 1;
    const newUser = {
      MaTK: 'TK' + String(nextNum).padStart(3, '0') + Math.floor(Math.random() * 90 + 10),
      HoTen: hoTen,
      Email: email,
      SoDienThoai: sdt,
      MatKhau: pass,
      VaiTro: 'customer',
      TrangThai: 'Hoạt động'
    };
    users.push(newUser);
    DB.saveUsers(users);

    regMsg.className = 'alert alert-success';
    regMsg.textContent = 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.';
    regMsg.style.display = 'block';
    regForm.reset();
    document.getElementById('login-email').value = email;
    showToast('Đăng ký tài khoản thành công!');
  });
}
