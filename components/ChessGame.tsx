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

export default function ChessGame() {
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
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 relative">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Chess Board */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6"
          >
            <div className="bg-slate-800 rounded-lg shadow-2xl p-3 border border-slate-700">
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
              <div className="max-w-150 mx-auto" style={{ width: "calc(100vh - 130px)", height: "calc(100vh - 130px)" }}>
                <Chessboard options={boardOptions} />
              </div>
            </div>
          </motion.div>

          {/* Right Side - Analysis Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6"
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
