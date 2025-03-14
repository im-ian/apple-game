"use client";
import AppleGame from "@/components/AppleGame";
import { useSessionStorage } from "@/hooks/use-session-storage";
import { supabase } from "@/lib/supabase/client";

async function saveScore(
  nickname: string,
  finalScore: number,
  score: number,
  time: number
) {
  await supabase
    .from("apple-game")
    .insert([{ nickname, finalScore, score, time }]);
}

export default function GamePage() {
  const [nickname] = useSessionStorage("nickname", "");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <AppleGame
        onGameFinish={(finalScore, score, timeLeft) => {
          console.log(finalScore, score, timeLeft);
          saveScore(nickname, finalScore, score, timeLeft);
        }}
      />
    </div>
  );
}
