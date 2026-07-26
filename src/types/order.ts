export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  buyerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  shippingCost: number;
  orderDate: string;
}
