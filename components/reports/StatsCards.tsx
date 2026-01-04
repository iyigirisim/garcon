import { Wallet, TrendingUp, TrendingDown, Vault } from "lucide-react";

interface StatsProps {
    revenue: number;
    expense: number;
    profit: number;
    cashInHand: number;
}

export default function StatsCards({ revenue, expense, profit, cashInHand }: StatsProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Toplam Ciro</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(revenue)}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <TrendingUp size={24} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Giderler</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(expense ?? 0)}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                    <TrendingDown size={24} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Net Kar</p>
                    <h3 className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                    </h3>
                </div>
                <div className={`p-3 rounded-lg ${profit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <Wallet size={24} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Kasa</p>
                    <h3 className={`text-2xl font-bold ${cashInHand >= 0 ? 'text-gray-800' : 'text-red-500'}`}>{formatCurrency(cashInHand)}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Vault size={24} />
                </div>
            </div>
        </div>
    );
}
