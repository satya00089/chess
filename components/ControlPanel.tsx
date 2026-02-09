'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EngineType } from '@/lib/types';

interface ControlPanelProps {
  engineType: EngineType;
  setEngineType: (type: EngineType) => void;
  depth: number;
  setDepth: (depth: number) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  isThinking: boolean;
  resetGame: () => void;
  gameOver: boolean;
  turn: 'w' | 'b';
}

export function ControlPanel({
  engineType,
  setEngineType,
  depth,
  setDepth,
  debugMode,
  setDebugMode,
  animationSpeed,
  setAnimationSpeed,
  isThinking,
  resetGame,
  gameOver,
  turn,
}: ControlPanelProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* Game Status */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-sm">Current Turn:</span>
            <span className="ml-2 text-white font-semibold">
              {turn === 'w' ? 'White (You)' : 'Black (AI)'}
            </span>
          </div>
          {gameOver && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
            >
              Game Over
            </motion.span>
          )}
        </div>
      </div>

      {/* Engine Selection */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          AI Engine
        </label>
        <select
          value={engineType}
          onChange={(e) => setEngineType(e.target.value as EngineType)}
          disabled={isThinking}
          className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="minimax">Minimax (Basic)</option>
          <option value="minimax-alpha-beta">Minimax + Alpha-Beta Pruning</option>
        </select>
      </div>

      {/* Depth Control */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Search Depth: {depth}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          disabled={isThinking}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Fast</span>
          <span>Deep</span>
        </div>
      </div>

      {/* Debug Mode */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-slate-400">Debug Mode</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
              disabled={isThinking}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </div>
        </label>
        {debugMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-slate-700"
          >
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Animation Speed: {animationSpeed}ms
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              disabled={isThinking}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={resetGame}
        disabled={isThinking}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reset Game
      </motion.button>
    </div>
  );
}
