import { Chess, Move } from 'chess.js';
import { ChessEngine, EngineResult, AnalyzedMove, NodeAnalysis, EngineConfig } from '../types';
import { evaluateBoard } from '../evaluation';

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MinimaxEngine implements ChessEngine {
  name = 'Minimax';
  description = 'Basic minimax algorithm without optimizations';

  async findBestMove(game: Chess, config: EngineConfig): Promise<EngineResult> {
    const analysis: AnalyzedMove[] = [];
    const nodeHistory: NodeAnalysis[] = [];
    let nodesEvaluated = 0;

    const minimax = async (depth: number, game: Chess): Promise<number> => {
      nodesEvaluated++;

      if (depth === 0) {
        return evaluateBoard(game); // returns value positive for White
      }

      const moves = game.moves({ verbose: true });

      if (moves.length === 0) {
        if (game.isCheckmate()) {
          // If side to move is checkmated, that's bad for that side.
          // Return -Infinity if White is to move (White lost), +Infinity if Black is to move (Black lost)
          return game.turn() === 'w' ? -Infinity : Infinity;
        }
        return 0;
      }

      // helper to apply a move, optionally record debug info, recurse, and undo
      const evalAfterMove = async (move: Move, nextDepth: number) => {
        game.move(move);
        if (config.debugMode) {
          nodeHistory.push({
            move: this.convertToAnalyzedMove(move, 0),
            depth: config.depth - nextDepth - 1,
            nodeCount: nodesEvaluated,
            position: game.fen(),
          });
          await delay(config.animationSpeed);
        }
        const v = await minimax(nextDepth, game);
        game.undo();
        return v;
      };

      const isWhiteToMove = game.turn() === 'w';

      if (isWhiteToMove) {
        let maxEval = -Infinity;
        for (const move of moves) {
          const eval_ = await evalAfterMove(move, depth - 1);
          maxEval = Math.max(maxEval, eval_);
        }
        return maxEval;
      }

      let minEval = Infinity;
      for (const move of moves) {
        const eval_ = await evalAfterMove(move, depth - 1);
        minEval = Math.min(minEval, eval_);
      }
      return minEval;
    };

    const moves = game.moves({ verbose: true });
    let bestMove: AnalyzedMove | null = null;
    let bestValue = -Infinity;

    const engineIsWhite = game.turn() === 'w';

    for (const move of moves) {
      game.move(move);
      const value = await minimax(config.depth - 1, game); // value is White-perspective
      game.undo();

      const analyzedMove = this.convertToAnalyzedMove(move, value);
      analysis.push(analyzedMove);

      if (engineIsWhite) {
        if (value > bestValue) {
          bestValue = value;
          bestMove = analyzedMove;
        }
      } else if (value < bestValue) {
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
