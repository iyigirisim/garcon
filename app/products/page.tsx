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
import { getCategories, createCategory, deleteCategory } from "@/actions/category";

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

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const { loading, fetchProducts: fetchProductsFromCache, invalidateProducts } = useProductsCache();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProductsFromCache();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

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
    setShowCategoriesDialog(true);
  };

  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory) {
      const result = await createCategory(trimmedCategory);
      if (result.success) {
        setNewCategory("");
        loadCategories();
      } else {
         alert(`Error creating category: ${result.error}`);
      }
    }
  };

  const handleRemoveCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const result = await deleteCategory(id);
    if (result.success) {
      loadCategories();
    } else {
      alert(`Error deleting category: ${result.error}`);
    }
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
        <h1 className="text-4xl font-bold mb-6">Ürünler</h1>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Ürünler</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={openCategoriesDialog}>
            Kategorileri Düzenle
          </Button>
          <Button onClick={() => setShowForm(true)}>Ürün Ekle</Button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">İsim</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fiyat</label>
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
              <label className="block text-sm font-medium mb-1">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ana Kategori</label>
              <select
                required
                value={formData.mainCategory}
                onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Ana kategori seçin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategoriler</label>
              <div className="space-y-2">
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !formData.category.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        category: [...prev.category, value]
                      }));
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Kategori ekle...</option>
                  {categories.filter(c => !formData.category.includes(c.name)).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
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
              <label htmlFor="isAvailable" className="text-sm font-medium">Mevcut</label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                İptal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Kaydediliyor..." : (editingProduct ? "Güncelle" : "Oluştur")}
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
                <TableHead>İsim</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Ana Kategori</TableHead>
                <TableHead>Kategoriler</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
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
                      {product.isAvailable ? "Mevcut" : "Mevcut Değil"}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Ürün bulunamadı. İlk ürününüzü ekleyerek başlayın.
          </div>
        )}
      </div>

      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kategorileri Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Yeni Kategori Ekle</label>
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
                  placeholder="Kategori adı"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <Button type="button" onClick={handleAddCategory}>
                   Ekle
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mevcut Kategoriler</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm">Mevcut kategori yok</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                    >
                      <span className="text-sm">{category.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCategory(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Sil
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCategoriesDialog(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}