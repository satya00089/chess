'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineType, EngineResult, AnalyzedMove, NodeAnalysis } from '@/lib/types';
import { getEngine } from '@/lib/engines';
import { AnalysisPanel } from './AnalysisPanel';
import { ControlPanel } from './ControlPanel';
import { DebugVisualization } from './DebugVisualization';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [engineType, setEngineType] = useState<EngineType>('minimax');
  const [depth, setDepth] = useState(3);
  const [isThinking, setIsThinking] = useState(false);
  const [engineResult, setEngineResult] = useState<EngineResult | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const makeAIMove = useCallback(async () => {
    if (isThinking) return;

    setIsThinking(true);
    setEngineResult(null);
    setCurrentNodeIndex(0);
    setIsAnimating(true);

    const engine = getEngine(engineType);
    const gameCopy = new Chess(game.fen());

    const result = await engine.findBestMove(gameCopy, {
      depth,
      debugMode,
      animationSpeed: debugMode ? animationSpeed : 0,
    });

    setEngineResult(result);

    if (result.bestMove) {
      const newGame = new Chess(game.fen());
      newGame.move({
        from: result.bestMove.from,
        to: result.bestMove.to,
        promotion: result.bestMove.promotion as any,
      });
      setGame(newGame);
    }

    setIsThinking(false);
    setIsAnimating(false);
  }, [game, engineType, depth, isThinking, debugMode, animationSpeed]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? 'q',
      });

      if (move === null) return false;

      setGame(gameCopy);
      
      // AI makes a move after player's move
      setTimeout(() => {
        makeAIMove();
      }, 300);

      return true;
    } catch (error) {
      return false;
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setEngineResult(null);
    setCurrentNodeIndex(0);
    setIsAnimating(false);
    setIsPaused(false);
  };

  const getCurrentPosition = (): string => {
    if (debugMode && engineResult && engineResult.nodeHistory.length > 0 && isAnimating) {
      const clampedIndex = Math.min(currentNodeIndex, engineResult.nodeHistory.length - 1);
      return engineResult.nodeHistory[clampedIndex]?.position || game.fen();
    }
    return game.fen();
  };

  useEffect(() => {
    if (debugMode && isAnimating && engineResult && !isPaused) {
      if (currentNodeIndex < engineResult.nodeHistory.length - 1) {
        const timer = setTimeout(() => {
          setCurrentNodeIndex((prev) => prev + 1);
        }, animationSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsAnimating(false);
      }
    }
  }, [currentNodeIndex, debugMode, isAnimating, engineResult, animationSpeed, isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-[1800px] mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        >
          Chess AI Analyzer
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Chess Board */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 border border-slate-700">
              <div className="max-w-[600px] mx-auto">
                <Chessboard
                  position={getCurrentPosition()}
                  onPieceDrop={onPieceDrop}
                  boardWidth={600}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
                  customLightSquareStyle={{ backgroundColor: '#cbd5e0' }}
                />
              </div>

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
                gameOver={game.isGameOver()}
                turn={game.turn()}
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
            </div>
          </motion.div>

          {/* Right Side - Analysis Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
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
