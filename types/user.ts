export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF", 
  CUSTOMER = "CUSTOMER"
}

export type User = {
  id: string;
  email?: string | null;
  name: string;
  role: UserRole;
  phone?: string | null;
  createdAt: Date;
};