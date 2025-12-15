"use server";

import { prisma } from "@/utils/db/prisma";
import dayjs from "dayjs";
import { Product } from "@/types/product";

export async function createProduct(data: {
  name: string;
  price: number;
  description?: string;
  mainCategory: string;
  category: string[];
  isAvailable?: boolean;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description || null,
        mainCategory: data.mainCategory,
        category: data.category,
        isAvailable: data.isAvailable ?? true,
      },
    });
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    price?: number;
    description?: string;
    mainCategory?: string;
    category?: string[];
    isAvailable?: boolean;
  }
) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        description: data.description === "" ? null : data.description,
      },
    });
    return { success: true, data: product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
