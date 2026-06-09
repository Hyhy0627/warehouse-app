/**
 * pages/dashboard.page.js - Trang tổng quan
 */

import { icon } from "../components/icons.js";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getProductStatus,
  calculateTotalQuantity,
  calculateInventoryValue,
  escapeHtml,
} from "../core/helpers.js";
import { getProducts, getLowStockProducts } from "../services/product.service.js";
import { getCategories, getCategoryById } from "../services/category.service.js";
import {
  getRecentTransactions,
} from "../services/transaction.service.js";
import { getProductById } from "../services/product.service.js";

/**
 * Render một thẻ thống kê.
 */
function statCard({ iconName, color, value, label }) {
  return `
    <div class="stat-card">
      <div class="stat-card__icon stat-card__icon--${color}">${icon(iconName)}</div>
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__label">${label}</div>
    </div>
  `;
}

/**
 * Render danh sách giao dịch gần đây.
 */
function recentTransactionsHtml() {
  const transactions = getRecentTransactions(6);
  if (!transactions.length) {
    return '<div class="empty-state">Chưa có giao dịch nào.</div>';
  }

  return transactions
    .map((tx) => {
      const product = getProductById(tx.productId);
      const isImport = tx.type === "import";
      const name = product ? escapeHtml(product.name) : "Sản phẩm đã xoá";
      return `
        <div class="tx-item">
          <div class="tx-item__icon tx-item__icon--${isImport ? "in" : "out"}">
            ${icon(isImport ? "arrowDown" : "arrowUp")}
          </div>
          <div class="tx-item__info">
            <div class="tx-item__name">${name}</div>
            <div class="tx-item__meta">
              ${isImport ? "Nhập kho" : "Xuất kho"} • ${formatDate(tx.createdAt, true)}
            </div>
          </div>
          <div class="tx-item__qty tx-item__qty--${isImport ? "in" : "out"}">
            ${isImport ? "+" : "-"}${formatNumber(tx.quantity)}
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Render danh sách hàng sắp hết.
 */
function lowStockHtml() {
  const lowStock = getLowStockProducts();
  if (!lowStock.length) {
    return '<div class="empty-state">Tất cả sản phẩm đều còn đủ hàng. 👍</div>';
  }

  return lowStock
    .map((p) => {
      const status = getProductStatus(p.quantity);
      const category = getCategoryById(p.categoryId);
      return `
        <div class="tx-item">
          <div class="tx-item__icon tx-item__icon--out">${icon("warning")}</div>
          <div class="tx-item__info">
            <div class="tx-item__name">${escapeHtml(p.name)}</div>
            <div class="tx-item__meta">
              ${escapeHtml(p.code)} • ${category ? escapeHtml(category.name) : "—"}
            </div>
          </div>
          <span class="badge ${status.badgeClass}">${status.label}: ${p.quantity}</span>
        </div>
      `;
    })
    .join("");
}

/**
 * Render toàn bộ trang dashboard.
 */
export function renderDashboardPage(container) {
  const products = getProducts();
  const categories = getCategories();

  const totalProducts = products.length;
  const totalQuantity = calculateTotalQuantity(products);
  const lowStockCount = getLowStockProducts().length;
  const totalCategories = categories.length;
  const inventoryValue = calculateInventoryValue(products);

  container.innerHTML = `
    <div class="stats-grid">
      ${statCard({
        iconName: "box",
        color: "blue",
        value: formatNumber(totalProducts),
        label: "Tổng sản phẩm",
      })}
      ${statCard({
        iconName: "layers",
        color: "green",
        value: formatNumber(totalQuantity),
        label: "Tổng tồn kho",
      })}
      ${statCard({
        iconName: "warning",
        color: "orange",
        value: formatNumber(lowStockCount),
        label: "Sắp / hết hàng",
      })}
      ${statCard({
        iconName: "tag",
        color: "blue",
        value: formatNumber(totalCategories),
        label: "Danh mục",
      })}
      ${statCard({
        iconName: "wallet",
        color: "green",
        value: formatCurrency(inventoryValue),
        label: "Giá trị tồn kho",
      })}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Giao dịch gần đây</h3>
          <a href="#/transactions" class="btn btn-ghost btn-sm">Xem tất cả</a>
        </div>
        <div class="card__body">${recentTransactionsHtml()}</div>
      </div>

      <div class="card">
        <div class="card__header">
          <h3 class="card__title">Hàng sắp hết</h3>
          <a href="#/products" class="btn btn-ghost btn-sm">Quản lý</a>
        </div>
        <div class="card__body">${lowStockHtml()}</div>
      </div>
    </div>
  `;
}
