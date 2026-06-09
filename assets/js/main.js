/**
 * main.js - Điểm khởi đầu của ứng dụng
 */

import { seedInitialData } from "./core/storage.js";
import { initRouter } from "./core/router.js";

/**
 * Khởi tạo ứng dụng khi DOM sẵn sàng.
 */
function bootstrap() {
  // 1. Tạo dữ liệu mẫu nếu localStorage còn trống
  seedInitialData();

  // 2. Khởi tạo router (router sẽ tự render sidebar + header + page)
  initRouter();

  // 3. Đóng sidebar mobile khi nhấn vào backdrop
  const backdrop = document.getElementById("sidebar-backdrop");
  const sidebar = document.getElementById("sidebar");
  backdrop?.addEventListener("click", () => sidebar?.classList.remove("open"));
}

document.addEventListener("DOMContentLoaded", bootstrap);
