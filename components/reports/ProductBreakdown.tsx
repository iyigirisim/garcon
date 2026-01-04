interface ProductSales {
    productId: string;
    name: string;
    quantity: number;
    total: number;
}

export default function ProductBreakdown({ products }: { products: ProductSales[] }) {
     const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ürün Satışları</h3>
            <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full relative">
                    <thead className="sticky top-0 bg-white shadow-sm z-10 transition-shadow duration-200">
                        <tr className="text-sm text-gray-500 border-b border-gray-100">
                            <th className="text-left pb-3 font-medium bg-white">Ürün</th>
                            <th className="text-right pb-3 font-medium bg-white">Adet</th>
                            <th className="text-right pb-3 font-medium bg-white">Toplam</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((product) => (
                            <tr key={product.productId} className="hover:bg-gray-50">
                                <td className="py-3 text-gray-800">{product.name}</td>
                                <td className="py-3 text-right text-gray-600 font-medium">{product.quantity}</td>
                                <td className="py-3 text-right text-gray-800 font-medium">{formatCurrency(product.total)}</td>
                            </tr>
                        ))}
                         {products.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">
                                    Satış kaydı bulunamadı.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
