import { User, PaymentType } from "./index";

export enum ExpenseCategory {
  RENT = "RENT",
  BILL = "BILL",
  SUPPLY = "SUPPLY", 
  SALARY = "SALARY",
  TAX = "TAX",
  OTHER = "OTHER"
}

export type Expense = {
  id: string;
  date: Date;
  amount: number;
  paymentType: PaymentType;
  category: ExpenseCategory;
  description?: string | null;
  createdById?: string | null;
  createdBy?: User | null;
};
