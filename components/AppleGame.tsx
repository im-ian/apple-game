import React, { useRef, useEffect, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface AppleItem {
  id: string;
  value: number;
  position: {
    row: number;
    col: number;
  };
  removed: boolean;
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const GAME_TIME = 60;

const GameCanvas: React.FC<{
  onGameFinish: (finalScore: number, score: number, timeLeft: number) => void;
}> = ({ onGameFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_TIME);
  const [apples, setApples] = useState<AppleItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [, setDragEnd] = useState<Position | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(
    null
  );
  const [sparkles, setSparkles] = useState<
    { x: number; y: number; id: string }[]
  >([]);

  const gridSize = 10;
  const cellSize = 50;
  const gridPadding = 20;

  // Initialize game
  useEffect(() => {
    generateGrid();
  }, []);

  // 점수 계산 함수 추가
  const calculateFinalScore = (
    matchCount: number,
    remainingTime: number
  ): number => {
    const safeTime = Math.max(0, remainingTime); // 시간이 음수가 되지 않도록 보장
    return matchCount + safeTime;
  };

  // Game timer도 같은 방식으로 수정
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const finalScore = calculateFinalScore(score, 0);

          setGameOver(true);
          setTimeout(() => {
            onGameFinish(finalScore, score, Math.max(0, timeLeft));
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, score, onGameFinish]);

  // Check if all apples are removed
  useEffect(() => {
    if (apples.length === 0 || !gameStarted || gameOver) return;

    // 모든 사과가 제거되었는지 확인
    if (apples.every((apple) => apple.removed)) {
      const finalScore = calculateFinalScore(score, timeLeft);

      setGameOver(true);
      setTimeout(() => {
        onGameFinish(finalScore, score, Math.max(0, timeLeft));
      }, 100);

      setTimeout(() => {
        generateGrid();
      }, 1500);
    }
  }, [apples, gameStarted, gameOver, score, timeLeft, onGameFinish]);

  const generateGrid = () => {
    const newApples: AppleItem[] = [];
    const grid: (number | null)[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    // 그리드에 숫자 채우기를 위한 가능한 조합들 준비
    const combinations: number[][] = [];

    // 2개씩 조합 (합이 10)
    for (let i = 1; i <= 9; i++) {
      combinations.push([i, 10 - i]);
    }

    // 3개씩 조합 (합이 10)
    for (let i = 1; i <= 7; i++) {
      for (let j = 1; j <= 7; j++) {
        const k = 10 - i - j;
        if (k >= 1 && k <= 9 && i !== j && j !== k && i !== k) {
          combinations.push([i, j, k]);
        }
      }
    }

    // 4개씩 조합 (합이 10)
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 5; j++) {
        for (let k = 1; k <= 5; k++) {
          const l = 10 - i - j - k;
          if (
            l >= 1 &&
            l <= 9 &&
            i !== j &&
            j !== k &&
            k !== l &&
            i !== k &&
            i !== l &&
            j !== l
          ) {
            combinations.push([i, j, k, l]);
          }
        }
      }
    }

    // 조합들을 섞기
    const shuffle = <T,>(array: T[]): T[] => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const shuffledCombinations = shuffle([...combinations]);

    // 무작위 시작 위치에서 그리드 채우기
    const fillGridRandomly = () => {
      const emptyCells: [number, number][] = [];

      // 모든 빈 셀 찾기
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (grid[row][col] === null) {
            emptyCells.push([row, col]);
          }
        }
      }

      if (emptyCells.length === 0) return;

      // 시작 지점 무작위 선택
      const startIndex = Math.floor(Math.random() * emptyCells.length);
      const [startRow, startCol] = emptyCells[startIndex];

      // 조합 선택 및 배치 시도
      for (const combo of shuffledCombinations) {
        // 조합을 배치할 수 있는 방향 선택 시도
        const directions = shuffle([
          [0, 1], // 오른쪽
          [1, 0], // 아래
          [1, 1], // 대각선 오른쪽 아래
          [0, -1], // 왼쪽
          [-1, 0], // 위
          [-1, -1], // 대각선 왼쪽 위
          [1, -1], // 대각선 오른쪽 위
          [-1, 1], // 대각선 왼쪽 아래
        ]);

        for (const [dx, dy] of directions) {
          let canPlace = true;
          const positions: [number, number][] = [];

          // 현재 조합을 선택한 방향에 배치할 수 있는지 확인
          for (let i = 0; i < combo.length; i++) {
            const row = startRow + i * dx;
            const col = startCol + i * dy;

            if (
              row < 0 ||
              row >= gridSize ||
              col < 0 ||
              col >= gridSize ||
              grid[row][col] !== null
            ) {
              canPlace = false;
              break;
            }

            positions.push([row, col]);
          }

          if (canPlace) {
            // 조합 배치
            for (let i = 0; i < combo.length; i++) {
              const [row, col] = positions[i];
              grid[row][col] = combo[i];
            }
            return true;
          }
        }
      }

      // 단일 숫자 배치 (조합 배치 실패 시)
      grid[startRow][startCol] = Math.floor(Math.random() * 9) + 1;
      return true;
    };

    // 그리드 채우기
    let attemptsCount = 0;
    const maxAttempts = gridSize * gridSize * 3; // 최대 시도 횟수 설정

    while (attemptsCount < maxAttempts) {
      const result = fillGridRandomly();
      if (!result) break;

      // 그리드가 다 채워졌는지 확인
      let allFilled = true;
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (grid[row][col] === null) {
            allFilled = false;
            break;
          }
        }
        if (!allFilled) break;
      }

      if (allFilled) break;
      attemptsCount++;
    }

    // 남은 빈 셀들 무작위 숫자로 채우기
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === null) {
          // 빈 셀에 1~9 사이의 값 할당
          grid[row][col] = Math.floor(Math.random() * 9) + 1;
        }
      }
    }

    // 최종 그리드를 apples 배열로 변환
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newApples.push({
          id: `apple-${row}-${col}`,
          value: grid[row][col] as number,
          position: { row, col },
          removed: false,
        });
      }
    }

    setApples(newApples);
    setTimeLeft(GAME_TIME);
    setScore(0);
    setGameOver(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  // const endGame = () => {
  //   const finalScore = score;
  //   const finalTime = timeLeft;
  //   setGameOver(true);
  //   onGameFinish(finalScore, finalTime);
  // };

  const resetGame = () => {
    generateGrid();
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert click position to grid coordinates
    const col = Math.floor((x - gridPadding) / cellSize);
    const row = Math.floor((y - gridPadding) / cellSize);

    // Check if click is inside grid
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      setIsDragging(true);
      setDragStart({ x: col, y: row });
      setCurrentSelection({
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert position to grid coordinates
    const col = Math.floor((x - gridPadding) / cellSize);
    const row = Math.floor((y - gridPadding) / cellSize);

    // Update drag end position
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      setDragEnd({ x: col, y: row });

      // Update current selection
      setCurrentSelection({
        startRow: Math.min(dragStart.y, row),
        startCol: Math.min(dragStart.x, col),
        endRow: Math.max(dragStart.y, row),
        endCol: Math.max(dragStart.x, col),
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !currentSelection || !gameStarted || gameOver) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setCurrentSelection(null);
      return;
    }

    const { startRow, startCol, endRow, endCol } = currentSelection;

    // Check if current selection forms a rectangle
    if (startRow <= endRow && startCol <= endCol) {
      // Get all apples in the selection
      const selectedApples = apples.filter(
        (apple) =>
          !apple.removed &&
          apple.position.row >= startRow &&
          apple.position.row <= endRow &&
          apple.position.col >= startCol &&
          apple.position.col <= endCol
      );

      // Calculate sum of selected apples
      const sum = selectedApples.reduce((acc, apple) => acc + apple.value, 0);

      // Check if sum is 10
      if (sum === 10) {
        // Mark apples as removed
        const newApples = apples.map((apple) => {
          if (selectedApples.some((selected) => selected.id === apple.id)) {
            return { ...apple, removed: true };
          }
          return apple;
        });

        // Create sparkles
        const newSparkles = selectedApples.map((apple) => ({
          x: apple.position.col * cellSize + gridPadding + cellSize / 2,
          y: apple.position.row * cellSize + gridPadding + cellSize / 2,
          id: `sparkle-${Date.now()}-${apple.id}`,
        }));

        setApples(newApples);
        setSparkles((prev) => [...prev, ...newSparkles]);
        setScore((prev) => prev + 1);
      }
    }

    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setCurrentSelection(null);
  };

  // Draw game on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = gridSize * cellSize + gridPadding * 2;
    canvas.height = gridSize * cellSize + gridPadding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e9ecef";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(gridPadding, i * cellSize + gridPadding);
      ctx.lineTo(gridSize * cellSize + gridPadding, i * cellSize + gridPadding);
      ctx.stroke();

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize + gridPadding, gridPadding);
      ctx.lineTo(i * cellSize + gridPadding, gridSize * cellSize + gridPadding);
      ctx.stroke();
    }

    // Draw selection
    if (currentSelection) {
      const { startRow, startCol, endRow, endCol } = currentSelection;
      const startX = startCol * cellSize + gridPadding;
      const startY = startRow * cellSize + gridPadding;
      const width = (endCol - startCol + 1) * cellSize;
      const height = (endRow - startRow + 1) * cellSize;

      ctx.fillStyle = "rgba(73, 165, 239, 0.2)";
      ctx.fillRect(startX, startY, width, height);

      ctx.strokeStyle = "rgba(73, 165, 239, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, width, height);
    }

    // Draw apples
    apples.forEach((apple) => {
      if (apple.removed) return;

      const x = apple.position.col * cellSize + gridPadding;
      const y = apple.position.row * cellSize + gridPadding;

      // Draw apple background
      ctx.fillStyle = "#FF2D55";
      ctx.beginPath();
      ctx.arc(
        x + cellSize / 2,
        y + cellSize / 2,
        cellSize / 2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw apple stem
      ctx.fillStyle = "#8E8E93";
      ctx.fillRect(x + cellSize / 2 - 2, y + cellSize / 2 - cellSize / 3, 4, 7);

      // Draw apple leaf
      ctx.fillStyle = "#34C759";
      ctx.beginPath();
      ctx.ellipse(
        x + cellSize / 2 + 5,
        y + cellSize / 2 - cellSize / 3 + 2,
        6,
        3,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw apple value
      ctx.fillStyle = "white";
      ctx.font = 'bold 24px "SF Pro Display", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        apple.value.toString(),
        x + cellSize / 2,
        y + cellSize / 2 + 2
      );
    });

    // Draw sparkles
    sparkles.forEach((sparkle) => {
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
      }, 1000);

      // Draw sparkle
      const size = 24;

      // Draw star shape
      ctx.fillStyle = "gold";
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 1;

      // Draw sparkle star
      const spikes = 5;
      const outerRadius = size / 2;
      const innerRadius = size / 4;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;

        if (i === 0) {
          ctx.moveTo(
            sparkle.x + radius * Math.cos(angle),
            sparkle.y + radius * Math.sin(angle)
          );
        } else {
          ctx.lineTo(
            sparkle.x + radius * Math.cos(angle),
            sparkle.y + radius * Math.sin(angle)
          );
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }, [apples, currentSelection, sparkles]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg shadow-lg bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Overlay for game start/end */}
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-xl text-center w-[80%] max-w-sm transform transition-all animate-scale-in">
              <h2 className="text-2xl font-bold mb-4 text-apple-red">
                {!gameStarted ? "사과 게임" : "게임 종료!"}
              </h2>

              {gameOver && (
                <div className="mb-6">
                  <p className="text-lg font-medium mb-2">점수는?</p>
                  <p className="text-4xl font-bold text-apple-red mb-4">
                    {calculateFinalScore(score, timeLeft)}
                  </p>
                  <p className="text-sm text-gray-600">
                    (맞춘 개수: {score} + 남은 시간: {Math.max(0, timeLeft)})
                  </p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                {!gameStarted ? (
                  <>
                    <p>사과들을 드래그해 10을 만들어 제거할 수 있어요.</p>
                    <p>{GAME_TIME}초 안에 모든 사과를 제거해보세요!</p>
                  </>
                ) : (
                  <>
                    <p>시간이 종료되었어요!</p>
                    <p>게임 결과는 랭킹에 반영될꺼에요!</p>
                  </>
                )}
              </p>

              <button
                onClick={!gameStarted ? startGame : resetGame}
                className="px-8 py-3 bg-apple-red text-white rounded-full font-medium transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-apple-red"
              >
                {!gameStarted ? "게임시작" : "다시하기"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game information */}
      {gameStarted && !gameOver && (
        <div className="w-[540px] flex justify-between items-center mb-6 px-4">
          <div className="flex items-center">
            <span className="ml-2 text-gray-600 font-medium">내 점수는</span>
            <span className="font-bold text-xl ml-2 text-apple-red">
              {score}
            </span>
            <span className="ml-2 text-gray-600 font-medium">점</span>
          </div>

          <div className="flex items-center">
            <div
              className={`text-apple-red ${
                timeLeft <= 10 ? "animate-pulse" : undefined
              }`}
            >
              <span className="font-bold text-xl">{timeLeft}</span>
            </div>
            <span className="ml-2 text-gray-600 font-medium">초 남았어요!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
