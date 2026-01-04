"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Expense, ExpenseCategory } from "@/types/expense";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useExpensesCache } from "@/hooks/useDataCache";
import MonthNavigator from "@/components/reports/MonthNavigator";
import dayjs from "dayjs";
import { compressImage } from "@/utils/image/compress";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload, ImageIcon, X } from "lucide-react";

interface ExpenseFormData {
  amount: string;
  category: ExpenseCategory;
  description: string;
  date: string;
  image?: string;
  isPaidFromSafe: boolean;
}

const initialFormData: ExpenseFormData = {
  amount: "",
  category: ExpenseCategory.OTHER,
  description: "",
  date: new Date().toISOString().split('T')[0],
  image: "",
  isPaidFromSafe: true,
};

const categoryLabels = {
  [ExpenseCategory.RENT]: "Kira",
  [ExpenseCategory.BILL]: "Fatura/Fiş",
  [ExpenseCategory.SUPPLY]: "Malzeme",
  [ExpenseCategory.SALARY]: "Maaş",
  [ExpenseCategory.TAX]: "Vergi",
  [ExpenseCategory.OTHER]: "Diğer",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const currentMonth = monthParam ? dayjs(monthParam) : dayjs();

  // Calculate start and end of the selected month
  const startDate = currentMonth.startOf('month').format('YYYY-MM-DD');
  const endDate = currentMonth.endOf('month').format('YYYY-MM-DD');

  const { loading, fetchExpenses: fetchExpensesFromCache, invalidateExpenses } = useExpensesCache();
  const supabase = createClient();

  useEffect(() => {
    loadExpenses();
  }, [startDate, endDate]);

  const loadExpenses = async () => {
    try {
      const data = await fetchExpensesFromCache(startDate, endDate);
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const refreshExpenses = async () => {
    try {
      const data = await fetchExpensesFromCache(startDate, endDate, true); // Force refresh
      setExpenses(data);
    } catch (error) {
      console.error("Error refreshing expenses:", error);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const compressedFile = await compressImage(file);
      
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { data, error } = await supabase.storage
        .from('expenses')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('expenses')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Resim yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "" || /^\d*\.?\d*$/.test(val)) {
          setFormData({ ...formData, amount: val });
      } else {
          alert("Lütfen geçerli bir sayı giriniz");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        isPaidFromSafe: formData.isPaidFromSafe,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        invalidateExpenses(); // Clear cache
        await refreshExpenses(); // Refresh from server
        resetForm();
      } else {
        console.error("Error saving expense");
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || "",
      date: new Date(expense.date).toISOString().split('T')[0],
      image: (expense as any).image || "",
      isPaidFromSafe: expense.isPaidFromSafe !== undefined ? expense.isPaidFromSafe : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        invalidateExpenses(); // Clear cache
        await refreshExpenses(); // Refresh from server
      } else {
        console.error("Error deleting expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingExpense(null);
    setShowForm(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `₺${amount.toFixed(2)}`;
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6">Harcamalar</h1>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Harcamalar</h1>
        <Button onClick={() => setShowForm(true)}>Harcama Ekle</Button>
      </div>

      <MonthNavigator />

      {expenses.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  Toplam Harcama: {formatCurrency(getTotalExpenses())}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Harcamayı Düzenle" : "Yeni Harcama Ekle"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tutar *</label>
              <input
                type="text"
                required
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategori *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {Object.values(ExpenseCategory).map(category => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tarih *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                placeholder="Harcama açıklaması girin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fiş/Fatura Görseli</label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                     <img src={formData.image} alt="Expense receipt" className="w-full h-full object-contain" />
                     <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                     >
                       <X size={16} />
                     </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                         <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                      ) : (
                        <>
                           <Upload className="w-8 h-8 text-gray-400 mb-2" />
                           <p className="text-sm text-gray-500">Görsel yüklemek için tıklayın</p>
                        </>
                      )}
                    </div>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageSelect}
                        disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Yöntemi</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isPaidFromSafe}
                    onChange={() => setFormData({ ...formData, isPaidFromSafe: true })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span>Kasa (Nakit)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isPaidFromSafe}
                    onChange={() => setFormData({ ...formData, isPaidFromSafe: false })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span>Kredi Kartı / Banka</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                İptal
              </Button>
              <Button type="submit" disabled={submitting || uploading}>
                {submitting ? "Kaydediliyor..." : (editingExpense ? "Güncelle" : "Oluştur")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <img src={selectedImage} alt="Receipt Full" className="w-full h-auto max-h-[80vh] object-contain" />
            </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4">
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Görsel</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    {(expense as any).image ? (
                        <button 
                            onClick={() => setSelectedImage((expense as any).image)}
                            className="w-10 h-10 rounded overflow-hidden border hover:opacity-80 transition-opacity"
                        >
                            <img src={(expense as any).image} alt="Receipt" className="w-full h-full object-cover" />
                        </button>
                    ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300">
                            <ImageIcon size={16} />
                        </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {expense.isPaidFromSafe ? "Nakit" : "Kredi Kartı"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {categoryLabels[expense.category]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {expense.description || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(expense)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(expense.id)}
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

        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Harcama bulunamadı. İlk harcamanızı ekleyerek başlayın.
          </div>
        )}
      </div>
    </div>
  );
}