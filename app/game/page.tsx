"use client";
import AppleGame from "@/components/AppleGame";

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <AppleGame
        onGameFinish={(finalScore, score, timeLeft) => {
          console.log(finalScore, score, timeLeft);
        }}
      />
    </div>
  );
}
