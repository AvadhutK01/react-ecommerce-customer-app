export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const getOrderStatusStyles = (status) => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'bg-orange-50 text-orange-600 border-orange-100';
    case ORDER_STATUS.PROCESSING:
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case ORDER_STATUS.SHIPPED:
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case ORDER_STATUS.DELIVERED:
      return 'bg-green-50 text-green-600 border-green-100';
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.REJECTED:
      return 'bg-red-50 text-red-600 border-red-100';
    default:
      return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

export const getPaymentStatusStyles = (status) => {
  switch (status) {
    case PAYMENT_STATUS.PAID:
      return 'bg-green-50 text-green-600 border-green-100';
    case PAYMENT_STATUS.PENDING:
      return 'bg-orange-50 text-orange-600 border-orange-100';
    case PAYMENT_STATUS.FAILED:
      return 'bg-red-50 text-red-600 border-red-100';
    case PAYMENT_STATUS.REFUNDED:
      return 'bg-purple-50 text-purple-600 border-purple-100';
    default:
      return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};
