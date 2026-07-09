export type UserRole = "farmer" | "buyer" | "admin";
export type TrustLevel = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified?: boolean; // For farmers
  farmName?: string; // For farmers
  farmLocation?: string; // For farmers
  trustLevel?: TrustLevel; // For farmers
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unit: "kg" | "lbs" | "piece" | "dozen" | "bunch";
  price: number;
  harvestDate: string;
  location: string;
  images: string[];
  deliveryOptions: string[];
  farmerId: string;
  farmerName: string; // denormalized for convenience
  farmerVerified: boolean; // denormalized
  farmerTrustLevel: TrustLevel; // denormalized
}

export type OrderStatus =
  | "Pending"
  | "Accepted"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  buyerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number; // Price at time of order
  }[];
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  shippingCost: number;
  orderDate: string;
}
