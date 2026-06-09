/**
 * services/transaction.service.js - Nghiệp vụ nhập/xuất kho
 */

import { STORAGE_KEYS, TRANSACTION_TYPES } from "../config.js";
import { getStorage, setStorage } from "../core/storage.js";
import { generateId } from "../core/helpers.js";
import { increaseStock, decreaseStock } from "./product.service.js";

/**
 * Lấy toàn bộ giao dịch (mới nhất trước).
 */
export function getTransactions() {
  const list = getStorage(STORAGE_KEYS.transactions, []);
  return [...list].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Lưu danh sách giao dịch.
 */
function saveTransactions(transactions) {
  setStorage(STORAGE_KEYS.transactions, transactions);
}

/**
 * Lấy N giao dịch gần đây nhất.
 */
export function getRecentTransactions(limit = 5) {
  return getTransactions().slice(0, limit);
}

/**
 * Thêm một bản ghi giao dịch vào storage.
 */
function addTransaction(record) {
  const transactions = getStorage(STORAGE_KEYS.transactions, []);
  transactions.push(record);
  saveTransactions(transactions);
  return record;
}

/**
 * Tạo giao dịch NHẬP kho: tăng tồn + lưu lịch sử.
 */
export function createImportTransaction(data) {
  const updated = increaseStock(data.productId, data.quantity);
  if (!updated || updated.error) {
    return { success: false, message: updated?.error || "Sản phẩm không tồn tại." };
  }

  const record = {
    id: generateId("tx"),
    type: TRANSACTION_TYPES.IMPORT,
    productId: data.productId,
    quantity: Number(data.quantity),
    note: (data.note || "").trim(),
    createdAt: new Date().toISOString(),
  };
  addTransaction(record);
  return { success: true, transaction: record };
}

/**
 * Tạo giao dịch XUẤT kho: giảm tồn (kiểm tra đủ hàng) + lưu lịch sử.
 */
export function createExportTransaction(data) {
  const updated = decreaseStock(data.productId, data.quantity);
  if (!updated) {
    return { success: false, message: "Sản phẩm không tồn tại." };
  }
  if (updated.error) {
    return { success: false, message: updated.error };
  }

  const record = {
    id: generateId("tx"),
    type: TRANSACTION_TYPES.EXPORT,
    productId: data.productId,
    quantity: Number(data.quantity),
    note: (data.note || "").trim(),
    createdAt: new Date().toISOString(),
  };
  addTransaction(record);
  return { success: true, transaction: record };
}

/**
 * Lọc giao dịch theo loại ("import" | "export" | "" = tất cả).
 */
export function filterTransactions(type = "") {
  if (!type) return getTransactions();
  return getTransactions().filter((t) => t.type === type);
}

/**
 * Lấy riêng giao dịch nhập kho.
 */
export function getImportTransactions() {
  return filterTransactions(TRANSACTION_TYPES.IMPORT);
}

/**
 * Lấy riêng giao dịch xuất kho.
 */
export function getExportTransactions() {
  return filterTransactions(TRANSACTION_TYPES.EXPORT);
}
