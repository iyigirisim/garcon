import { getActiveTables, getClosedTables } from "@/actions/table";
import SaleForm from "@/components/sale/SaleForm";

export default async function Home() {
  const [activeTables, closedTables] = await Promise.all([
    getActiveTables(),
    getClosedTables()
  ]);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Table Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Active Tables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTables.map((table) => (
              <div key={table.id} className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-base font-bold mb-2">{table.name}</h3>
                <p className="text-sm text-gray-600">
                  {table.customerName ? `Customer: ${table.customerName}` : "Empty"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Closed Tables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedTables.map((table) => (
              <div key={table.id} className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-base font-bold mb-2">{table.name}</h3>
                <p className="text-sm text-gray-600">
                  {table.customerName ? `Customer: ${table.customerName}` : "Empty"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaleForm />
    </main>
  );
}
