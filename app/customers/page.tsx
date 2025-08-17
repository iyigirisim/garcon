"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/types/user";
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
import { useCustomersCache } from "@/hooks/useDataCache";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

const initialFormData: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  role: UserRole.CUSTOMER,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const { loading, fetchCustomers: fetchCustomersFromCache, invalidateCustomers } = useCustomersCache();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomersFromCache();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const refreshCustomers = async () => {
    try {
      const data = await fetchCustomersFromCache(true); // Force refresh
      setCustomers(data);
    } catch (error) {
      console.error("Error refreshing customers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        invalidateCustomers(); // Clear cache
        await refreshCustomers(); // Refresh from server
        resetForm();
      } else {
        console.error("Error saving customer");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer: User) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      role: customer.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        invalidateCustomers(); // Clear cache
        await refreshCustomers(); // Refresh from server
      } else {
        console.error("Error deleting customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCustomer(null);
    setShowForm(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6">Customers</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Customers</h1>
        <Button onClick={() => setShowForm(true)}>Add Customer</Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={UserRole.CUSTOMER}>Customer</option>
                <option value={UserRole.STAFF}>Staff</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : (editingCustomer ? "Update" : "Create")}
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  </TableCell>
                  <TableCell>
                    {customer.email || "-"}
                  </TableCell>
                  <TableCell>
                    {customer.phone || "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.role === UserRole.ADMIN
                          ? "bg-purple-100 text-purple-800"
                          : customer.role === UserRole.STAFF
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customer.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(customer.id)}
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

        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found. Add your first customer to get started.
          </div>
        )}
      </div>
    </div>
  );
}