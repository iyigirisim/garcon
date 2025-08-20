"use client";

import React, { useState } from "react";
import { SaleForm } from "@/components/sale";
import { Sale } from "@/types";

export default function Page() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleSaleComplete = (sale: Sale) => {
    console.log("Sale completed:", sale);
    // Here you could redirect to a success page, show a toast, etc.
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        {/* Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              return (
                <div key={step} className="flex-1 flex items-center">
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`flex items-center gap-3`}
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : isActive
                            ? "border-emerald-600 text-emerald-700"
                            : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {step}
                    </span>
                    <span className={`text-sm font-medium ${isActive ? "text-emerald-700" : "text-gray-600"}`}>
                      {step === 1 && "Table & Customer"}
                      {step === 2 && "Products"}
                      {step === 3 && "Review"}
                      {step === 4 && "Payment"}
                    </span>
                  </button>
                  {step < 4 && (
                    <div className={`flex-1 h-0.5 mx-3 ${currentStep > step ? "bg-emerald-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="fixed w-[90vw] h-[calc(100vh-10rem)]">
          <SaleForm
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onSaleComplete={handleSaleComplete}
            />
        </div>
      </div>
    </div>
  );
}