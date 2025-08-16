"use client";

import React from "react";
import { SaleForm } from "@/components/sale";
import { Sale } from "@/types";

export default function Page() {
  const handleSaleComplete = (sale: Sale) => {
    console.log("Sale completed:", sale);
    // Here you could redirect to a success page, show a toast, etc.
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <SaleForm onSaleComplete={handleSaleComplete} />
      </div>
    </div>
  );
}