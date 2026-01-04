import { getReportData } from "@/actions/reports";
import DateNavigator from "@/components/reports/DateNavigator";
import StatsCards from "@/components/reports/StatsCards";
import ProductBreakdown from "@/components/reports/ProductBreakdown";
import PaymentBreakdown from "@/components/reports/PaymentBreakdown";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const data = await getReportData(searchParams.date);

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 px-4 md:px-0">Günlük Rapor</h1>
        
        <div className="px-4 md:px-0">
            <DateNavigator />

            <StatsCards 
                revenue={data.totalRevenue}
                expense={data.totalExpense}
                profit={data.netProfit}
                cashInHand={data.cashInHand}
            />

            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                 <div className="flex-1">
                    <ProductBreakdown products={data.productSales} />
                 </div>
                 
                 <div className="flex-1 space-y-6">
                    <PaymentBreakdown payments={data.paymentMethods} />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
