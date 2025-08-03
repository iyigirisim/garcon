import { User } from "./index";

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
  category: ExpenseCategory;
  description?: string;
  createdById?: string;
  createdBy?: User;
};
