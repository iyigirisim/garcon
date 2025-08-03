import { createClient } from "@/utils/supabase/server";

export default async function Reports() {
  const supabase = await createClient();
  const { data: sales } = await supabase.from("Sale").select();

  return <pre>{JSON.stringify(sales, null, 2)}</pre>;
}
