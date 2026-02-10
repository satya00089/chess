"use client";

import React, { useState } from "react";
import { EngineType } from "@/lib/types";
import { GiChessKing } from "react-icons/gi";
import { MdRestartAlt } from "react-icons/md";
import { BsBugFill } from "react-icons/bs";
import { IoSpeedometer } from "react-icons/io5";
import { motion } from "framer-motion";
import { SiLichess } from "react-icons/si";

interface TooltipProps {
  readonly text: string;
  readonly children: React.ReactNode;
}

function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-950 text-white text-xs rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none animate-in fade-in duration-200"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-slate-950" />
          </div>
        </div>
      )}
    </span>
  );
}

interface ControlPanelProps {
  readonly engineType: EngineType;
  readonly setEngineType: (type: EngineType) => void;
  readonly depth: number;
  readonly setDepth: (depth: number) => void;
  readonly debugMode: boolean;
  readonly setDebugMode: (debug: boolean) => void;
  readonly animationSpeed: number;
  readonly setAnimationSpeed: (speed: number) => void;
  readonly isThinking: boolean;
  readonly resetGame: () => void;
  readonly gameOver: boolean;
  readonly turn: "w" | "b";
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
    <div className="mb-2">
      <div className="bg-slate-900/80 backdrop-blur rounded-xl shadow-xl border border-slate-700/50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-center text-white flex items-center justify-center"
          >
            <SiLichess className="w-8 h-8 text-white" />
            hess AI
          </motion.h1>
          {/* Game Status & Reset Group */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-600/40">
              <GiChessKing className="text-amber-400" size={16} />
              <span className="text-xs text-slate-300">
                {turn === "w" ? "White to move" : "Black to move"}
              </span>
              {gameOver && (
                <span className="ml-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                  Game Over
                </span>
              )}
            </div>

            <Tooltip text="Reset Game">
              <button
                onClick={resetGame}
                disabled={isThinking}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                <MdRestartAlt size={18} />
              </button>
            </Tooltip>
          </div>

          <div className="h-8 w-px bg-slate-600/50" />

          {/* Engine Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Engine:</span>
            <Tooltip text="Choose AI search algorithm">
              <select
                value={engineType}
                onChange={(e) => setEngineType(e.target.value as EngineType)}
                disabled={isThinking}
                className="text-xs bg-slate-800 text-slate-200 border border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 disabled:opacity-50 transition-all"
              >
                <option value="minimax">Minimax</option>
                <option value="minimax-alpha-beta">Alpha-Beta</option>
              </select>
            </Tooltip>
          </div>

          <div className="h-8 w-px bg-slate-600/50" />

          {/* Depth Input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Depth:</span>
            <Tooltip text="Search depth (1-8 moves ahead)">
              <input
                type="number"
                value={depth}
                min={1}
                max={8}
                onChange={(e) => setDepth(Number.parseInt(e.target.value) || 1)}
                disabled={isThinking}
                className="w-14 px-2 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 disabled:opacity-50 transition-all"
              />
            </Tooltip>
          </div>

          {/* Animation Speed Input (shown when debug mode is on) */}
          {debugMode && (
            <div className="flex items-center gap-2">
              <IoSpeedometer className="text-purple-400" size={14} />
              <Tooltip text="Debug animation delay (milliseconds)">
                <input
                  type="number"
                  value={animationSpeed}
                  min={10}
                  max={1000}
                  step={10}
                  onChange={(e) =>
                    setAnimationSpeed(Number.parseInt(e.target.value) || 10)
                  }
                  disabled={isThinking}
                  className="w-16 px-2 py-1.5 text-xs bg-slate-800 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 transition-all"
                />
              </Tooltip>
              <span className="text-xs text-slate-400">ms</span>
            </div>
          )}

          <div className="h-8 w-px bg-slate-600/50" />

          {/* Debug Toggle */}
          <div className="flex items-center gap-2">
            <Tooltip text="Toggle debug visualization">
              <button
                onClick={() => setDebugMode(!debugMode)}
                disabled={isThinking}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                  debugMode
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30"
                    : "border-slate-600 bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-purple-400 hover:border-purple-500/50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <BsBugFill size={16} />
              </button>
            </Tooltip>
          </div>

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs text-blue-300 font-medium">
                AI Thinking...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
