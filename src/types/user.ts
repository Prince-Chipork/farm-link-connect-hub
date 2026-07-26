export type UserRole = "farmer" | "buyer" | "admin";

export type TrustLevel =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified?: boolean;
  farmName?: string;
  farmLocation?: string;
  trustLevel?: TrustLevel;
}
