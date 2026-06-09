/**
 * pages/transactions.page.js - Trang nhập / xuất kho
 */

import { icon } from "../components/icons.js";
import { createTable } from "../components/table.js";
import { showToast } from "../components/toast.js";
import { formatDate, formatNumber, escapeHtml } from "../core/helpers.js";
import { validateTransaction } from "../core/validators.js";
import { getProducts, getProductById } from "../services/product.service.js";
import {
  filterTransactions,
  createImportTransaction,
  createExportTransaction,
} from "../services/transaction.service.js";

let pageContainer = null;
let historyFilter = ""; // "" | "import" | "export"

/**
 * Tạo các <option> cho danh sách sản phẩm.
 */
function productOptions(showStock = false) {
  return getProducts()
    .map((p) => {
      const isOutOfStock = Number(p.quantity) <= 0;

      return `
        <option value="${p.id}" ${isOutOfStock ? "disabled" : ""}>
          ${escapeHtml(p.code)} - ${escapeHtml(p.name)}${
            showStock ? ` (tồn: ${p.quantity})` : ""
          }
        </option>
      `;
    })
    .join("");
}

/**
 * Render trang giao dịch.
 */
export function renderTransactionsPage(container) {
  pageContainer = container;
  historyFilter = "";

  const hasProducts = getProducts().length > 0;

  container.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-head__title">Nhập / Xuất kho</div>
        <div class="page-head__desc">Ghi nhận nhập hàng, xuất hàng và xem lịch sử giao dịch.</div>
      </div>
    </div>

    ${
      hasProducts
        ? `
    <div class="tx-forms">
      <!-- Form nhập kho -->
      <div class="card tx-form-card tx-form-card--in">
        <div class="card__header">
          <h3 class="card__title">${icon("arrowDown")}Nhập kho</h3>
        </div>
        <div class="card__body">
          <form id="import-form" novalidate>
            <div class="form-group" style="margin-bottom:1rem">
              <label for="i-product">Sản phẩm</label>
              <select id="i-product" name="productId">
                <option value="">-- Chọn sản phẩm --</option>
                ${productOptions()}
              </select>
              <div class="form-error" data-error="productId"></div>
            </div>
            <div class="form-group" style="margin-bottom:1rem">
              <label for="i-qty">Số lượng nhập</label>
              <input id="i-qty" name="quantity" type="number" min="1" placeholder="0" />
              <div class="form-error" data-error="quantity"></div>
            </div>
            <div class="form-group" style="margin-bottom:1rem">
              <label for="i-note">Ghi chú</label>
              <input id="i-note" name="note" placeholder="VD: Nhập từ nhà cung cấp A" />
            </div>
            <button type="submit" class="btn btn-primary btn-block">
              ${icon("arrowDown")} Xác nhận nhập kho
            </button>
          </form>
        </div>
      </div>

      <!-- Form xuất kho -->
      <div class="card tx-form-card tx-form-card--out">
        <div class="card__header">
          <h3 class="card__title">${icon("arrowUp")}Xuất kho</h3>
        </div>
        <div class="card__body">
          <form id="export-form" novalidate>
            <div class="form-group" style="margin-bottom:1rem">
              <label for="e-product">Sản phẩm</label>
              <select id="e-product" name="productId">
                <option value="">-- Chọn sản phẩm --</option>
                ${productOptions(true)}
              </select>
              <div class="form-error" data-error="productId"></div>
            </div>
            <div class="form-group" style="margin-bottom:1rem">
              <label for="e-qty">Số lượng xuất</label>
              <input id="e-qty" name="quantity" type="number" min="1" placeholder="0" />
              <div class="form-error" data-error="quantity"></div>
            </div>
            <div class="form-group" style="margin-bottom:1rem">
              <label for="e-note">Ghi chú</label>
              <input id="e-note" name="note" placeholder="VD: Xuất bán cho khách B" />
            </div>
            <button type="submit" class="btn btn-danger btn-block">
              ${icon("arrowUp")} Xác nhận xuất kho
            </button>
          </form>
        </div>
      </div>
    </div>
    `
        : `<div class="card"><div class="empty-state">Chưa có sản phẩm nào. Hãy thêm sản phẩm trước khi nhập/xuất kho.</div></div>`
    }

    <!-- Lịch sử giao dịch -->
    <div class="card">
      <div class="card__header">
        <h3 class="card__title">Lịch sử giao dịch</h3>
        <select id="history-filter" style="width:auto; min-width:160px">
          <option value="">Tất cả giao dịch</option>
          <option value="import">Chỉ nhập kho</option>
          <option value="export">Chỉ xuất kho</option>
        </select>
      </div>
      <div id="transactions-table"></div>
    </div>
  `;

  // Gắn sự kiện form
  if (hasProducts) {
    container
      .querySelector("#import-form")
      .addEventListener("submit", (e) => handleSubmit(e, "import"));
    container
      .querySelector("#export-form")
      .addEventListener("submit", (e) => handleSubmit(e, "export"));

    container
      .querySelector("#btnOpenAddProductModal")
      .addEventListener("click", () => openProductForm());
  }

  container.querySelector("#history-filter").addEventListener("change", (e) => {
    historyFilter = e.target.value;
    renderTable();
  });

  renderTable();
}

/**
 * Xử lý submit form nhập / xuất.
 */
function handleSubmit(e, type) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  // Reset lỗi
  form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  form.querySelectorAll("input, select").forEach((el) =>
    el.classList.remove("input-invalid")
  );

  const isExport = type === "export";
  const product = getProductById(data.productId);
  const availableQty = product ? product.quantity : 0;

  const errors = validateTransaction(data, { isExport, availableQty });
  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([field, msg]) => {
      const errEl = form.querySelector(`[data-error="${field}"]`);
      const input = form.querySelector(`[name="${field}"]`);
      if (errEl) errEl.textContent = msg;
      if (input) input.classList.add("input-invalid");
    });
    return;
  }

  const result = isExport
    ? createExportTransaction(data)
    : createImportTransaction(data);

  if (result.success) {
    showToast(
      isExport ? "Đã xuất kho thành công." : "Đã nhập kho thành công.",
      "success"
    );
    form.reset();
    // Render lại toàn trang để cập nhật tồn kho trong dropdown
    renderTransactionsPage(pageContainer);
  } else {
    showToast(result.message, "error");
  }
}

/**
 * Render bảng lịch sử giao dịch theo bộ lọc.
 */
function renderTable() {
  const wrap = pageContainer.querySelector("#transactions-table");
  const transactions = filterTransactions(historyFilter);

  const columns = [
    {
      key: "type",
      label: "Loại",
      render: (t) =>
        t.type === "import"
          ? '<span class="badge badge-success">Nhập kho</span>'
          : '<span class="badge badge-danger">Xuất kho</span>',
    },
    {
      key: "product",
      label: "Sản phẩm",
      render: (t) => {
        const p = getProductById(t.productId);
        return p
          ? `<span class="cell-strong">${escapeHtml(p.name)}</span>`
          : '<span class="muted">Sản phẩm đã xoá</span>';
      },
    },
    {
      key: "quantity",
      label: "Số lượng",
      align: "right",
      render: (t) =>
        `<span class="cell-mono" style="color:${
          t.type === "import" ? "var(--color-success)" : "var(--color-danger)"
        }; font-weight:700">${t.type === "import" ? "+" : "-"}${formatNumber(
          t.quantity
        )}</span>`,
    },
    {
      key: "note",
      label: "Ghi chú",
      render: (t) =>
        t.note ? escapeHtml(t.note) : '<span class="muted">—</span>',
    },
    {
      key: "createdAt",
      label: "Thời gian",
      render: (t) => `<span class="muted">${formatDate(t.createdAt, true)}</span>`,
    },
  ];

  wrap.innerHTML = createTable({
    columns,
    data: transactions,
    emptyMessage: "Chưa có giao dịch nào.",
  });
}
