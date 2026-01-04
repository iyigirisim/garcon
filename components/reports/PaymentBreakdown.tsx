import { PaymentType } from "@/types";
import { CreditCard, Banknote, Ticket, AlertCircle } from "lucide-react";

interface PaymentData {
    type: string; // The action returns string representation of enum usually, but strictly it is PaymentType
    amount: number;
}

export default function PaymentBreakdown({ payments }: { payments: PaymentData[] }) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "CASH": return <Banknote size={20} />;
            case "CARD": return <CreditCard size={20} />;
            case "FOOD_TICKET": return <Ticket size={20} />;
            default: return <AlertCircle size={20} />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case "CASH": return "Nakit";
            case "CARD": return "Kredi Kartı";
            case "FOOD_TICKET": return "Yemek Çeki";
            default: return "Diğer";
        }
    };

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ödeme Yöntemleri</h3>
            <div className="space-y-4">
                {payments.map((payment) => (
                    <div key={payment.type} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                {getIcon(payment.type)}
                            </div>
                            <div>
                                <p className="text-gray-800 font-medium">{getLabel(payment.type)}</p>
                                <p className="text-xs text-gray-500">
                                    {total > 0 ? ((payment.amount / total) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                        <span className="text-gray-800 font-bold">{formatCurrency(payment.amount)}</span>
                    </div>
                ))}
                 {payments.length === 0 && (
                     <div className="py-8 text-center text-gray-500">
                        Ödeme kaydı yok.
                     </div>
                 )}
            </div>
        </div>
    );
}
