"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { motion } from "framer-motion";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { EngineType, EngineResult } from "@/lib/types";
import { getEngine } from "@/lib/engines";
import { AnalysisPanel } from "./AnalysisPanel";
import { ControlPanel } from "./ControlPanel";
import { DebugVisualization } from "./DebugVisualization";
import { SiLichess } from "react-icons/si";

export default function ChessGame() {
  const pieceSymbols: Record<string, string> = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚", // black pieces
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔", // white pieces
  };

  const pieceValues: Record<string, number> = {
    p: 1,
    P: 1,
    n: 3,
    N: 3,
    b: 3,
    B: 3,
    r: 5,
    R: 5,
    q: 9,
    Q: 9,
    k: 0,
    K: 0,
  };

  const sortCaptured = (captured: string[]) => {
    return [...captured].sort((a, b) => pieceValues[b] - pieceValues[a]);
  };

  const getMaterialAdvantage = () => {
    const aiTotal = aiCaptured.reduce(
      (sum, piece) => sum + pieceValues[piece],
      0,
    );
    const userTotal = userCaptured.reduce(
      (sum, piece) => sum + pieceValues[piece],
      0,
    );
    return { aiTotal, userTotal };
  };
  // Use ref for Chess instance to avoid stale closures. Lazily initialize the ref
  const gameRef = useRef<Chess | null>(null);

  // Helper to get the Chess instance; lazily creates it when needed.
  function getGame() {
    gameRef.current ??= new Chess();
    return gameRef.current;
  }

  // Store only the position string in state to trigger re-renders
  const [gamePosition, setGamePosition] = useState(() => new Chess().fen());
  const [engineType, setEngineType] = useState<EngineType>("minimax");
  const [depth, setDepth] = useState(3);
  const [isThinking, setIsThinking] = useState(false);
  const [engineResult, setEngineResult] = useState<EngineResult | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );
  const [userCaptured, setUserCaptured] = useState<string[]>([]);
  const [aiCaptured, setAiCaptured] = useState<string[]>([]);

  useEffect(() => {
    // Ensure the ref is initialized on mount and log initial state
    const game = getGame();
    console.log("♟️ ChessGame component mounted");
    console.log("📦 Initial game position:", game.fen());
  }, []);

  const makeAIMove = useCallback(async () => {
    if (isThinking) return;

    setIsThinking(true);
    setEngineResult(null);
    setCurrentNodeIndex(0);
    setIsAnimating(true);

    const engine = getEngine(engineType);
    const game = getGame();
    const gameCopy = new Chess(game.fen());

    const result = await engine.findBestMove(gameCopy, {
      depth,
      debugMode,
      animationSpeed: debugMode ? animationSpeed : 0,
    });

    setEngineResult(result);

    if (result.bestMove) {
      game.move({
        from: result.bestMove.from,
        to: result.bestMove.to,
        promotion: result.bestMove.promotion,
      });
      setGamePosition(game.fen());
      setLastMove(result.bestMove);

      // Check if AI captured a piece
      const move = game.history({ verbose: true }).pop();
      if (move?.captured) {
        setAiCaptured((prev) => [...prev, move.captured]);
      }
    }

    setIsThinking(false);
    setIsAnimating(false);
  }, [engineType, depth, isThinking, debugMode, animationSpeed]);

  const onPieceDrop = (dropInfo: PieceDropHandlerArgs) => {
    console.log("🎯 onPieceDrop called - dropInfo:", dropInfo);

    try {
      const { sourceSquare, targetSquare } = dropInfo;

      // If dropped off-board, react-chessboard may provide null target
      if (!targetSquare) {
        console.log("➡️ Dropped off-board, cancelling move");
        return false;
      }

      const game = getGame();
      console.log("📍 Current position before move:", game.fen());
      console.log("🎮 Game turn:", game.turn());

      console.log("🎯 Extracted squares:", { sourceSquare, targetSquare });

      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to queen for simplicity
      });

      if (move === null) {
        console.log("❌ Move returned null - invalid move");
        return false;
      }

      console.log("✅ Move successful:", move);
      console.log("📍 New position after move:", game.fen());

      setGamePosition(game.fen());
      setLastMove({ from: sourceSquare, to: targetSquare });

      if (move.captured) {
        setUserCaptured((prev) => [...prev, move.captured]);
      }

      // AI makes a move after player's move
      setTimeout(() => {
        console.log("🤖 Triggering AI move...");
        makeAIMove();
      }, 300);

      return true;
    } catch (error) {
      console.error("💥 Error in onPieceDrop:", error);
      return false;
    }
  };

  const resetGame = () => {
    const game = getGame();
    game.reset();
    setGamePosition(game.fen());
    setCurrentNodeIndex(0);
    setIsAnimating(false);
    setIsPaused(false);
    setLastMove(null);
    setUserCaptured([]);
    setAiCaptured([]);
  };

  const getCurrentPosition = (): string => {
    if (
      debugMode &&
      engineResult &&
      engineResult.nodeHistory.length > 0 &&
      isAnimating
    ) {
      const clampedIndex = Math.min(
        currentNodeIndex,
        engineResult.nodeHistory.length - 1,
      );
      return engineResult.nodeHistory[clampedIndex]?.position || gamePosition;
    }
    return gamePosition;
  };

  // Build board options as `any` so we can include runtime-only toggles
  const boardOptions = {
    position: getCurrentPosition(),
    onPieceDrop,
    // toggle dragging at runtime (react-chessboard type may not include this key)
    arePiecesDraggable: !isThinking && !isAnimating,
    customBoardStyle: {
      borderRadius: "8px",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
    },
    customDarkSquareStyle: { backgroundColor: "#4a5568" },
    customLightSquareStyle: { backgroundColor: "#cbd5e0" },
    squareStyles: lastMove
      ? {
          [lastMove.from]: { backgroundColor: "rgba(255, 235, 59, 0.3)" },
          [lastMove.to]: { backgroundColor: "rgba(255, 235, 59, 0.3)" },
        }
      : {},
  };

  useEffect(() => {
    if (debugMode && isAnimating && engineResult && !isPaused) {
      if (currentNodeIndex < engineResult.nodeHistory.length - 1) {
        const timer = setTimeout(() => {
          setCurrentNodeIndex((prev) => prev + 1);
        }, animationSpeed);
        return () => clearTimeout(timer);
      } else {
        // Avoid calling setState synchronously inside the effect
        // Schedule it asynchronously to prevent cascading renders
        const finishTimer = setTimeout(() => setIsAnimating(false), 0);
        return () => clearTimeout(finishTimer);
      }
    }
  }, [
    currentNodeIndex,
    debugMode,
    isAnimating,
    engineResult,
    animationSpeed,
    isPaused,
  ]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-2 md:p-4 lg:p-6 relative">
      <div className="max-w-450 mx-auto">
        <motion.a
          href="https://github.com/satya00089/chess"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute right-4 top-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-full py-2 px-2 backdrop-blur"
          aria-label="Open repository on GitHub"
        >
          <PiGithubLogoDuotone className="w-7 h-7 text-white" />
        </motion.a>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Left Side - Chess Board */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-12 lg:col-span-6"
          >
            <div className="bg-slate-800 rounded-lg shadow-2xl p-2 md:p-3 lg:p-4 border border-slate-700">
              {/* Control Panel */}
              <ControlPanel
                engineType={engineType}
                setEngineType={setEngineType}
                depth={depth}
                setDepth={setDepth}
                debugMode={debugMode}
                setDebugMode={setDebugMode}
                animationSpeed={animationSpeed}
                setAnimationSpeed={setAnimationSpeed}
                isThinking={isThinking}
                resetGame={resetGame}
                gameOver={new Chess(getCurrentPosition()).isGameOver()}
                turn={new Chess(getCurrentPosition()).turn()}
              />

              {/* Debug Visualization */}
              {debugMode && engineResult && (
                <DebugVisualization
                  nodeHistory={engineResult.nodeHistory}
                  currentNodeIndex={currentNodeIndex}
                  setCurrentNodeIndex={setCurrentNodeIndex}
                  isAnimating={isAnimating}
                  isPaused={isPaused}
                  setIsPaused={setIsPaused}
                />
              )}
              <div className="max-w-150 mx-auto w-full aspect-square">
                {/* Captured Pieces - AI (White pieces) */}
                <div className="mb-2 text-left gap-1">
                  <div className="flex items-center">
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl font-bold text-center text-white flex items-center justify-center"
                    >
                      <SiLichess className="w-8 h-8 text-white" />
                      hess AI
                    </motion.h1>
                    <div className="flex flex-wrap">
                      {sortCaptured(aiCaptured).map((piece, index) => (
                        <span key={index} className="text-white text-lg">
                          {pieceSymbols[piece] || piece.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {(() => {
                      const { aiTotal, userTotal } = getMaterialAdvantage();
                      return aiTotal > userTotal ? (
                        <span className="text-sm">+{aiTotal - userTotal}</span>
                      ) : null;
                    })()}
                  </div>
                </div>
                <Chessboard options={boardOptions} />
                {/* Captured Pieces - Player (Black pieces) */}
                <div className="mt-2 text-left">
                  <div className="flex items-center">
                    <div className="flex flex-wrap">
                      {sortCaptured(userCaptured).map((piece, index) => (
                        <span key={index} className="text-white text-lg">
                          {pieceSymbols[piece] || piece.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {(() => {
                      const { aiTotal, userTotal } = getMaterialAdvantage();
                      return userTotal > aiTotal ? (
                        <span className="text-sm">+{userTotal - aiTotal}</span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Analysis Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-12 lg:col-span-6"
          >
            <AnalysisPanel
              engineResult={engineResult}
              isThinking={isThinking}
              engineType={engineType}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
