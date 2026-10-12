import type {
  OrderStatus,
} from '@/types/order'

export const orderStatusLabels:
  Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  processing: 'กำลังจัดเตรียม',
  shipped: 'จัดส่งแล้ว',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
}

export const orderStatusClasses:
  Record<OrderStatus, string> = {
  pending:
    'bg-orange-50 text-orange-700',

  confirmed:
    'bg-blue-50 text-blue-700',

  processing:
    'bg-amber-50 text-amber-700',

  shipped:
    'bg-indigo-50 text-indigo-700',

  completed:
    'bg-green-50 text-green-700',

  cancelled:
    'bg-red-50 text-red-600',
}

export const allowedOrderTransitions:
  Record<OrderStatus, OrderStatus[]> = {
  pending: [
    'confirmed',
    'cancelled',
  ],

  confirmed: [
    'processing',
    'cancelled',
  ],

  processing: [
    'shipped',
  ],

  shipped: [
    'completed',
  ],

  completed: [],

  cancelled: [],
}

export const getOrderStatusLabel = (
  status: OrderStatus,
) => {
  return orderStatusLabels[status]
}

export const getOrderStatusClass = (
  status: OrderStatus,
) => {
  return orderStatusClasses[status]
}

export const getAllowedOrderStatuses = (
  status: OrderStatus,
) => {
  return allowedOrderTransitions[status]
}
