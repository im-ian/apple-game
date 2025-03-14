"use client";
import AppleGame from "@/components/AppleGame";

export default function Home() {
  return (
    <>
      <AppleGame
        onGameFinish={(finalScore, score, timeLeft) => {
          console.log(finalScore, score, timeLeft);
        }}
      />
    </>
  );
}
