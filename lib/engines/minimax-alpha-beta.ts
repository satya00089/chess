import { Chess, Move } from "chess.js";
import {
  ChessEngine,
  EngineResult,
  AnalyzedMove,
  NodeAnalysis,
  EngineConfig,
} from "../types";
import { evaluateBoard } from "../evaluation";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MinimaxAlphaBetaEngine implements ChessEngine {
  name = "Minimax with Alpha-Beta Pruning";
  description =
    "Optimized minimax using alpha-beta pruning to reduce nodes evaluated";

  async findBestMove(game: Chess, config: EngineConfig): Promise<EngineResult> {
    const analysis: AnalyzedMove[] = [];
    const nodeHistory: NodeAnalysis[] = [];
    let nodesEvaluated = 0;

    const minimax = async (
      depth: number,
      alpha: number,
      beta: number,
      isMaximizing: boolean,
      game: Chess,
    ): Promise<number> => {
      nodesEvaluated++;

      if (depth === 0) {
        return evaluateBoard(game);
      }

      const moves = game.moves({ verbose: true });

      if (moves.length === 0) {
        if (game.isCheckmate()) {
          return isMaximizing ? -Infinity : Infinity;
        }
        return 0;
      }

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
          game.move(move);

          if (config.debugMode) {
            nodeHistory.push({
              move: this.convertToAnalyzedMove(move, 0),
              depth: config.depth - depth,
              nodeCount: nodesEvaluated,
              position: game.fen(),
            });
            await delay(config.animationSpeed);
          }

          const eval_ = await minimax(depth - 1, alpha, beta, false, game);
          game.undo();
          maxEval = Math.max(maxEval, eval_);
          alpha = Math.max(alpha, eval_);

          if (beta <= alpha) {
            break; // Beta cutoff
          }
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const move of moves) {
          game.move(move);

          if (config.debugMode) {
            nodeHistory.push({
              move: this.convertToAnalyzedMove(move, 0),
              depth: config.depth - depth,
              nodeCount: nodesEvaluated,
              position: game.fen(),
            });
            await delay(config.animationSpeed);
          }

          const eval_ = await minimax(depth - 1, alpha, beta, true, game);
          game.undo();
          minEval = Math.min(minEval, eval_);
          beta = Math.min(beta, eval_);

          if (beta <= alpha) {
            break; // Alpha cutoff
          }
        }
        return minEval;
      }
    };

    const moves = game.moves({ verbose: true });
    let bestMove: AnalyzedMove | null = null;
    let bestValue = -Infinity;

    for (const move of moves) {
      game.move(move);
      const value = await minimax(
        config.depth - 1,
        -Infinity,
        Infinity,
        false,
        game,
      );
      game.undo();

      const analyzedMove = this.convertToAnalyzedMove(move, value);
      analysis.push(analyzedMove);

      if (value > bestValue) {
        bestValue = value;
        bestMove = analyzedMove;
      }
    }

    // Sort analysis by score (best first)
    analysis.sort((a, b) => b.score - a.score);

    return {
      bestMove,
      analysis: analysis.slice(0, 50), // Top 50 moves
      nodesEvaluated,
      nodeHistory,
    };
  }

  private convertToAnalyzedMove(move: Move, score: number): AnalyzedMove {
    return {
      move: move.san,
      score,
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured,
      promotion: move.promotion,
    };
  }
}
