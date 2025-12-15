"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProductsCache } from "@/hooks/useDataCache";
import { createProduct, updateProduct, deleteProduct } from "@/actions/product";

interface ProductFormData {
  name: string;
  price: number;
  description: string;
  mainCategory: string;
  category: string[];
  isAvailable: boolean;
}

const initialFormData: ProductFormData = {
  name: "",
  price: 0,
  description: "",
  mainCategory: "",
  category: [],
  isAvailable: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [editableCategories, setEditableCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const { loading, fetchProducts: fetchProductsFromCache, invalidateProducts } = useProductsCache();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProductsFromCache();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    // Extract unique categories from existing products, lowercase and deduplicate
    const allCategories = [
      ...products.map(p => p.mainCategory?.toLowerCase() || ""),
      ...products.flatMap(p => (p.category || []).map(cat => cat.toLowerCase()))
    ];
    const uniqueCategories = Array.from(new Set(allCategories)).filter(Boolean);
    setAvailableCategories(uniqueCategories);
  }, [products]);

  const refreshProducts = async () => {
    try {
      const data = await fetchProductsFromCache(true); // Force refresh
      setProducts(data);
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let result;
      
      if (editingProduct) {
        // Only include fields that have changed or are relevant
        result = await updateProduct(editingProduct.id, {
          name: formData.name,
          price: formData.price,
          description: formData.description,
          mainCategory: formData.mainCategory,
          category: formData.category,
          isAvailable: formData.isAvailable
        });
      } else {
        result = await createProduct({
          name: formData.name,
          price: formData.price,
          description: formData.description,
          mainCategory: formData.mainCategory,
          category: formData.category,
          isAvailable: formData.isAvailable
        });
      }

      if (result.success) {
        invalidateProducts(); // Clear cache
        await refreshProducts(); // Refresh from server
        resetForm();
      } else {
        console.error("Error saving product:", result.error);
        alert(`Error saving product: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An unexpected error occurred while saving the product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      mainCategory: product.mainCategory,
      category: product.category,
      isAvailable: product.isAvailable ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        invalidateProducts(); // Clear cache
        await refreshProducts(); // Refresh from server
      } else {
        console.error("Error deleting product:", result.error);
        alert(`Error deleting product: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An unexpected error occurred while deleting the product.");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setShowForm(false);
  };

  const openCategoriesDialog = () => {
    setEditableCategories([...availableCategories]);
    setShowCategoriesDialog(true);
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim().toLowerCase();
    if (trimmedCategory && !editableCategories.includes(trimmedCategory)) {
      setEditableCategories(prev => [...prev, trimmedCategory]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setEditableCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const saveCategoriesChanges = () => {
    setAvailableCategories(editableCategories);
    setShowCategoriesDialog(false);
    setNewCategory("");
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, category]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        category: prev.category.filter(c => c !== category)
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6">Products</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Products</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={openCategoriesDialog}>
            Edit Categories
          </Button>
          <Button onClick={() => setShowForm(true)}>Add Product</Button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Main Category</label>
              <input
                type="text"
                required
                value={formData.mainCategory}
                onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter main category"
                list="main-categories"
              />
              <datalist id="main-categories">
                {availableCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add category (press Enter)"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !formData.category.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          category: [...prev.category, value]
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  list="available-categories"
                />
                <datalist id="available-categories">
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(cat, false)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium">Available</label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : (editingProduct ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        <div className="bg-white rounded-lg border max-h-[50rem] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Main Category</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="max-w-80">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate">{product.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    ₺{product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {product.mainCategory}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.category.map((cat, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found. Add your first product to get started.
          </div>
        )}
      </div>

      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Add New Category</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="Category name"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <Button type="button" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Categories</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {editableCategories.length === 0 ? (
                  <p className="text-gray-500 text-sm">No categories available</p>
                ) : (
                  editableCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                    >
                      <span className="text-sm capitalize">{category}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCategory(category)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCategoriesDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCategoriesChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}