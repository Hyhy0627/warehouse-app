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
import { getProducts, getLowStockProducts, getProductById } from "../services/product.service.js";
import { getRecentTransactions, getTransactions } from "../services/transaction.service.js";
import { getCategoryById } from "../services/category.service.js";

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
// function recentTransactionsHtml() {
//   const transactions = getRecentTransactions(6);
//   if (!transactions.length) {
//     return '<div class="empty-state">Chưa có giao dịch nào.</div>';
//   }
function recentTransactionsHtml() {
  const transactions = getTransactions()
    .filter((tx) => getProductById(tx.productId))
    .slice(-6)
    .reverse();

  if (!transactions.length) {
    return `
      <div class="empty-state">
        Không có lịch sử giao dịch gần đây.
      </div>
    `;
  }

  return transactions
    .map((tx) => {
      const product = getProductById(tx.productId);
      const isImport = tx.type === "import";
//      const name = product ? escapeHtml(product.name) : "Sản phẩm đã xoá";
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
// function lowStockHtml() {
//   const lowStock = getLowStockProducts();
//   if (!lowStock.length) {
//     return '<div class="empty-state">Tất cả sản phẩm đều còn đủ hàng. 👍</div>';
//   }

//   return lowStock
//     .map((p) => {
//       const status = getProductStatus(p.quantity);
//       const category = getCategoryById(p.categoryId);
//       return `
//         <div class="tx-item">
//           <div class="tx-item__icon tx-item__icon--out">${icon("warning")}</div>
//           <div class="tx-item__info">
//             <div class="tx-item__name">${escapeHtml(p.name)}</div>
//             <div class="tx-item__meta">
//               ${escapeHtml(p.code)} • ${category ? escapeHtml(category.name) : "—"}
//             </div>
//           </div>
//           <span class="badge ${status.badgeClass}">${status.label}: ${p.quantity}</span>
//         </div>
//       `;
//     })
//     .join("");
// }

function lowStockHtml() {
  const products = getProducts();

  if (!products.length) {
    return `
      <div class="empty-state">
        Chưa có sản phẩm nào.
      </div>
    `;
  }

  const lowStockProducts = products.filter((product) => {
    return Number(product.quantity) <= Number(product.minQuantity);
  });

  if (!lowStockProducts.length) {
    return `
      <div class="empty-state">
        Tất cả sản phẩm đều còn đủ hàng. 👍
      </div>
    `;
  }

  return lowStockProducts
    .map((product) => {
      return `
        <div class="low-stock-item">
          <div>
            <div class="low-stock-item__name">
              ${escapeHtml(product.name)}
            </div>
            <div class="low-stock-item__meta">
              Tồn kho: ${formatNumber(product.quantity)} / Tối thiểu: ${formatNumber(product.minQuantity)}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Tính tổng thu nhập và lợi nhuận từ các giao dịch xuất kho.
 */
function salesSummary() {
  const products = getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));
  const exportTransactions = getTransactions().filter((tx) => tx.type === "export");

  return exportTransactions.reduce(
    (summary, tx) => {
      const product = productMap.get(tx.productId);
      if (!product) return summary;

      const quantity = Number(tx.quantity) || 0;
      const sellPrice = Number(product.sellPrice) || 0;
      const importPrice = Number(product.importPrice) || 0;

      summary.revenue += quantity * sellPrice;
      summary.profit += quantity * (sellPrice - importPrice);
      return summary;
    },
    { revenue: 0, profit: 0 }
  );
}

/**
 * Render toàn bộ trang dashboard.
 */
export function renderDashboardPage(container) {
  const products = getProducts();

  const totalProducts = products.length;
  const totalQuantity = calculateTotalQuantity(products);
  const inventoryValue = calculateInventoryValue(products);
  const sales = salesSummary();

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
        iconName: "wallet",
        color: "green",
        value: formatCurrency(sales.revenue),
        label: "Thu nhập",
      })}
      ${statCard({
        iconName: "check",
        color: "blue",
        value: formatCurrency(sales.profit),
        label: "Lợi nhuận",
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
