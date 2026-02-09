# Chess AI Analyzer

A modern, interactive chess website built with Next.js that visualizes AI decision-making using various chess engines. Watch as the AI "thinks" through positions and see the best moves ranked in real-time.

## 🌟 Features

### 🎮 Interactive Chess Board
- Play chess against AI opponents
- Smooth drag-and-drop piece movement
- Beautiful, responsive design inspired by shadcn/ui

### 🤖 Multiple AI Engines
- **Minimax**: Classic minimax algorithm for baseline AI
- **Minimax with Alpha-Beta Pruning**: Optimized version that evaluates fewer nodes

### 📊 Real-Time Analysis Panel
- View top 50 moves ranked by evaluation score
- See how many nodes were evaluated
- Color-coded scores (green for advantage, red for disadvantage)
- Shows captures and special moves

### 🐛 Debug Mode
- **Animated AI Thinking**: Watch the AI analyze each position step-by-step
- **Node Visualization**: See every move the AI considers
- **Depth Distribution**: Visual representation of how deep the AI searches
- **Playback Controls**: Pause, resume, and scrub through the AI's thought process
- **Adjustable Speed**: Control animation speed from fast (10ms) to slow (500ms)

### ⚙️ Customizable Settings
- **Search Depth**: Adjust from 1-5 (deeper = stronger but slower)
- **Engine Selection**: Switch between different AI algorithms
- **Animation Speed**: Fine-tune debug mode visualization speed
- **Debug Toggle**: Turn visualization on/off as needed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd chess-ai
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 How to Use

### Playing the Game
1. **Make Your Move**: Click and drag pieces on the board (you play as White)
2. **AI Responds**: The AI will analyze and make its move automatically
3. **View Analysis**: Check the right panel to see the AI's evaluation of all possible moves

### Using Debug Mode
1. **Enable Debug Mode**: Toggle the switch in the control panel
2. **Adjust Speed**: Use the slider to control how fast the animation plays
3. **Watch AI Think**: After making a move, watch as the AI visualizes its search tree
4. **Control Playback**: Use pause/resume button and the scrubber to control visualization
5. **View Node Details**: See move information, depth, and node count for each position analyzed

### Engine Comparison
Try different engines to see how optimizations affect performance:
- **Minimax**: Evaluates all possible positions (slower but educational)
- **Alpha-Beta**: Prunes unnecessary branches (faster, evaluates fewer nodes)

## 🏗️ Project Structure

```
chess-ai/
├── app/
│   ├── page.tsx                 # Main page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ChessGame.tsx           # Main game component
│   ├── AnalysisPanel.tsx       # Move analysis display
│   ├── ControlPanel.tsx        # Game controls
│   └── DebugVisualization.tsx  # Debug mode UI
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── evaluation.ts           # Board evaluation function
│   └── engines/
│       ├── index.ts            # Engine factory
│       ├── minimax.ts          # Minimax implementation
│       └── minimax-alpha-beta.ts # Alpha-beta implementation
```

## 🛠️ Technologies Used

- **[Next.js 15](https://nextjs.org/)** - React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[chess.js](https://github.com/jhlywa/chess.js)** - Chess logic and move validation
- **[react-chessboard](https://github.com/Clariity/react-chessboard)** - Beautiful chessboard component
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations

## 📖 How the AI Works

### Minimax Algorithm
The AI uses the minimax algorithm to evaluate positions:
1. **Search**: Explores possible move sequences to a specified depth
2. **Evaluate**: Assigns scores to positions based on material and position
3. **Minimax**: Assumes both players play optimally (maximize/minimize scores)
4. **Choose**: Selects the move leading to the best position

### Alpha-Beta Pruning
An optimization that skips evaluating positions that won't affect the final decision:
- Maintains alpha (best for maximizer) and beta (best for minimizer) values
- Prunes branches when alpha >= beta
- Same result as minimax but evaluates fewer nodes

### Evaluation Function
Positions are scored based on:
- **Material**: Pawn=100, Knight=320, Bishop=330, Rook=500, Queen=900, King=20000
- **Position**: Piece-square tables reward good positioning
- **Perspective**: Scores are relative to the current player

## 🎨 Design Philosophy

The UI is inspired by **shadcn/ui** principles:
- Clean, modern aesthetic
- Smooth animations and transitions
- Intuitive controls
- Responsive layout
- Dark theme optimized for long viewing sessions

## 🔮 Future Enhancements

Potential additions for future versions:
- More advanced engines (Negamax, Iterative Deepening)
- Opening book integration
- Endgame tablebase support
- Move history and position analysis
- Multiplayer support
- Export/import PGN games
- Performance metrics and comparison charts

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Enjoy playing and learning from the Chess AI Analyzer! ♟️**
