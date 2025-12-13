export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image?: string | null;
  category: string[];
  mainCategory: string;
  isAvailable?: boolean;
  createdAt?: Date;
};
