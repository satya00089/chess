'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeAnalysis } from '@/lib/types';

interface DebugVisualizationProps {
  nodeHistory: NodeAnalysis[];
  currentNodeIndex: number;
  setCurrentNodeIndex: (index: number) => void;
  isAnimating: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

export function DebugVisualization({
  nodeHistory,
  currentNodeIndex,
  setCurrentNodeIndex,
  isAnimating,
  isPaused,
  setIsPaused,
}: DebugVisualizationProps) {
  if (nodeHistory.length === 0) return null;

  const currentNode = nodeHistory[Math.min(currentNodeIndex, nodeHistory.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-slate-900 rounded-lg p-4 border border-purple-500/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-400">
          AI Thinking Visualization
        </h3>
        <div className="flex items-center space-x-2">
          {isAnimating && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium"
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </motion.button>
          )}
          <span className="text-sm text-slate-400">
            Node {currentNodeIndex + 1} / {nodeHistory.length}
          </span>
        </div>
      </div>

      {/* Current Node Info */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Move:</span>
            <span className="ml-2 text-white font-bold text-lg">
              {currentNode.move.move}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Depth:</span>
            <span className="ml-2 text-white font-semibold">
              {currentNode.depth}
            </span>
          </div>
          <div>
            <span className="text-slate-400">From:</span>
            <span className="ml-2 text-white font-semibold">
              {currentNode.move.from}
            </span>
          </div>
          <div>
            <span className="text-slate-400">To:</span>
            <span className="ml-2 text-white font-semibold">
              {currentNode.move.to}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Nodes Evaluated:</span>
            <span className="ml-2 text-white font-semibold">
              {currentNode.nodeCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max={nodeHistory.length - 1}
          value={currentNodeIndex}
          onChange={(e) => setCurrentNodeIndex(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Animation Status */}
      <AnimatePresence>
        {isAnimating && !isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center justify-center space-x-2 text-sm text-purple-400"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-2 h-2 bg-purple-400 rounded-full"
            />
            <span>Analyzing moves...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Depth Distribution */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Depth Distribution</h4>
        <div className="flex space-x-1 h-12 items-end">
          {Array.from({ length: 10 }, (_, depth) => {
            const nodesAtDepth = nodeHistory.filter((n) => n.depth === depth).length;
            const maxNodes = Math.max(
              ...Array.from({ length: 10 }, (_, d) =>
                nodeHistory.filter((n) => n.depth === d).length
              )
            );
            const height = maxNodes > 0 ? (nodesAtDepth / maxNodes) * 100 : 0;

            return (
              <motion.div
                key={depth}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                className={`flex-1 rounded-t ${
                  currentNode.depth === depth ? 'bg-purple-500' : 'bg-slate-700'
                }`}
                title={`Depth ${depth}: ${nodesAtDepth} nodes`}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
