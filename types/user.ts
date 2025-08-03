export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF", 
  CUSTOMER = "CUSTOMER"
}

export type User = {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
};