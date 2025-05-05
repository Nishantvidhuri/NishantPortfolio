import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaTrophy, FaPlay, FaRedo, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);
  
  // Game constants
  const GRID_SIZE = 20;
  const GAME_SPEED = 100;
  
  useEffect(() => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Game state
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let direction = 'right';
    let nextDirection = 'right';
    let gameInterval;
    let currentScore = 0;
    
    // Set up keyboard controls
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'down') nextDirection = 'up';
          break;
        case 'ArrowDown':
          if (direction !== 'up') nextDirection = 'down';
          break;
        case 'ArrowLeft':
          if (direction !== 'right') nextDirection = 'left';
          break;
        case 'ArrowRight':
          if (direction !== 'left') nextDirection = 'right';
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Generate random food position
    const generateFood = () => {
      return {
        x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
        y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
      };
    };
    
    // Draw everything
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw snake
      ctx.fillStyle = 'red';
      snake.forEach(segment => {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      });
      
      // Draw food
      ctx.fillStyle = 'green';
      ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    };
    
    // Game loop
    const gameLoop = () => {
      // Update direction
      direction = nextDirection;
      
      // Move snake
      const head = { ...snake[0] };
      switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }
      
      // Check for collisions with walls
      if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= canvas.width / GRID_SIZE || 
        head.y >= canvas.height / GRID_SIZE
      ) {
        endGame();
        return;
      }
      
      // Check for collisions with self
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
      }
      
      // Add new head
      snake.unshift(head);
      
      // Check for food collision
      if (head.x === food.x && head.y === food.y) {
        // Generate new food
        food = generateFood();
        // Increase score
        currentScore += 10;
        setScore(currentScore);
      } else {
        // Remove tail
        snake.pop();
      }
      
      // Draw everything
      draw();
    };
    
    const endGame = () => {
      clearInterval(gameInterval);
      setGameOver(true);
      setGameStarted(false);
      if (currentScore > highScore) {
        setHighScore(currentScore);
      }
    };
    
    // Initialize game
    const initGame = () => {
      // Reset game state
      snake = [{ x: 10, y: 10 }];
      food = generateFood();
      direction = 'right';
      nextDirection = 'right';
      currentScore = 0;
      setScore(0);
      setGameOver(false);
      
      // Start game loop
      gameInterval = setInterval(gameLoop, GAME_SPEED);
    };
    
    initGame();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gameInterval);
    };
  }, [gameStarted]);
  
  const handleStartGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center">
          {gameStarted && !gameOver && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-md flex items-center">
              <FaTrophy className="mr-2" />
              <span className="font-bold">{score}</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setMuted(!muted)} 
          className="text-gray-400 hover:text-white p-2"
        >
          {muted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="border-4 border-red-600 rounded-md bg-black"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Snake Game</h3>
            <p className="text-gray-300 mb-6 text-center px-4">Control the snake, eat food, and avoid hitting walls or yourself.</p>
            <button
              onClick={handleStartGame}
              className="flex items-center bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
            >
              <FaPlay className="mr-2" /> Start Game
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
            <h3 className="text-2xl font-bold text-red-600 mb-2">Game Over</h3>
            <p className="text-xl text-white mb-1">Score: {score}</p>
            {highScore > 0 && <p className="text-lg text-gray-300 mb-4">High Score: {highScore}</p>}
            <button
              onClick={handleStartGame}
              className="flex items-center bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
            >
              <FaRedo className="mr-2" /> Play Again
            </button>
          </div>
        )}
      </div>
      
      {gameStarted && !gameOver && (
        <div className="mt-4 text-center">
          <p className="text-gray-300">Use arrow keys to control the snake</p>
        </div>
      )}
    </div>
  );
};

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  
  // Card images (Netflix themed)
  const cardImages = [
    { id: 1, image: '🎬' },
    { id: 2, image: '📺' },
    { id: 3, image: '🍿' },
    { id: 4, image: '🎭' },
    { id: 5, image: '🎞️' },
    { id: 6, image: '🎥' },
    { id: 7, image: '🎮' },
    { id: 8, image: '🎯' },
  ];
  
  // Format time for display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Initialize game
  const initGame = () => {
    // Create pairs of cards
    const duplicatedCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ 
        ...card, 
        uniqueId: index,
        flipped: false,
        matched: false,
        content: card.image
      }));
    
    setCards(duplicatedCards);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
    setMoves(0);
    setScore(0);
    setElapsedTime(0);
    setGameComplete(false);
    setGameStarted(true);
    
    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };
  
  // Handle card click
  const handleCardClick = (index) => {
    if (disabled) return;
    
    // Don't allow flipping more than 2 cards at once or already matched cards
    const flippedCount = cards.filter(card => card.flipped && !card.matched).length;
    if (flippedCount === 2 || cards[index].flipped || cards[index].matched) return;
    
    // Flip the card
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    
    // If this is the second card, check for match
    if (flippedCount === 1) {
      setDisabled(true);
      setMoves(moves + 1);
      
      const flippedCards = newCards.filter(card => card.flipped && !card.matched);
      const firstCard = flippedCards[0];
      const secondCard = newCards[index];
      
      // Check if cards match
      if (firstCard.id === secondCard.id) {
        // Mark cards as matched
        newCards.forEach(card => {
          if (card.flipped && !card.matched) {
            card.matched = true;
          }
        });
        setCards(newCards);
        setScore(score + 10);
        setDisabled(false);
        
        // Check if game is complete
        if (newCards.filter(card => !card.matched).length === 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameComplete(true);
          setGameStarted(false);
        }
      } else {
        // If no match, flip cards back after a delay
        setTimeout(() => {
          newCards.forEach(card => {
            if (card.flipped && !card.matched) {
              card.flipped = false;
            }
          });
          setCards(newCards);
          setDisabled(false);
        }, 1000);
      }
    }
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 text-white px-3 py-1 rounded-md flex items-center">
            <FaTrophy className="mr-2" />
            <span className="font-bold">{score}</span>
          </div>
          {moves > 0 && (
            <div className="bg-gray-800 text-white px-3 py-1 rounded-md">
              Moves: {moves}
            </div>
          )}
        </div>
        <button 
          onClick={() => setMuted(!muted)} 
          className="text-gray-400 hover:text-white p-2"
        >
          {muted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {!gameStarted && !gameComplete && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Memory Game</h3>
          <p className="text-gray-300 mb-6">Find matching pairs of cards in this classic memory challenge.</p>
          <button
            onClick={initGame}
            className="flex items-center mx-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
          >
            <FaPlay className="mr-2" /> Start Game
          </button>
        </div>
      )}

      {gameComplete && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-2">Game Complete!</h3>
          <p className="text-xl text-white mb-1">Moves: {moves}</p>
          <p className="text-lg text-gray-300 mb-4">Time: {formatTime(elapsedTime)}</p>
          <button
            onClick={initGame}
            className="flex items-center mx-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
          >
            <FaRedo className="mr-2" /> Play Again
          </button>
        </div>
      )}

      {gameStarted && !gameComplete && (
        <div className="grid grid-cols-4 gap-2 w-full max-w-md">
          {cards.map((card, index) => (
            <div
              key={index}
              className="aspect-square cursor-pointer transition-all duration-300"
              onClick={() => handleCardClick(index)}
            >
              <div className={`relative w-full h-full transition-transform duration-500 ${
                card.flipped ? 'rotate-y-180' : ''
              }`}>
                <div className={`absolute w-full h-full backface-hidden bg-red-600 rounded-md flex items-center justify-center shadow-md ${
                  card.flipped ? 'hidden' : 'block'
                }`}>
                  <span className="text-white text-2xl">N</span>
                </div>
                <div className={`absolute w-full h-full backface-hidden bg-gray-900 rounded-md flex items-center justify-center border-2 border-red-600 ${
                  card.flipped ? 'block' : 'hidden'
                }`}>
                  <span className="text-4xl">{card.content}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PuzzleGame = () => {
  const [puzzle, setPuzzle] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Initialize game
  const initGame = () => {
    // Create puzzle pieces (3x3 grid)
    const pieces = Array.from({ length: 8 }, (_, i) => i + 1);
    pieces.push(null); // Empty space
    
    // Shuffle pieces (ensure solvable)
    let shuffled = [...pieces];
    let iterations = 100;
    while (iterations > 0) {
      const emptyIndex = shuffled.indexOf(null);
      const possibleMoves = [];
      
      // Find possible moves (up, down, left, right)
      if (emptyIndex % 3 > 0) possibleMoves.push(emptyIndex - 1); // Left
      if (emptyIndex % 3 < 2) possibleMoves.push(emptyIndex + 1); // Right
      if (emptyIndex >= 3) possibleMoves.push(emptyIndex - 3); // Up
      if (emptyIndex < 6) possibleMoves.push(emptyIndex + 3); // Down
      
      // Choose random move
      const moveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      // Swap pieces
      [shuffled[emptyIndex], shuffled[moveIndex]] = [shuffled[moveIndex], shuffled[emptyIndex]];
      
      iterations--;
    }
    
    setPuzzle(shuffled);
    setMoves(0);
    setGameComplete(false);
    setGameStarted(true);
  };
  
  // Check if puzzle is solved
  const checkSolved = (puzzleState) => {
    for (let i = 0; i < puzzleState.length - 1; i++) {
      if (puzzleState[i] !== i + 1) return false;
    }
    return puzzleState[puzzleState.length - 1] === null;
  };
  
  // Handle piece click
  const handlePieceClick = (index) => {
    if (!gameStarted || gameComplete) return;
    
    const emptyIndex = puzzle.indexOf(null);
    
    // Check if piece can move (adjacent to empty space)
    const canMoveHorizontal = Math.floor(index / 3) === Math.floor(emptyIndex / 3) && 
                             Math.abs(index % 3 - emptyIndex % 3) === 1;
    const canMoveVertical = Math.abs(Math.floor(index / 3) - Math.floor(emptyIndex / 3)) === 1 && 
                           index % 3 === emptyIndex % 3;
    
    if (canMoveHorizontal || canMoveVertical) {
      // Create new puzzle state
      const newPuzzle = [...puzzle];
      [newPuzzle[index], newPuzzle[emptyIndex]] = [newPuzzle[emptyIndex], newPuzzle[index]];
      
      setPuzzle(newPuzzle);
      setMoves(moves + 1);
      
      // Check if solved
      if (checkSolved(newPuzzle)) {
        setGameComplete(true);
        setGameStarted(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">Sliding Puzzle</h3>
      <p className="mb-2 text-gray-300">Arrange numbers in order</p>
      
      {!gameStarted && !gameComplete && (
        <button 
          onClick={initGame}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          Start Game
        </button>
      )}
      
      {gameComplete && (
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Puzzle Solved!</h3>
          <p className="mb-4">You solved the puzzle in {moves} moves</p>
          <button 
            onClick={initGame}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Play Again
          </button>
        </div>
      )}
      
      {gameStarted && <p className="mb-2">Moves: {moves}</p>}
      
      <div className="grid grid-cols-3 gap-1 w-64 h-64 bg-gray-900 p-1 rounded">
        {puzzle.map((piece, index) => (
          <div 
            key={index}
            onClick={() => handlePieceClick(index)}
            className={`
              flex items-center justify-center rounded cursor-pointer transition-all duration-200
              ${piece === null ? 'bg-gray-900' : 'bg-red-600 hover:bg-red-700'}
              ${piece === null ? '' : 'text-white font-bold text-2xl'}
            `}
          >
            {piece}
          </div>
        ))}
      </div>
    </div>
  );
};

// New Game 1: Whack-A-Mole
const WhackAMole = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeMole, setActiveMole] = useState(null);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef(null);
  const moleTimerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setGameOver(false);
    setActiveMole(Math.floor(Math.random() * 9));

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start mole movement
    moleTimerRef.current = setInterval(() => {
      setActiveMole(Math.floor(Math.random() * 9));
    }, 1000);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    clearInterval(moleTimerRef.current);
    setGameStarted(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const whackMole = (index) => {
    if (index === activeMole) {
      setScore(prev => prev + 1);
      setActiveMole(Math.floor(Math.random() * 9));
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(moleTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">Whack-A-Mole</h3>
      <p className="mb-2 text-gray-300">Click on the moles as they appear</p>

      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          Start Game
        </button>
      )}

      {gameOver && (
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          <p className="mb-4">Your score: {score}</p>
          {highScore > 0 && <p className="mb-4">High score: {highScore}</p>}
          <button
            onClick={startGame}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Play Again
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="mb-4">
          <p>Score: {score}</p>
          <p>Time left: {timeLeft}s</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 w-80 h-80">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            onClick={() => gameStarted && whackMole(index)}
            className="bg-gray-800 rounded-full overflow-hidden relative cursor-pointer"
          >
            {activeMole === index && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🎭</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// New Game 2: Color Match
const ColorMatch = () => {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const colorClasses = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-600',
    orange: 'bg-orange-500'
  };

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentColor, setCurrentColor] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [isMatch, setIsMatch] = useState(null);
  const timerRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setGameOver(false);
    generateNewRound();

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    setGameStarted(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const generateNewRound = () => {
    const colorIndex = Math.floor(Math.random() * colors.length);
    const textIndex = Math.floor(Math.random() * colors.length);
    const match = Math.random() > 0.5;

    setCurrentColor(colors[colorIndex]);
    setCurrentText(match ? colors[colorIndex] : colors[textIndex === colorIndex ? (textIndex + 1) % colors.length : textIndex]);
    setIsMatch(match);
  };

  const handleAnswer = (userAnswer) => {
    if (userAnswer === isMatch) {
      setScore(prev => prev + 1);
    } else {
      setTimeLeft(prev => Math.max(prev - 2, 0));
    }
    generateNewRound();
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">Color Match</h3>
      <p className="mb-2 text-gray-300">Does the color match the text?</p>

      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          Start Game
        </button>
      )}

      {gameOver && (
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          <p className="mb-4">Your score: {score}</p>
          {highScore > 0 && <p className="mb-4">High score: {highScore}</p>}
          <button
            onClick={startGame}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Play Again
          </button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="mb-4">
            <p>Score: {score}</p>
            <p>Time left: {timeLeft}s</p>
          </div>

          <div className="mb-8 flex items-center justify-center h-20">
            <span className={`text-4xl font-bold ${colorClasses[currentColor]} px-4 py-2 rounded`}>
              {currentText.toUpperCase()}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Match
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              No Match
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// New Game 3: Word Scramble
const WordScramble = () => {
  const netflixWords = [
    'STRANGER', 'WITCHER', 'BRIDGERTON', 'SQUIDGAME', 'CROWN', 
    'OZARK', 'NARCOS', 'DAREDEVIL', 'UMBRELLA', 'WEDNESDAY',
    'LUCIFER', 'MINDHUNTER', 'SANDMAN', 'COBRA', 'QUEEN'
  ];

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [usedWords, setUsedWords] = useState([]);
  const timerRef = useRef(null);

  const scrambleWord = (word) => {
    const wordArray = word.split('');
    let scrambled = wordArray.sort(() => Math.random() - 0.5).join('');
    
    // Make sure the scrambled word is different from the original
    while (scrambled === word && word.length > 1) {
      scrambled = wordArray.sort(() => Math.random() - 0.5).join('');
    }
    
    return scrambled;
  };

  const getNewWord = () => {
    const availableWords = netflixWords.filter(word => !usedWords.includes(word));
    
    if (availableWords.length === 0) {
      // If all words used, reset the used words
      setUsedWords([]);
      const randomIndex = Math.floor(Math.random() * netflixWords.length);
      const word = netflixWords[randomIndex];
      setCurrentWord(word);
      setScrambledWord(scrambleWord(word));
      setUsedWords([word]);
    } else {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      const word = availableWords[randomIndex];
      setCurrentWord(word);
      setScrambledWord(scrambleWord(word));
      setUsedWords([...usedWords, word]);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameStarted(true);
    setGameOver(false);
    setUserInput('');
    setUsedWords([]);
    getNewWord();

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    setGameStarted(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (userInput.toUpperCase() === currentWord) {
      setScore(prev => prev + 1);
      setUserInput('');
      getNewWord();
    } else {
      // Shake effect or some feedback could be added here
      setTimeLeft(prev => Math.max(prev - 3, 0));
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">Word Scramble</h3>
      <p className="mb-2 text-gray-300">Unscramble Netflix show titles</p>

      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          Start Game
        </button>
      )}

      {gameOver && (
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          <p className="mb-4">Your score: {score}</p>
          {highScore > 0 && <p className="mb-4">High score: {highScore}</p>}
          <button
            onClick={startGame}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Play Again
          </button>
        </div>
      )}

      {gameStarted && (
        <>
          <div className="mb-4">
            <p>Score: {score}</p>
            <p>Time left: {timeLeft}s</p>
          </div>

          <div className="mb-6">
            <h3 className="text-3xl font-bold mb-4 text-red-500">{scrambledWord}</h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="Enter unscrambled word"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

// New Game 4: Reaction Time
const ReactionTime = () => {
  const [gameState, setGameState] = useState('idle'); // idle, waiting, ready, clicked
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameState('waiting');
    setCountdown(3);
    
    // Countdown from 3
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRandomTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const setRandomTimeout = () => {
    // Random time between 1-5 seconds
    const randomDelay = 1000 + Math.floor(Math.random() * 4000);
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, randomDelay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Clicked too early
      clearTimeout(timeoutRef.current);
      setGameState('idle');
      setReactionTime('Too early!');
    } else if (gameState === 'ready') {
      // Good click
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
      
      setGameState('clicked');
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">Reaction Time</h3>
      <p className="mb-2 text-gray-300">Test your reflexes</p>

      <div 
        className={`w-80 h-80 rounded-lg flex items-center justify-center cursor-pointer mb-4 transition-colors duration-200
          ${gameState === 'idle' ? 'bg-gray-800' : 
            gameState === 'waiting' ? 'bg-red-800' : 
            gameState === 'ready' ? 'bg-green-600' : 'bg-blue-600'}`}
        onClick={handleClick}
      >
        {gameState === 'idle' && (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Start Game
          </button>
        )}
        
        {gameState === 'waiting' && (
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">Wait for green...</p>
            {countdown > 0 && <p className="text-xl">{countdown}</p>}
          </div>
        )}
        
        {gameState === 'ready' && (
          <p className="text-2xl font-bold">CLICK NOW!</p>
        )}
        
        {gameState === 'clicked' && (
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">
              {reactionTime} ms
            </p>
            <button
              onClick={startGame}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {bestTime && (
        <p className="text-lg">Best time: {bestTime} ms</p>
      )}
    </div>
  );
};

// New Game 5: Trivia Quiz
const TriviaQuiz = () => {
  const questions = [
    {
      question: "Which Netflix show features a group of kids fighting the Demogorgon?",
      options: ["Dark", "Stranger Things", "The OA", "Black Mirror"],
      answer: 1
    },
    {
      question: "In 'Squid Game', what is the prize money for winning all the games?",
      options: ["38.6 million won", "45.6 billion won", "100 million won", "1 billion won"],
      answer: 1
    },
    {
      question: "Which Netflix show is about a chess prodigy?",
      options: ["The Crown", "The Queen's Gambit", "Bridgerton", "The Witcher"],
      answer: 1
    },
    {
      question: "Which character does Henry Cavill play in 'The Witcher'?",
      options: ["Jaskier", "Geralt of Rivia", "Vesemir", "Emhyr"],
      answer: 1
    },
    {
      question: "Which Netflix show is set in the fictional town of Hawkins?",
      options: ["Ozark", "Stranger Things", "Dark", "Riverdale"],
      answer: 1
    },
    {
      question: "In 'Money Heist', what city is the Royal Mint located in?",
      options: ["Barcelona", "Seville", "Madrid", "Valencia"],
      answer: 2
    },
    {
      question: "Which Netflix show features the Umbrella Academy?",
      options: ["The Umbrella Academy", "Locke & Key", "The Haunting of Hill House", "A Series of Unfortunate Events"],
      answer: 0
    },
    {
      question: "Which Netflix show is about a family who moves to the Ozarks to launder money?",
      options: ["Breaking Bad", "Narcos", "Ozark", "Better Call Saul"],
      answer: 2
    },
    {
      question: "In 'The Crown', which actress played Queen Elizabeth II in seasons 1 and 2?",
      options: ["Olivia Colman", "Helena Bonham Carter", "Claire Foy", "Vanessa Kirby"],
      answer: 2
    },
    {
      question: "Which Netflix show features Joe Goldberg as the main character?",
      options: ["Mindhunter", "You", "The Sinner", "Dexter"],
      answer: 1
    }
  ];

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const startGame = () => {
    // Shuffle questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setGameStarted(true);
    setGameOver(false);
  };

  const handleAnswer = (optionIndex) => {
    if (answered) return;
    
    setSelectedOption(optionIndex);
    setAnswered(true);
    
    if (optionIndex === shuffledQuestions[currentQuestion].answer) {
      setScore(prev => prev + 1);
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
      } else {
        setGameOver(true);
        setGameStarted(false);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">Netflix Trivia</h3>
      <p className="mb-2 text-gray-300">Test your Netflix knowledge</p>

      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          Start Quiz
        </button>
      )}

      {gameOver && (
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="mb-4">Your score: {score}/{questions.length}</p>
          <button
            onClick={startGame}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Play Again
          </button>
        </div>
      )}

      {gameStarted && shuffledQuestions.length > 0 && (
        <>
          <div className="mb-4 text-center">
            <p>Question {currentQuestion + 1}/{shuffledQuestions.length}</p>
            <p>Score: {score}</p>
          </div>

          <div className="mb-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{shuffledQuestions[currentQuestion].question}</h3>
            
            <div className="space-y-2">
              {shuffledQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-3 text-left rounded transition-colors duration-200
                    ${selectedOption === null ? 'bg-gray-800 hover:bg-gray-700' : 
                      index === shuffledQuestions[currentQuestion].answer ? 'bg-green-600' : 
                      selectedOption === index ? 'bg-red-600' : 'bg-gray-800'}`}
                  disabled={answered}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// New Game: Hangman
const Hangman = () => {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [muted, setMuted] = useState(false);
  const maxWrongGuesses = 6;
  
  // Netflix show titles for the game
  const netflixShows = [
    'STRANGER THINGS', 'THE CROWN', 'BRIDGERTON', 'SQUID GAME', 'WEDNESDAY',
    'OZARK', 'NARCOS', 'DARK', 'MONEY HEIST', 'BLACK MIRROR'
  ];
  
  const startGame = () => {
    const randomWord = netflixShows[Math.floor(Math.random() * netflixShows.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
  };
  
  const handleGuess = (letter) => {
    if (gameOver || guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameOver(true);
        setGameStarted(false);
      }
    } else {
      // Check if player has won
      const isWon = word.split('').every(char => 
        char === ' ' || newGuessedLetters.includes(char)
      );
      
      if (isWon) {
        setGameWon(true);
        setGameOver(true);
        setGameStarted(false);
      }
    }
  };
  
  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <span key={index} className="mx-1 text-2xl">
        {letter === ' ' ? '\u00A0\u00A0' : 
          guessedLetters.includes(letter) ? letter : '_'}
      </span>
    ));
  };
  
  const renderHangman = () => {
    const parts = [
      <circle key="head" cx="50" cy="30" r="10" stroke="white" fill="none" strokeWidth="2" />,
      <line key="body" x1="50" y1="40" x2="50" y2="70" stroke="white" strokeWidth="2" />,
      <line key="arm1" x1="50" y1="50" x2="30" y2="40" stroke="white" strokeWidth="2" />,
      <line key="arm2" x1="50" y1="50" x2="70" y2="40" stroke="white" strokeWidth="2" />,
      <line key="leg1" x1="50" y1="70" x2="30" y2="90" stroke="white" strokeWidth="2" />,
      <line key="leg2" x1="50" y1="70" x2="70" y2="90" stroke="white" strokeWidth="2" />
    ];
    
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto mb-4">
        {/* Gallows */}
        <line x1="10" y1="95" x2="90" y2="95" stroke="white" strokeWidth="2" />
        <line x1="30" y1="95" x2="30" y2="10" stroke="white" strokeWidth="2" />
        <line x1="30" y1="10" x2="50" y2="10" stroke="white" strokeWidth="2" />
        <line x1="50" y1="10" x2="50" y2="20" stroke="white" strokeWidth="2" />
        
        {/* Body parts based on wrong guesses */}
        {parts.slice(0, wrongGuesses)}
      </svg>
    );
  };
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center">
          {gameStarted && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-md">
              <span className="font-bold">Wrong: {wrongGuesses}/{maxWrongGuesses}</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setMuted(!muted)} 
          className="text-gray-400 hover:text-white p-2"
        >
          {muted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {!gameStarted && !gameOver && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Hangman</h3>
          <p className="text-gray-300 mb-6">Guess the Netflix show title before the hangman is complete.</p>
          <button
            onClick={startGame}
            className="flex items-center mx-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
          >
            <FaPlay className="mr-2" /> Start Game
          </button>
        </div>
      )}

      {gameOver && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-2">
            {gameWon ? 'You Won!' : 'Game Over'}
          </h3>
          <p className="text-xl text-white mb-4">
            {gameWon ? 'Great job!' : `The word was: ${word}`}
          </p>
          <button
            onClick={startGame}
            className="flex items-center mx-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
          >
            <FaRedo className="mr-2" /> Play Again
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="w-full max-w-md">
          {renderHangman()}
          
          <div className="mb-6 text-center">
            {renderWord()}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter)}
                className={`w-10 h-10 flex items-center justify-center rounded-md font-bold transition-colors
                  ${guessedLetters.includes(letter) 
                    ? word.includes(letter) 
                      ? 'bg-green-600 text-white cursor-not-allowed' 
                      : 'bg-red-600 text-white cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// New Game: Tic Tac Toe
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [muted, setMuted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  const startGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
  };
  
  const checkWinner = (boardState) => {
    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a];
      }
    }
    return null;
  };
  
  const isBoardFull = (boardState) => {
    return boardState.every(square => square !== null);
  };
  
  const handleClick = (index) => {
    if (board[index] || gameOver || aiThinking) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setWinner(winner);
      setGameOver(true);
      return;
    }
    
    if (isBoardFull(newBoard)) {
      setGameOver(true);
      return;
    }
    
    // AI move
    setAiThinking(true);
    setTimeout(() => {
      const aiBoard = [...newBoard];
      const emptySquares = aiBoard.map((square, i) => square === null ? i : null).filter(i => i !== null);
      
      if (emptySquares.length > 0) {
        const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        aiBoard[randomIndex] = 'O';
        setBoard(aiBoard);
        
        const aiWinner = checkWinner(aiBoard);
        if (aiWinner) {
          setWinner(aiWinner);
          setGameOver(true);
        } else if (isBoardFull(aiBoard)) {
          setGameOver(true);
        }
      }
      
      setAiThinking(false);
    }, 500);
  };
  
  const renderSquare = (index) => {
    return (
      <button
        className={`w-20 h-20 bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl font-bold transition-colors ${
          board[index] === 'X' ? 'text-red-500' : board[index] === 'O' ? 'text-blue-500' : 'hover:bg-gray-700'
        }`}
        onClick={() => handleClick(index)}
        disabled={board[index] !== null || gameOver}
      >
        {board[index]}
      </button>
    );
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center">
          {gameStarted && !gameOver && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-md">
              <span className="font-bold">{aiThinking ? "Netflix is thinking..." : "Your turn"}</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setMuted(!muted)} 
          className="text-gray-400 hover:text-white p-2"
        >
          {muted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {!gameStarted && !gameOver && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-4">Tic Tac Toe</h3>
          <p className="text-gray-300 mb-6">Play against Netflix AI in this classic game.</p>
          <button
            onClick={startGame}
            className="flex items-center mx-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
          >
            <FaPlay className="mr-2" /> Start Game
          </button>
        </div>
      )}

      {gameOver && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-red-600 mb-2">
            {winner ? `${winner === 'X' ? 'You Won!' : 'Netflix Won!'}` : 'Draw!'}
          </h3>
          <p className="text-xl text-white mb-4">
            {winner ? (winner === 'X' ? 'Great job beating Netflix!' : 'Better luck next time!') : 'It\'s a tie!'}
          </p>
          <button
            onClick={startGame}
            className="flex items-center mx-auto bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-bold"
          >
            <FaRedo className="mr-2" /> Play Again
          </button>
        </div>
      )}

      {gameStarted && !gameOver && (
        <div className="grid grid-cols-3 gap-1 mb-4">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      )}
    </div>
  );
};

const MiniGames = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const location = useLocation();
  
  // Determine if we're on the HR page, Developer page, or Kids page
  const isHrPage = location.pathname.includes('/hr');
  const isKidsPage = location.pathname.includes('/kids');
  const bgColor = isHrPage||isKidsPage ? '' : 'bg-[#141414]';
  const modalBgColor = isHrPage ? 'bg-black' : 'bg-[#141414]';
  const gameContainerBgColor = isHrPage ? 'bg-black' : 'bg-[#1a1a1a]';

  const games = [
    {
      id: 'snake',
      title: 'Snake Game',
      description: 'Control the snake, eat food, and avoid hitting walls or yourself.',
      icon: '🐍',
      component: <SnakeGame />,
      bgImage: 'url("https://uploads.drafts.toph.co/drafts-images/55c5cc603bb03ab823fd2806-1571231085736176225-8406388898923468000-0605f396e824ddee1d8cd9b7c04663f7.jpg")',
      bgColor: 'from-green-900 to-black'
    },
    {
      id: 'memory',
      title: 'Memory Game',
      description: 'Find matching pairs of cards in this classic memory challenge.',
      icon: '🎮',
      component: <MemoryGame />,
      bgImage: 'url("https://cloud.educaplay.com/r1/img/activities/RELACIONAR_MOSAICO/logoActivity.png?v=1740142054")',
      bgColor: 'from-blue-900 to-black'
    },
    {
      id: 'puzzle',
      title: 'Sliding Puzzle',
      description: 'Arrange the numbers in order by sliding tiles into the empty space.',
      icon: '🧩',
      component: <PuzzleGame />,
      bgImage: 'url("https://content.instructables.com/FT3/QGT0/HUBJBJDI/FT3QGT0HUBJBJDI.jpg?auto=webp")',
      bgColor: 'from-purple-900 to-black'
    },
    {
      id: 'whackamole',
      title: 'Whack-A-Mole',
      description: 'Click on the moles as they appear to score points.',
      icon: '🎭',
      component: <WhackAMole />,
      bgImage: 'url("https://images-cdn.ubuy.co.in/65aa9a1a8fbc777c7b00e38c-rozyard-whack-a-mole-game-electronic.jpg")',
      bgColor: 'from-yellow-900 to-black'
    },
    {
      id: 'colormatch',
      title: 'Color Match',
      description: 'Quickly determine if the color matches the text.',
      icon: '🎨',
      component: <ColorMatch />,
      bgImage: 'url("https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
      bgColor: 'from-pink-900 to-black'
    },
    {
      id: 'wordscramble',
      title: 'Word Scramble',
      description: 'Unscramble Netflix show titles against the clock.',
      icon: '📝',
      component: <WordScramble />,
      bgImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo5fyxd_ng4Ut01lLYw8HS33Yuxi4Be00IJQ&s")',
      bgColor: 'from-indigo-900 to-black'
    },
    {
      id: 'reactiontime',
      title: 'Reaction Time',
      description: 'Test your reflexes by clicking as soon as the color changes.',
      icon: '⚡',
      component: <ReactionTime />,
      bgImage: 'url("https://content.instructables.com/FDQ/MG4G/J1QP8FQY/FDQMG4GJ1QP8FQY.jpg?auto=webp")',
      bgColor: 'from-orange-900 to-black'
    },
    {
      id: 'trivia',
      title: 'Netflix Trivia',
      description: 'Test your knowledge of Netflix shows and movies.',
      icon: '❓',
      component: <TriviaQuiz />,
      bgImage: 'url("https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
      bgColor: 'from-red-900 to-black'
    },
    {
      id: 'hangman',
      title: 'Hangman',
      description: 'Guess the Netflix show title before the hangman is complete.',
      icon: '📺',
      component: <Hangman />,
      bgImage: 'url("https://images.unsplash.com/photo-1594908900066-3f47337549d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
      bgColor: 'from-gray-900 to-black'
    },
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe',
      description: 'Play against Netflix AI in this classic game.',
      icon: '❌',
      component: <TicTacToe />,
      bgImage: 'url("https://images.unsplash.com/photo-1611996575749-79a3a250f948?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
      bgColor: 'from-blue-900 to-black'
    }
  ];

  const scrollLeftHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRightHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const startDrag = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onDrag = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  const handleGameClick = (gameId) => {
    setActiveGame(gameId);
    setShowGameModal(true);
  };

  const closeGameModal = () => {
    setShowGameModal(false);
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        closeGameModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Render "Game Zone" for kids page or "Mini Games" for other pages
  const renderTitle = () => {
    if (isKidsPage) {
      return (
        <h2 className="text-4xl font-bold mb-8 text-white flex items-center">
          <span className="text-5xl mr-4">🎮</span>
          Game Zone
          <span className="text-5xl ml-4">🎮</span>
        </h2>
      );
    }
    return <h2 className="text-3xl font-bold mb-8 text-white">Mini Games</h2>;
  };

  return (
    <div className={`w-[105%] translate-x-[-2%] py-16  ${bgColor}`}>
      <div className="mx-auto">
        {renderTitle()}
        
        <div className="relative">
          {/* Scroll Left Button */}
          <button
            className="absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 transition-all duration-300 rounded-full w-12 h-12 flex items-center justify-center group"
            onClick={scrollLeftHandler}
          >
            <FaChevronLeft className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          {/* Game Cards Container */}
          <div
            ref={sliderRef}
            className="flex gap-10 overflow-x-auto hide-scrollbar pb-10 pt-2"
            onMouseDown={startDrag}
            onMouseLeave={stopDrag}
            onMouseUp={stopDrag}
            onMouseMove={onDrag}
          >
            {games.map((game) => (
              <div
                key={game.id}
                className="flex-none w-[300px] relative group cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => handleGameClick(game.id)}
              >
                {/* Card Background */}
                <div 
                  className="relative  aspect-video rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: game.bgImage,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-100"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    {/* Title and Icon */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                        {game.icon}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                        {game.title}
                      </h3>
                    </div>
                    
                    {/* Description - Only visible on hover */}
                    <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {game.description}
                    </p>
                    
                    {/* Play Button - Only visible on hover */}
                    <button className="mt-3 w-full bg-yellow-500 text-black py-2 rounded font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-yellow-400">
                      Play Game!
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll Right Button */}
          <button
            className="absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 transition-all duration-300 rounded-full w-12 h-12 flex items-center justify-center group"
            onClick={scrollRightHandler}
          >
            <FaChevronRight className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
      
      {/* Game Modal Popup */}
      <AnimatePresence>
        {showGameModal && activeGame && (
          <motion.div 
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGameModal}
          >
            <motion.div 
              className="bg-[#141414] rounded-lg max-w-2xl w-full p-6 relative shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                onClick={closeGameModal}
              >
                <FaTimes size={24} />
              </button>
              
              <div className="mb-6 flex items-center">
                <span className="text-4xl mr-4">
                  {games.find(game => game.id === activeGame)?.icon}
                </span>
                <h3 className="text-3xl font-bold text-yellow-500">
                  {games.find(game => game.id === activeGame)?.title}
                </h3>
              </div>
              
              <div className="game-container bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 shadow-inner">
                {games.find(game => game.id === activeGame)?.component}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MiniGames; 