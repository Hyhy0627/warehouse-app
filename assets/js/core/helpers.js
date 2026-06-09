/**
 * core/helpers.js - Các hàm tiện ích dùng chung
 */

import { LOW_STOCK_LIMIT } from "../config.js";

/**
 * Sinh ID duy nhất (dạng timestamp + chuỗi ngẫu nhiên).
 */
export function generateId(prefix = "id") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

/**
 * Định dạng tiền tệ theo VNĐ.
 */
export function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

/**
 * Định dạng số (có dấu phân cách hàng nghìn).
 */
export function formatNumber(value) {
  return (Number(value) || 0).toLocaleString("vi-VN");
}

/**
 * Định dạng ngày giờ theo kiểu Việt Nam.
 */
export function formatDate(dateString, withTime = false) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return date.toLocaleString("vi-VN", options);
}

/**
 * Xác định trạng thái sản phẩm dựa trên số lượng.
 * Trả về object { key, label, badgeClass }.
 */
export function getProductStatus(quantity) {
  const qty = Number(quantity) || 0;
  if (qty === 0) {
    return { key: "out", label: "Hết hàng", badgeClass: "badge-danger" };
  }
  if (qty < LOW_STOCK_LIMIT) {
    return { key: "low", label: "Sắp hết", badgeClass: "badge-warning" };
  }
  return { key: "in", label: "Còn hàng", badgeClass: "badge-success" };
}

/**
 * Tính tổng số lượng tồn của tất cả sản phẩm.
 */
export function calculateTotalQuantity(products = []) {
  return products.reduce((total, p) => total + (Number(p.quantity) || 0), 0);
}

/**
 * Tính tổng giá trị hàng tồn kho (số lượng * giá nhập).
 */
export function calculateInventoryValue(products = []) {
  return products.reduce(
    (total, p) =>
      total + (Number(p.quantity) || 0) * (Number(p.importPrice) || 0),
    0
  );
}

/**
 * Escape HTML để tránh lỗi hiển thị / XSS khi render chuỗi người dùng nhập.
 */
export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
