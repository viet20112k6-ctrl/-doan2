"use strict";
// Tài khoản cục bộ cho đồ án tĩnh. Không dùng mô-đun này thay cho xác thực trên máy chủ.
window.EnciviAuth = (() => {
  const ACCOUNTS_KEY = "encivi_accounts_v1";
  const SESSION_KEY = "encivi_session_v1";
  const ITERATIONS = 600000;
  const ADMIN = Object.freeze({
    id: "encivi-admin",
    username: "admin",
    fullName: "Quản trị EnCiVi",
    email: "",
    role: "admin",
    salt: "46732bdc5a093a6ac7d67cc7b6dba2ae",
    hash: "6ed507b0c45114e3bbb9bc3949e808c146d127fd121fa560088e87db1049645a",
    iterations: ITERATIONS,
    createdAt: "2026-10-04T00:00:00.000Z",
  });
  const identity = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  const failure = (message, field) =>
    Object.assign(new Error(message), { field });
  const profile = (user) => ({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });

  function accounts() {
    let raw;
    try {
      raw = localStorage.getItem(ACCOUNTS_KEY);
    } catch {
      throw failure(
        "Không đọc được tài khoản. Hãy cho phép trình duyệt lưu dữ liệu.",
      );
    }
    if (raw === null) return [{ ...ADMIN }];
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw failure(
        "Dữ liệu tài khoản bị lỗi. Hãy khôi phục dữ liệu trước khi đăng nhập.",
      );
    }
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.accounts))
      throw failure("Dữ liệu tài khoản không đúng định dạng.");
    const valid = parsed.accounts
      .filter(
        (user) =>
          user &&
          typeof user.id === "string" &&
          /^[a-z0-9._]{4,30}$/.test(user.username) &&
          typeof user.fullName === "string" &&
          typeof user.email === "string" &&
          /^[a-f0-9]{32}$/.test(user.salt) &&
          /^[a-f0-9]{64}$/.test(user.hash) &&
          user.iterations === ITERATIONS &&
          ((user.role === "customer" &&
            user.id !== ADMIN.id &&
            user.username !== ADMIN.username) ||
            (user.role === "admin" &&
              user.id === ADMIN.id &&
              user.username === ADMIN.username)),
      )
      .filter(
        (user, index, list) =>
          list.findIndex(
            (other) =>
              other.id === user.id ||
              other.username === user.username ||
              (user.email && other.email === user.email),
          ) === index,
      );
    if (!valid.some((user) => user.id === ADMIN.id))
      valid.unshift({ ...ADMIN });
    return valid;
  }
  function saveAccounts(users) {
    try {
      localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify({ version: 1, accounts: users }),
      );
    } catch {
      throw failure(
        "Không lưu được tài khoản. Hãy cho phép lưu trữ hoặc giải phóng dung lượng.",
      );
    }
  }
  function initialize() {
    const users = accounts();
    if (localStorage.getItem(ACCOUNTS_KEY) === null) saveAccounts(users);
    // Các vai trò cũ không phải phiên đăng nhập và không còn được chấp nhận.
    sessionStorage.removeItem("encivi_role");
    sessionStorage.removeItem("moho_role");
    return current();
  }
  async function passwordHash(password, salt) {
    if (!globalThis.crypto?.subtle)
      throw failure(
        "Hãy mở website bằng HTTPS hoặc Live Server trên localhost để đăng nhập.",
      );
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        iterations: ITERATIONS,
        salt: Uint8Array.from(salt.match(/../g), (value) =>
          parseInt(value, 16),
        ),
      },
      key,
      256,
    );
    return [...new Uint8Array(bits)]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }
  function startSession(user) {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: user.id,
          credential: user.hash,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        }),
      );
    } catch {
      throw failure(
        "Không tạo được phiên đăng nhập. Hãy cho phép trình duyệt lưu phiên.",
      );
    }
    return profile(user);
  }
  function current() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (
        !session ||
        !Number.isFinite(session.expiresAt) ||
        session.expiresAt <= Date.now()
      )
        return null;
      const user = accounts().find(
        (user) =>
          user.id === session.userId && user.hash === session.credential,
      );
      return user ? profile(user) : null;
    } catch {
      return null;
    }
  }
  async function register(input) {
    const username = identity(input.username),
      email = identity(input.email),
      fullName = String(input.fullName || "").trim();
    const password = String(input.password || "");
    if (fullName.length < 2 || fullName.length > 100)
      throw failure("Nhập họ tên từ 2 đến 100 ký tự.", "fullName");
    if (!/^[a-z0-9._]{4,30}$/.test(username))
      throw failure(
        "Tên tài khoản gồm 4–30 chữ không dấu, số, dấu chấm hoặc gạch dưới.",
        "username",
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)
      throw failure("Nhập địa chỉ email hợp lệ.", "email");
    if (password.length < 8 || password.length > 128)
      throw failure("Mật khẩu cần từ 8 đến 128 ký tự.", "password");
    if (password !== String(input.confirmPassword || ""))
      throw failure("Mật khẩu nhập lại chưa khớp.", "confirmPassword");
    const unique = (users) => {
      if (users.some((user) => user.username === username))
        throw failure("Tên tài khoản đã được sử dụng.", "username");
      if (users.some((user) => user.email === email))
        throw failure("Email đã được đăng ký.", "email");
    };
    unique(accounts());
    if (!globalThis.crypto?.subtle)
      throw failure(
        "Hãy mở website bằng HTTPS hoặc Live Server trên localhost để đăng ký.",
      );
    const salt = [...crypto.getRandomValues(new Uint8Array(16))]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    const user = {
      id: "customer-" + crypto.randomUUID(),
      username,
      email,
      fullName,
      role: "customer",
      salt,
      hash: await passwordHash(password, salt),
      iterations: ITERATIONS,
      createdAt: new Date().toISOString(),
    };
    const users = accounts();
    unique(users);
    saveAccounts([...users, user]);
    return startSession(user);
  }
  async function login(input) {
    const value = identity(input.identity);
    const user = accounts().find(
      (user) => user.username === value || (user.email && user.email === value),
    );
    if (
      !user ||
      (await passwordHash(String(input.password || ""), user.salt)) !==
        user.hash
    )
      throw failure(
        "Tên tài khoản, email hoặc mật khẩu chưa đúng.",
        "identity",
      );
    return startSession(user);
  }
  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      throw failure("Không kết thúc được phiên đăng nhập. Hãy thử lại.");
    }
  }
  return Object.freeze({
    initialize,
    current,
    register,
    login,
    logout,
    ACCOUNTS_KEY,
    SESSION_KEY,
  });
})();
