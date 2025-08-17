"use client";

import { useState, useEffect } from "react";
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

interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

const initialFormData: ExpenseFormData = {
  amount: 0,
  category: ExpenseCategory.OTHER,
  description: "",
  date: new Date().toISOString().split('T')[0],
};

const categoryLabels = {
  [ExpenseCategory.RENT]: "Rent",
  [ExpenseCategory.BILL]: "Bill",
  [ExpenseCategory.SUPPLY]: "Supply",
  [ExpenseCategory.SALARY]: "Salary",
  [ExpenseCategory.TAX]: "Tax",
  [ExpenseCategory.OTHER]: "Other",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const { loading, fetchExpenses: fetchExpensesFromCache, invalidateExpenses } = useExpensesCache();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await fetchExpensesFromCache();
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const refreshExpenses = async () => {
    try {
      const data = await fetchExpensesFromCache(true); // Force refresh
      setExpenses(data);
    } catch (error) {
      console.error("Error refreshing expenses:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
      amount: expense.amount,
      category: expense.category,
      description: expense.description || "",
      date: new Date(expense.date).toISOString().split('T')[0],
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
        <h1 className="text-4xl font-bold mb-6">Expenses</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Expenses</h1>
        <Button onClick={() => setShowForm(true)}>Add Expense</Button>
      </div>

      {expenses.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  Total Expenses: {formatCurrency(getTotalExpenses())}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
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
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                placeholder="Enter expense description..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : (editingExpense ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(expense.amount)}
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
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(expense.id)}
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

        {expenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No expenses found. Add your first expense to get started.
          </div>
        )}
      </div>
    </div>
  );
}