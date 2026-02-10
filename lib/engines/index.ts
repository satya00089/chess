import { ChessEngine, EngineType } from "../types";
import { MinimaxEngine } from "./minimax";
import { MinimaxAlphaBetaEngine } from "./minimax-alpha-beta";

export const engines: Record<EngineType, ChessEngine> = {
  minimax: new MinimaxEngine(),
  "minimax-alpha-beta": new MinimaxAlphaBetaEngine(),
};

export function getEngine(type: EngineType): ChessEngine {
  return engines[type];
}
