import {
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

type MenuItemJoin = {
  image_url?: string | null;
} | null;

type RawOrderItem = {
  id: string;
  menu_item_id?: string | null;
  product_name: string;
  product_image?: string | null;
  quantity: number;
  price: number | string;
  notes?: string | null;
  menu_items?: MenuItemJoin | MenuItemJoin[];
};

export type RawOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  order_type: OrderType;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus | null;
  subtotal: number | string;
  shipping_fee: number | string;
  service_fee: number | string;
  total_amount: number | string;
  customer_name: string;
  customer_phone?: string | null;
  delivery_address?: string | null;
  delivery_area?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  table_number?: string | null;
  notes?: string | null;
  created_at: string;
  order_items?: RawOrderItem[] | null;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function menuImage(item: RawOrderItem) {
  const joined = item.menu_items;
  if (Array.isArray(joined)) return joined[0]?.image_url ?? null;
  return joined?.image_url ?? null;
}

function mapOrderItem(item: RawOrderItem): OrderItem {
  return {
    id: item.id,
    productId: item.menu_item_id ?? undefined,
    productName: item.product_name,
    productImage: item.product_image ?? menuImage(item),
    quantity: item.quantity,
    price: toNumber(item.price),
    notes: item.notes ?? undefined,
  };
}

export function mapOrder(row: RawOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    orderType: row.order_type,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status ?? "UNPAID",
    totalAmount: toNumber(row.total_amount),
    subtotal: toNumber(row.subtotal),
    shippingFee: toNumber(row.shipping_fee),
    serviceFee: toNumber(row.service_fee),
    customerName: row.customer_name,
    customerPhone: row.customer_phone ?? "",
    deliveryAddress: row.delivery_address ?? undefined,
    deliveryArea: row.delivery_area ?? undefined,
    driverName: row.driver_name ?? undefined,
    driverPhone: row.driver_phone ?? undefined,
    tableNumber: row.table_number ?? undefined,
    notes: row.notes ?? undefined,
    items: (row.order_items ?? []).map(mapOrderItem),
    createdAt: row.created_at,
  };
}
