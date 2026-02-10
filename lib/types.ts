import { Chess } from "chess.js";

export type EngineType = "minimax" | "minimax-alpha-beta";

export interface AnalyzedMove {
  move: string;
  score: number;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
}

export interface NodeAnalysis {
  move: AnalyzedMove;
  depth: number;
  nodeCount: number;
  position: string;
}

export interface EngineResult {
  bestMove: AnalyzedMove | null;
  analysis: AnalyzedMove[];
  nodesEvaluated: number;
  nodeHistory: NodeAnalysis[];
}

export interface EngineConfig {
  depth: number;
  debugMode: boolean;
  animationSpeed: number;
}

export interface ChessEngine {
  findBestMove(game: Chess, config: EngineConfig): Promise<EngineResult>;
  name: string;
  description: string;
}
