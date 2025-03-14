import { Suspense } from "react";
import Ranking from "@/components/Ranking";
import { supabase } from "@/lib/supabase/client";

interface RankingData {
  id: number;
  nickname: string;
  score: number;
  created_at: string;
}

export const revalidate = 30;

export default async function RankPage() {
  const { data } = await supabase
    .from("apple-game")
    .select("*")
    .order("finalScore", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🏆 랭킹 TOP 20
        </h1>

        <Suspense fallback={<div>Loading...</div>}>
          {data ? (
            <Ranking rankings={data} />
          ) : (
            <div className="text-center">데이터를 불러오는데 실패했습니다.</div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
