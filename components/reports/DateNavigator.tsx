"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function DateNavigator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const currentDate = dateParam ? dayjs(dateParam) : dayjs();

  const handleDateChange = (days: number) => {
    const newDate = currentDate.add(days, "day").format("YYYY-MM-DD");
    router.push(`/reports?date=${newDate}`);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
        router.push(`/reports?date=${e.target.value}`);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-orange-100 mb-6">
      <button
        onClick={() => handleDateChange(-1)}
        className="p-2 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="relative flex items-center gap-3 cursor-pointer group">
        <div className="bg-orange-50 p-2 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors">
           <Calendar size={20} />
        </div>
        <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">
                {currentDate.format("D MMMM YYYY")}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
                {currentDate.format("dddd")}
            </p>
        </div>
        
        <input 
            type="date" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={currentDate.format("YYYY-MM-DD")}
            onChange={handleDateSelect}
        />
      </div>

      <button
        onClick={() => handleDateChange(1)}
        className="p-2 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
