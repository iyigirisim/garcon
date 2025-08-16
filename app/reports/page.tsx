import { createClient } from "@/utils/supabase/server";

export default async function Reports() {
  const supabase = await createClient();
  const { data: sales } = await supabase.from("Sale").select();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>
        <pre>{JSON.stringify(sales, null, 2)}</pre>
      </div>
    </div>
  );
}
