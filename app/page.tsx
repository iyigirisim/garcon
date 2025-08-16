import { Header } from "@/components/dashboard/Header";
import { DailySalesChart, CategoryBar } from "@/components/dashboard/Charts";
import { StatCards } from "@/components/dashboard/StatCards";
import { Card } from "@/components/ui/card";

export default async function Home() {
  return (
    <main className="h-full overflow-auto p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        <Header />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DailySalesChart className="h-[320px]" />
          </div>

          <div className="lg:col-span-1">
            <StatCards />
          </div>

          <div className="lg:col-span-1">
            <CategoryBar />
          </div>
        </div>
      </div>
    </main>
  );
}
