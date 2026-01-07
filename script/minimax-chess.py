"""
Chess Engine with Minimax Algorithm and Alpha-Beta Pruning
===========================================================
This implementation demonstrates how minimax works in chess, including:
- Minimax algorithm with alpha-beta pruning
- Position evaluation heuristic
- Move ordering for better pruning efficiency
- Iterative deepening
- SVG rendering for beautiful board visualization
"""

import chess
import chess.svg
import time
import webbrowser
import tempfile
import os
from typing import Tuple, Optional


class ChessEngine:
    """A chess engine using minimax with alpha-beta pruning."""

    # Piece values for material evaluation
    PIECE_VALUES = {
        chess.PAWN: 100,
        chess.KNIGHT: 320,
        chess.BISHOP: 330,
        chess.ROOK: 500,
        chess.QUEEN: 900,
        chess.KING: 20000,
    }

    # Piece-square tables for positional evaluation (simplified)
    # Bonuses for pawns in center and advanced positions
    PAWN_TABLE = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        10,
        10,
        20,
        30,
        30,
        20,
        10,
        10,
        5,
        5,
        10,
        25,
        25,
        10,
        5,
        5,
        0,
        0,
        0,
        20,
        20,
        0,
        0,
        0,
        5,
        -5,
        -10,
        0,
        0,
        -10,
        -5,
        5,
        5,
        10,
        10,
        -20,
        -20,
        10,
        10,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
    ]

    # Bonuses for knights in center
    KNIGHT_TABLE = [
        -50,
        -40,
        -30,
        -30,
        -30,
        -30,
        -40,
        -50,
        -40,
        -20,
        0,
        0,
        0,
        0,
        -20,
        -40,
        -30,
        0,
        10,
        15,
        15,
        10,
        0,
        -30,
        -30,
        5,
        15,
        20,
        20,
        15,
        5,
        -30,
        -30,
        0,
        15,
        20,
        20,
        15,
        0,
        -30,
        -30,
        5,
        10,
        15,
        15,
        10,
        5,
        -30,
        -40,
        -20,
        0,
        5,
        5,
        0,
        -20,
        -40,
        -50,
        -40,
        -30,
        -30,
        -30,
        -30,
        -40,
        -50,
    ]

    def __init__(self):
        self.nodes_searched = 0
        self.best_move = None

    def evaluate_position(self, board: chess.Board) -> float:
        """
        Evaluate the current position.
        Positive = good for White, Negative = good for Black

        Evaluation includes:
        - Material count
        - Piece positioning
        - King safety considerations
        """
        if board.is_checkmate():
            return -20000 if board.turn else 20000

        if board.is_stalemate() or board.is_insufficient_material():
            return 0

        score = 0

        # Material and positional evaluation
        for square in chess.SQUARES:
            piece = board.piece_at(square)
            if piece is None:
                continue

            value = self.PIECE_VALUES[piece.piece_type]

            # Add positional bonus
            if piece.piece_type == chess.PAWN:
                position_bonus = (
                    self.PAWN_TABLE[square]
                    if piece.color == chess.WHITE
                    else self.PAWN_TABLE[chess.square_mirror(square)]
                )
                value += position_bonus
            elif piece.piece_type == chess.KNIGHT:
                position_bonus = (
                    self.KNIGHT_TABLE[square]
                    if piece.color == chess.WHITE
                    else self.KNIGHT_TABLE[chess.square_mirror(square)]
                )
                value += position_bonus

            # Add or subtract based on piece color
            if piece.color == chess.WHITE:
                score += value
            else:
                score -= value

        # Mobility bonus (number of legal moves)
        mobility = len(list(board.legal_moves))
        score += mobility * 10 if board.turn == chess.WHITE else -mobility * 10

        return score

    def order_moves(self, board: chess.Board) -> list:
        """
        Order moves to improve alpha-beta pruning efficiency.
        Try captures, checks, and threats first.
        Better move ordering = more cutoffs = faster search!
        """
        moves = list(board.legal_moves)

        def move_priority(move):
            priority = 0

            # Prioritize captures (MVV-LVA: Most Valuable Victim - Least Valuable Attacker)
            if board.is_capture(move):
                captured_piece = board.piece_at(move.to_square)
                if captured_piece:
                    priority += 10 * self.PIECE_VALUES[captured_piece.piece_type]
                attacking_piece = board.piece_at(move.from_square)
                if attacking_piece:
                    priority -= self.PIECE_VALUES[attacking_piece.piece_type]

            # Prioritize checks
            board.push(move)
            if board.is_check():
                priority += 50
            board.pop()

            # Prioritize promotions
            if move.promotion:
                priority += 800

            return priority

        # Sort moves by priority (highest first)
        moves.sort(key=move_priority, reverse=True)
        return moves

    def minimax(
        self,
        board: chess.Board,
        depth: int,
        alpha: float,
        beta: float,
        is_maximizing: bool,
    ) -> float:
        """
        Minimax algorithm with alpha-beta pruning.

        Args:
            board: Current chess position
            depth: Remaining search depth
            alpha: Best value for maximizer
            beta: Best value for minimizer
            is_maximizing: True if maximizing (White), False if minimizing (Black)

        Returns:
            Evaluation score for the position
        """
        self.nodes_searched += 1

        # Base case: reached depth limit or game over
        if depth == 0 or board.is_game_over():
            return self.evaluate_position(board)

        if is_maximizing:
            # White's turn: maximize score
            max_eval = float("-inf")

            for move in self.order_moves(board):
                board.push(move)
                eval_score = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()

                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)

                # Beta cutoff: opponent won't allow this branch
                if beta <= alpha:
                    break

            return max_eval
        else:
            # Black's turn: minimize score
            min_eval = float("inf")

            for move in self.order_moves(board):
                board.push(move)
                eval_score = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)

                # Alpha cutoff: opponent won't allow this branch
                if beta <= alpha:
                    break

            return min_eval

    def find_best_move(
        self, board: chess.Board, depth: int = 4
    ) -> Tuple[chess.Move, float]:
        """
        Find the best move for the current position.

        Args:
            board: Current chess position
            depth: Search depth (plies)

        Returns:
            Tuple of (best_move, evaluation_score)
        """
        self.nodes_searched = 0
        best_move = None
        best_value = float("-inf") if board.turn == chess.WHITE else float("inf")

        is_maximizing = board.turn == chess.WHITE
        alpha = float("-inf")
        beta = float("inf")

        print(f"\nSearching at depth {depth}...")

        moves = self.order_moves(board)

        # Ensure we have at least one legal move
        if not moves:
            return None, best_value

        for move in moves:
            # Set first move as default best move
            if best_move is None:
                best_move = move

            board.push(move)

            # Search with opposite perspective
            eval_score = self.minimax(board, depth - 1, alpha, beta, not is_maximizing)

            board.pop()

            # Update best move
            if is_maximizing:
                if eval_score > best_value:
                    best_value = eval_score
                    best_move = move
                alpha = max(alpha, best_value)
            else:
                if eval_score < best_value:
                    best_value = eval_score
                    best_move = move
                beta = min(beta, best_value)

        return best_move, best_value

    def find_best_move_iterative(
        self, board: chess.Board, max_depth: int = 4
    ) -> chess.Move:
        """
        Iterative deepening: search depth 1, 2, 3, ... up to max_depth.
        Always has a "best move so far" if time runs out.
        """
        print(f"\n{'='*60}")
        print(f"Iterative Deepening Search (up to depth {max_depth})")
        print(f"{'='*60}")

        best_move = None

        for depth in range(1, max_depth + 1):
            start_time = time.time()
            move, score = self.find_best_move(board, depth)
            elapsed = time.time() - start_time

            best_move = move

            print(
                f"Depth {depth}: {move} | Score: {score/100:.2f} | "
                f"Nodes: {self.nodes_searched:,} | "
                f"Time: {elapsed:.3f}s"
            )

        print(f"{'='*60}\n")
        return best_move


