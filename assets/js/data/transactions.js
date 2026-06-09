/**
 * data/transactions.js - Dữ liệu giao dịch mẫu
 */

export const SAMPLE_TRANSACTIONS = [
  {
    id: "tx-1",
    type: "import",
    productId: "prod-5",
    quantity: 50,
    note: "Nhập lô AirPods mới",
    createdAt: "2024-02-20T09:30:00.000Z",
  },
  {
    id: "tx-2",
    type: "export",
    productId: "prod-5",
    quantity: 5,
    note: "Xuất bán lẻ",
    createdAt: "2024-02-21T14:10:00.000Z",
  },
  {
    id: "tx-3",
    type: "import",
    productId: "prod-7",
    quantity: 20,
    note: "Nhập router từ NCC",
    createdAt: "2024-02-22T10:00:00.000Z",
  },
  {
    id: "tx-4",
    type: "export",
    productId: "prod-1",
    quantity: 3,
    note: "Đơn hàng khách VIP",
    createdAt: "2024-02-23T16:45:00.000Z",
  },
];
