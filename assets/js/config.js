/**
 * config.js - Cấu hình toàn cục của ứng dụng
 */

export const APP_CONFIG = {
  name: "Kho Hàng",
  description: "Hệ thống quản lý hàng hoá",
  version: "1.0.0",
  user: {
    name: "Quản trị viên",
    initials: "QT",
  },
  defaultRoute: "#/dashboard",
};

// Key dùng để lưu trong localStorage
export const STORAGE_KEYS = {
  products: "wh_products",
  categories: "wh_categories",
  transactions: "wh_transactions",
};

// Ngưỡng cảnh báo sắp hết hàng
export const LOW_STOCK_LIMIT = 5;

// Loại giao dịch
export const TRANSACTION_TYPES = {
  IMPORT: "import",
  EXPORT: "export",
};
