/**
 * core/validators.js - Kiểm tra dữ liệu các form
 * Mỗi hàm trả về object lỗi { field: message }. Rỗng = hợp lệ.
 */

/**
 * Validate form sản phẩm.
 */
export function validateProduct(data) {
  const errors = {};

  if (!data.code || !data.code.trim()) {
    errors.code = "Vui lòng nhập mã sản phẩm.";
  }
  if (!data.name || !data.name.trim()) {
    errors.name = "Vui lòng nhập tên sản phẩm.";
  }
  if (!data.categoryId) {
    errors.categoryId = "Vui lòng chọn danh mục.";
  }
  if (data.quantity === "" || data.quantity === null || data.quantity === undefined) {
    errors.quantity = "Vui lòng nhập số lượng.";
  } else if (Number(data.quantity) < 0 || Number.isNaN(Number(data.quantity))) {
    errors.quantity = "Số lượng phải là số không âm.";
  }
  if (data.importPrice === "" || Number(data.importPrice) < 0 || Number.isNaN(Number(data.importPrice))) {
    errors.importPrice = "Giá nhập không hợp lệ.";
  }
  if (data.sellPrice === "" || Number(data.sellPrice) < 0 || Number.isNaN(Number(data.sellPrice))) {
    errors.sellPrice = "Giá bán không hợp lệ.";
  }

  return errors;
}

/**
 * Validate form danh mục.
 */
export function validateCategory(data) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Vui lòng nhập tên danh mục.";
  }

  return errors;
}

/**
 * Validate form giao dịch nhập/xuất.
 * availableQty: số lượng tồn hiện tại (dùng khi xuất kho).
 */
export function validateTransaction(data, { isExport = false, availableQty = 0 } = {}) {
  const errors = {};

  if (!data.productId) {
    errors.productId = "Vui lòng chọn sản phẩm.";
  }

  const qty = Number(data.quantity);
  if (data.quantity === "" || Number.isNaN(qty)) {
    errors.quantity = "Vui lòng nhập số lượng.";
  } else if (qty <= 0) {
    errors.quantity = "Số lượng phải lớn hơn 0.";
  } else if (isExport && qty > availableQty) {
    errors.quantity = `Không đủ tồn kho (còn ${availableQty}).`;
  }

  return errors;
}
