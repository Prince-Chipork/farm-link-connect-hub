import type { TrustLevel } from "./user";

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
  farmerName: string;
  farmerVerified: boolean;
  farmerTrustLevel: TrustLevel;
  delivery_fee?: number;
}
