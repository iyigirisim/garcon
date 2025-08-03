import { Table, User, Product } from "./index";

export enum PaymentType {
  CASH = "CASH",
  CARD = "CARD",
  FOOD_TICKET = "FOOD_TICKET",
  OTHER = "OTHER"
}

export type CustomerOnSale = {
  id: string;
  saleId: string;
  customerId: string;
  amountOwed?: number;
  sale?: Sale;
  customer?: User;
};

export type Sale = {
  id: string;
  tableId: string;
  table?: Table;
  saleItems: SaleItem[];
  total: number;
  isPaid: boolean;
  paidAt?: Date;
  paymentType?: PaymentType;
  paidAmount?: number;
  isOnCredit: boolean;
  note?: string;
  createdById?: string;
  createdBy?: User;
  customers: CustomerOnSale[];
  createdAt: Date;
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  sale?: Sale;
  product?: Product;
};