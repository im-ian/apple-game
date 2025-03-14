"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSessionStorage } from "@/hooks/use-session-storage";

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [storedNickname, setStoredNickname] = useSessionStorage<string>(
    "nickname",
    ""
  );

  useEffect(() => {
    if (storedNickname) {
      setNickname(storedNickname);
    }
  }, [storedNickname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    if (trimmedNickname.length > 10) {
      toast.error("닉네임은 10자 이하로 입력해주세요.");
      return;
    }

    setStoredNickname(trimmedNickname);
    router.push("/game");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          사과 게임
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-apple-red text-white py-2 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!nickname.trim()}
          >
            게임 시작
          </button>
        </form>
      </div>
    </div>
  );
}
