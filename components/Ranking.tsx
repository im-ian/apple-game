"use client";
import { Rank } from "@/types/rank";
import { useRouter } from "next/navigation";

export default function Ranking({ rankings }: { rankings: Rank[] }) {
  const router = useRouter();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                순위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                최종점수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                날짜
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankings.map((rank, index) => (
              <tr key={rank.id} className={index < 3 ? "bg-yellow-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold">{index + 1}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{rank.nickname}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rank.finalScore.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rank.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="w-full bg-apple-green text-white mt-4 py-2 px-4 rounded-md"
        onClick={() => router.push("/game")}
      >
        게임으로 돌아가기
      </button>
    </>
  );
}
