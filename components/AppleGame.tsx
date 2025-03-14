import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

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

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
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
  const cellSize = 60;
  const gridPadding = 20;

  // Initialize game
  useEffect(() => {
    generateGrid();
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Check if all apples are removed
  useEffect(() => {
    if (apples.length === 0 || apples.some((apple) => !apple.removed)) return;

    // All apples are removed
    toast.success("Congratulations! All apples removed!", {
      position: "top-center",
    });

    setTimeout(() => {
      generateGrid();
    }, 1500);
  }, [apples]);

  const generateGrid = () => {
    const newApples: AppleItem[] = [];
    const usedValues = new Set<string>();

    // Ensure all apples can form combinations that sum to 10
    // First, create pairs that sum to 10
    const pairs: number[][] = [];
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 9; j++) {
        if (i + j === 10) {
          pairs.push([i, j]);
        }
      }
    }

    // For grid cells that don't fit in pairs, add triples or quads that sum to 10
    const triples: number[][] = [];
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 9; j++) {
        for (let k = 1; k <= 9; k++) {
          if (i + j + k === 10 && i !== j && j !== k && i !== k) {
            triples.push([i, j, k]);
          }
        }
      }
    }

    const quads: number[][] = [];
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 9; j++) {
        for (let k = 1; k <= 9; k++) {
          for (let l = 1; l <= 9; l++) {
            if (
              i + j + k + l === 10 &&
              i !== j &&
              j !== k &&
              k !== l &&
              i !== k &&
              i !== l &&
              j !== l
            ) {
              quads.push([i, j, k, l]);
            }
          }
        }
      }
    }

    // Shuffle all arrays
    const shuffle = <T,>(array: T[]): T[] => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const shuffledPairs = shuffle([...pairs]);
    const shuffledTriples = shuffle([...triples]);
    const shuffledQuads = shuffle([...quads]);

    // Fill grid with values
    let row = 0;
    let col = 0;
    let pairIndex = 0;
    let tripleIndex = 0;
    let quadIndex = 0;

    while (row < gridSize) {
      // Try to place a pair
      if (col <= gridSize - 2 && pairIndex < shuffledPairs.length) {
        const pair = shuffledPairs[pairIndex++];
        newApples.push({
          id: `apple-${row}-${col}`,
          value: pair[0],
          position: { row, col },
          removed: false,
        });
        newApples.push({
          id: `apple-${row}-${col + 1}`,
          value: pair[1],
          position: { row, col: col + 1 },
          removed: false,
        });
        usedValues.add(`${row}-${col}`);
        usedValues.add(`${row}-${col + 1}`);
        col += 2;
      }
      // Try to place a triple
      else if (col <= gridSize - 3 && tripleIndex < shuffledTriples.length) {
        const triple = shuffledTriples[tripleIndex++];
        newApples.push({
          id: `apple-${row}-${col}`,
          value: triple[0],
          position: { row, col },
          removed: false,
        });
        newApples.push({
          id: `apple-${row}-${col + 1}`,
          value: triple[1],
          position: { row, col: col + 1 },
          removed: false,
        });
        newApples.push({
          id: `apple-${row}-${col + 2}`,
          value: triple[2],
          position: { row, col: col + 2 },
          removed: false,
        });
        usedValues.add(`${row}-${col}`);
        usedValues.add(`${row}-${col + 1}`);
        usedValues.add(`${row}-${col + 2}`);
        col += 3;
      }
      // Try to place a quad
      else if (col <= gridSize - 4 && quadIndex < shuffledQuads.length) {
        const quad = shuffledQuads[quadIndex++];
        newApples.push({
          id: `apple-${row}-${col}`,
          value: quad[0],
          position: { row, col },
          removed: false,
        });
        newApples.push({
          id: `apple-${row}-${col + 1}`,
          value: quad[1],
          position: { row, col: col + 1 },
          removed: false,
        });
        newApples.push({
          id: `apple-${row}-${col + 2}`,
          value: quad[2],
          position: { row, col: col + 2 },
          removed: false,
        });
        newApples.push({
          id: `apple-${row}-${col + 3}`,
          value: quad[3],
          position: { row, col: col + 3 },
          removed: false,
        });
        usedValues.add(`${row}-${col}`);
        usedValues.add(`${row}-${col + 1}`);
        usedValues.add(`${row}-${col + 2}`);
        usedValues.add(`${row}-${col + 3}`);
        col += 4;
      }
      // Move to next row if needed
      else {
        row++;
        col = 0;
      }
    }

    // Fill any remaining cells (shouldn't happen with our logic, but just in case)
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!usedValues.has(`${r}-${c}`)) {
          const randomValue = Math.floor(Math.random() * 9) + 1;
          newApples.push({
            id: `apple-${r}-${c}`,
            value: randomValue,
            position: { row: r, col: c },
            removed: false,
          });
        }
      }
    }

    setApples(newApples);
    setTimeLeft(30);
    setScore(0);
    setGameOver(false);
  };

  const startGame = () => {
    setGameStarted(true);
    toast.success("Game started! Find combinations that sum to 10.", {
      position: "top-center",
    });
  };

  const endGame = () => {
    setGameOver(true);
    toast.error("Time's up!", {
      position: "top-center",
    });
  };

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

        toast.success("Perfect 10!", {
          position: "top-center",
        });
      } else {
        // Show error message if sum is not 10
        toast.error(`Sum is ${sum}, not 10. Try again!`, {
          position: "top-center",
        });
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
                {!gameStarted ? "Apple Sum Game" : "Game Over!"}
              </h2>

              {gameOver && (
                <div className="mb-6">
                  <p className="text-lg font-medium mb-2">Your Score</p>
                  <p className="text-4xl font-bold text-apple-red mb-4">
                    {score}
                  </p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                {!gameStarted
                  ? "Drag to select apples that sum to 10. You have 30 seconds!"
                  : "Time's up! Want to play again?"}
              </p>

              <button
                onClick={!gameStarted ? startGame : resetGame}
                className="px-8 py-3 bg-apple-red text-white rounded-full font-medium transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-apple-red"
              >
                {!gameStarted ? "Start Game" : "Play Again"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game information */}
      {gameStarted && !gameOver && (
        <div className="flex justify-between items-center w-full mb-6 px-4 py-3 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-apple-red rounded-full flex items-center justify-center text-white">
              <span className="font-bold text-xl">{score}</span>
            </div>
            <span className="ml-2 text-gray-600 font-medium">Score</span>
          </div>

          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                timeLeft <= 10 ? "bg-red-500 animate-pulse" : "bg-apple-gray"
              }`}
            >
              <span className="font-bold text-xl">{timeLeft}</span>
            </div>
            <span className="ml-2 text-gray-600 font-medium">Seconds</span>
          </div>
        </div>
      )}

      {/* Game instructions */}
      <div className="mt-4 text-center text-gray-600 mx-6">
        <p className="text-sm">
          Drag to create rectangles of apples that sum to exactly 10. Clear all
          apples to win!
        </p>
      </div>
    </div>
  );
};

export default GameCanvas;
