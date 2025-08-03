export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: string[];
  mainCategory: string;
  isAvailable?: boolean;
  createdAt?: Date;
};
