import { ExpenseCategory } from "@/types";

interface ExpenseItem {
    id: string;
    category: ExpenseCategory;
    description: string | null;
    amount: number;
    date: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    RENT: "Kira",
    BILL: "Fatura",
    SUPPLY: "Malzeme",
    SALARY: "Maaş",
    TAX: "Vergi",
    OTHER: "Diğer"
};

export default function ExpensesList({ expenses }: { expenses: ExpenseItem[] }) {
     const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Giderler</h3>
             <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-sm text-gray-500 border-b border-gray-100">
                            <th className="text-left pb-3 font-medium">Kategori</th>
                            <th className="text-left pb-3 font-medium">Açıklama</th>
                            <th className="text-right pb-3 font-medium">Tutar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="py-3 text-gray-800">{CATEGORY_LABELS[expense.category] || expense.category}</td>
                                <td className="py-3 text-gray-600 text-sm">{expense.description || "-"}</td>
                                <td className="py-3 text-right text-gray-800 font-medium">{formatCurrency(expense.amount)}</td>
                            </tr>
                        ))}
                         {expenses.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">
                                    Gider kaydı bulunamadı.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