def display_board(board: chess.Board, last_move: Optional[chess.Move] = None):
    """Display the chess board with coordinate labels."""
    board_str = str(board)
    lines = board_str.split("\n")

    print("\n  +---+---+---+---+---+---+---+---+")
    for i, line in enumerate(lines):
        rank = 8 - i
        print(f"{rank} | {' | '.join(line.split())} |")
        print("  +---+---+---+---+---+---+---+---+")
    print("    a   b   c   d   e   f   g   h\n")


def display_board_svg(board: chess.Board, last_move: Optional[chess.Move] = None):
    """
    Display the chess board using SVG rendering in a browser.

    Args:
        board: The chess board to display
        last_move: The last move made (to highlight it)
    """
    # Generate SVG with the last move highlighted
    svg_board = chess.svg.board(board, size=400, lastmove=last_move, coordinates=True)

    # Save to a temporary HTML file
    with tempfile.NamedTemporaryFile(
        mode="w", delete=False, suffix=".html", encoding="utf-8"
    ) as f:
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chess Board</title>
            <style>
                body {{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #312e2b;
                    font-family: Arial, sans-serif;
                }}
                .container {{
                    text-align: center;
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                }}
                h2 {{
                    margin-top: 0;
                    color: #312e2b;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>♟️ Chess Minimax Engine</h2>
                {svg_board}
            </div>
        </body>
        </html>
        """
        f.write(html_content)
        temp_file = f.name

    # Open in default browser
    webbrowser.open("file://" + os.path.abspath(temp_file))

    return temp_file


def play_game():
    """Play a game of chess with the engine - alternates between player and engine."""
    board = chess.Board()
    engine = ChessEngine()
    last_move = None
    svg_file = None

    print("♟️  Chess Engine with Minimax + Alpha-Beta Pruning")
    print("=" * 60)
    print("\nGame Mode: Player (White) vs Engine (Black)")
    print("Move Format: [from][to] (e.g., 'e2e4' moves piece from e2 to e4)")
    print("Promotion Format: [from][to][piece] (e.g., 'b7b8q' promotes to queen)")
    print("  Promotion pieces: q=Queen, r=Rook, b=Bishop, n=Knight")
    print("\nOptions:")
    print("  - Type 'svg' to open board in browser with SVG rendering")
    print("  - Type 'quit' to exit\n")

    # Show initial board in browser
    svg_file = display_board_svg(board)
    print("Board opened in browser! 🌐\n")

    while not board.is_game_over():
        display_board(board, last_move)
        print(f"Turn: {'White' if board.turn == chess.WHITE else 'Black'}")
        print(f"Legal moves: {board.legal_moves.count()}")

        if board.is_check():
            print("⚠️  CHECK!")

        # Alternate: White = Player, Black = Engine
        if board.turn == chess.WHITE:
            # Player's turn
            user_input = input("\nYour move: ").strip().lower()

            if user_input == "quit":
                print("Game ended by user.")
                break

            if user_input == "svg":
                svg_file = display_board_svg(board, last_move)
                print("Board updated in browser! 🌐\n")
                continue

            # Parse user move
            try:
                move = chess.Move.from_uci(user_input)
                if move in board.legal_moves:
                    board.push(move)
                    last_move = move
                    # Update SVG after player move
                    svg_file = display_board_svg(board, last_move)
                else:
                    print("❌ Illegal move! Try again.")
                    # Check if it's a promotion without specifying the piece
                    if len(user_input) == 4:
                        try:
                            from_square = chess.parse_square(user_input[:2])
                            to_square = chess.parse_square(user_input[2:4])
                            piece = board.piece_at(from_square)

                            # Check if it's a pawn reaching the last rank
                            if piece and piece.piece_type == chess.PAWN:
                                to_rank = chess.square_rank(to_square)
                                if (piece.color == chess.WHITE and to_rank == 7) or (
                                    piece.color == chess.BLACK and to_rank == 0
                                ):
                                    print(
                                        f"💡 Hint: This is a pawn promotion! Add promotion piece:"
                                    )
                                    print(f"   'q' for Queen (recommended)")
                                    print(f"   'r' for Rook")
                                    print(f"   'b' for Bishop")
                                    print(f"   'n' for Knight")
                                    print(
                                        f"   Example: '{user_input}q' to promote to Queen"
                                    )
                        except:
                            pass  # Not a valid square format
            except ValueError:
                print("❌ Invalid move format! Use UCI notation (e.g., 'e2e4')")
        else:
            # Engine's turn
            print("\n🤖 Engine thinking...")
            best_move = engine.find_best_move_iterative(board, max_depth=4)

            if best_move is None:
                print("❌ Engine couldn't find a move! This shouldn't happen.")
                break

            print(f"Engine plays: {best_move} ({board.san(best_move)})")
            board.push(best_move)
            last_move = best_move
            # Update SVG after engine move
            svg_file = display_board_svg(board, last_move)

    # Game over
    display_board(board, last_move)
    svg_file = display_board_svg(board, last_move)
    print("=" * 60)
    print("🏁 Game Over!")

    if board.is_checkmate():
        winner = "Black" if board.turn == chess.WHITE else "White"
        print(f"Checkmate! {winner} wins!")
    elif board.is_stalemate():
        print("Stalemate!")
    elif board.is_insufficient_material():
        print("Draw by insufficient material!")
    else:
        print("Draw!")


def demo_minimax():
    """Demonstrate minimax algorithm on a tactical position."""
    print("♟️  Minimax Algorithm Demo - Tactical Position")
    print("=" * 60)

    # Set up a tactical position
    board = chess.Board(
        "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
    )

    print(f"\n{board}\n")
    print("This is a tactical position from the Italian Game.")
    print("White can play Nxe5 (capturing the pawn).\n")

    engine = ChessEngine()

    # Find best move
    best_move = engine.find_best_move_iterative(board, max_depth=5)

    print(f"\n✅ Best move found: {best_move}")
    print(f"   In algebraic notation: {board.san(best_move)}")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  Chess Minimax Engine")
    print("  Demonstrates adversarial search in a perfect-information game")
    print("=" * 60)
    print("\nWhat would you like to do?")
    print("1. Play a game")
    print("2. See tactical demo")
    print("3. Exit")

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == "1":
        play_game()
    elif choice == "2":
        demo_minimax()
    else:
        print("Goodbye!")
