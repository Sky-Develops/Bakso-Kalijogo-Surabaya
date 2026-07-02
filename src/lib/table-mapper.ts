import { DiningTable, OrderStatus, QrSession, TableStatus } from "@/types";

export type RawQrSession = {
  id: string;
  table_id: string;
  table_number: number;
  token: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
};

export type RawDiningTable = {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  qr_code_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RawTableOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number | string;
  table_id?: string | null;
  table_number?: string | null;
  created_at: string;
};

export function mapQrSession(row: RawQrSession): QrSession {
  return {
    id: row.id,
    tableId: row.table_id,
    tableNumber: row.table_number,
    token: row.token,
    isActive: row.is_active,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function mapDiningTable(
  row: RawDiningTable,
  qrSession?: RawQrSession | null,
  currentOrder?: RawTableOrder | null
): DiningTable {
  return {
    id: row.id,
    number: row.number,
    capacity: row.capacity,
    status: row.status,
    qrCodeUrl: row.qr_code_url ?? null,
    activeQrSession: qrSession ? mapQrSession(qrSession) : null,
    currentOrder: currentOrder
      ? {
          id: currentOrder.id,
          orderNumber: currentOrder.order_number,
          status: currentOrder.status,
          totalAmount: Number(currentOrder.total_amount),
          createdAt: currentOrder.created_at,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
