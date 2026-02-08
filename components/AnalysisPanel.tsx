'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EngineResult } from '@/lib/types';

interface AnalysisPanelProps {
  engineResult: EngineResult | null;
  isThinking: boolean;
  engineType: string;
}

export function AnalysisPanel({ engineResult, isThinking, engineType }: AnalysisPanelProps) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-2xl p-6 border border-slate-700 h-full">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Move Analysis</h2>

      {isThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-slate-400">Analyzing positions...</p>
          </div>
        </motion.div>
      )}

      {engineResult && !isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Engine Stats */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Engine:</span>
                <span className="text-white font-medium">{engineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nodes Evaluated:</span>
                <span className="text-white font-medium">
                  {engineResult.nodesEvaluated.toLocaleString()}
                </span>
              </div>
              {engineResult.bestMove && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Best Move:</span>
                  <span className="text-green-400 font-bold text-lg">
                    {engineResult.bestMove.move}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Top Moves */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-400">
              Top Moves (Ranked)
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {engineResult.analysis.map((move, index) => (
                <motion.div
                  key={`${move.from}-${move.to}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-3 rounded-lg border ${
                    index === 0
                      ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                  } transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500 font-medium text-sm w-6">
                        #{index + 1}
                      </span>
                      <span className="text-white font-bold text-lg">
                        {move.move}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-semibold ${
                          move.score > 0
                            ? 'text-green-400'
                            : move.score < 0
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {move.score > 0 ? '+' : ''}
                        {move.score.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {move.from} → {move.to}
                      </span>
                    </div>
                  </div>
                  {move.captured && (
                    <div className="mt-1 text-xs text-orange-400">
                      Captures {move.captured}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!engineResult && !isThinking && (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <p className="text-center">
            Make a move to see AI analysis
          </p>
        </div>
      )}
    </div>
  );
}
