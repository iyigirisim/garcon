"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function MonthNavigator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  
  // Default to current month if no param
  const currentMonth = monthParam ? dayjs(monthParam) : dayjs();

  const handleMonthChange = (months: number) => {
    const newMonth = currentMonth.add(months, "month").format("YYYY-MM");
    router.push(`/expenses?month=${newMonth}`);
  };

  const handleMonthSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
        // e.target.value for month input is YYYY-MM
        router.push(`/expenses?month=${e.target.value}`);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <button
        onClick={() => handleMonthChange(-1)}
        className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="relative flex items-center gap-3 cursor-pointer group">
        <div className="bg-orange-50 p-2 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors">
           <Calendar size={20} />
        </div>
        <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800 capitalize">
                {currentMonth.format("MMMM YYYY")}
            </h2>
        </div>
        
        <input 
            type="month" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={currentMonth.format("YYYY-MM")}
            onChange={handleMonthSelect}
        />
      </div>

      <button
        onClick={() => handleMonthChange(1)}
        className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
