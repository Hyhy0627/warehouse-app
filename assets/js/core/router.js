/**
 * core/router.js - Router theo hash (#/route)
 */

import { APP_CONFIG } from "../config.js";
import { renderSidebar } from "../components/sidebar.js";
import { renderHeader } from "../components/header.js";

import { renderDashboardPage } from "../pages/dashboard.page.js";
import { renderProductsPage } from "../pages/products.page.js";
import { renderCategoriesPage } from "../pages/categories.page.js";
import { renderTransactionsPage } from "../pages/transactions.page.js";

// Bảng định tuyến: hash -> cấu hình route
const routes = {
  "/dashboard": {
    title: "Tổng quan",
    subtitle: "Tình hình kho hàng hôm nay",
    render: renderDashboardPage,
  },
  "/products": {
    title: "Hàng hoá",
    subtitle: "Quản lý danh sách sản phẩm",
    render: renderProductsPage,
  },
  "/categories": {
    title: "Danh mục",
    subtitle: "Quản lý nhóm sản phẩm",
    render: renderCategoriesPage,
  },
  "/transactions": {
    title: "Nhập / Xuất kho",
    subtitle: "Quản lý giao dịch và lịch sử",
    render: renderTransactionsPage,
  },
};

/**
 * Lấy path hiện tại từ hash (bỏ ký tự #).
 */
function getCurrentPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/dashboard";
}

/**
 * Xử lý khi route thay đổi: render header, sidebar và page tương ứng.
 */
function handleRouteChange() {
  // Đóng modal đang mở (nếu có) khi chuyển trang
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) {
    modalRoot.classList.remove("open");
    modalRoot.innerHTML = "";
    document.body.style.overflow = "";
  }

  const path = getCurrentPath();
  const route = routes[path];

  // Nếu route không tồn tại -> chuyển về mặc định
  if (!route) {
    window.location.hash = APP_CONFIG.defaultRoute;
    return;
  }

  renderSidebar(path);
  renderHeader(route);

  const content = document.getElementById("app-content");
  content.innerHTML = "";
  content.scrollTop = 0;
  window.scrollTo(0, 0);

  // Gọi hàm render của page (truyền vào container)
  route.render(content);
}

/**
 * Khởi tạo router: lắng nghe sự kiện hashchange và render lần đầu.
 */
export function initRouter() {
  window.addEventListener("hashchange", handleRouteChange);

  if (!window.location.hash) {
    window.location.hash = APP_CONFIG.defaultRoute;
  } else {
    handleRouteChange();
  }
}

/**
 * Điều hướng tới route (dùng cho code).
 */
export function navigateTo(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}
