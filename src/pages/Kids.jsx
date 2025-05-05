import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import MiniGames from '../components/MiniGames';
import { FaPlay, FaInfoCircle, FaTimes, FaTrophy, FaRedo, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function Kids() {
  const [showFeaturedGame, setShowFeaturedGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    document.title = "Nishant | Kids Games";
  }, []);

  // Snake Game Logic
  const SnakeGame = () => {
    const canvasRef = React.useRef(null);
    
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
          x: Math.floor(Math.random() * (canvas.width / 20)),
          y: Math.floor(Math.random() * (canvas.height / 20))
        };
      };
      
      // Draw everything
      const draw = () => {
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        ctx.fillStyle = '#E50914';
        snake.forEach(segment => {
          ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
        });
        
        // Draw food
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
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
          head.x >= canvas.width / 20 || 
          head.y >= canvas.height / 20
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
        gameInterval = setInterval(gameLoop, 100);
      };
      
      initGame();
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearInterval(gameInterval);
      };
    }, [gameStarted]);
    
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
            width={400}
            height={400}
            className="border-4 border-red-600 rounded-md bg-black"
          />
          
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
              <h3 className="text-2xl font-bold text-red-600 mb-4">Featured Game: Snake</h3>
              <p className="text-gray-300 mb-6 text-center px-4">Control the snake, eat food, and avoid hitting walls or yourself.</p>
              <button
                onClick={() => setGameStarted(true)}
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
                onClick={() => setGameStarted(true)}
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

  return (
    <div className='relative overflow-x-hidden bg-[#141414]'>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen w-full">
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500">
          {/* Decorative Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-8 transform rotate-12 opacity-20">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-32 h-32 bg-white rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute bottom-1/3 left-0 px-4 md:px-16 space-y-4 w-full md:w-2/3">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Snake Game
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Challenge yourself in this classic game! Control the snake, eat the food, and try to achieve the highest score.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowFeaturedGame(true)}
              className="flex items-center px-8 py-3 bg-white text-black rounded font-bold hover:bg-opacity-80 transition"
            >
              <FaPlay className="mr-2" /> Play Now
            </button>
            <button className="flex items-center px-8 py-3 bg-gray-600 bg-opacity-70 text-white rounded font-bold hover:bg-opacity-50 transition">
              <FaInfoCircle className="mr-2" /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Featured Game Modal */}
      <AnimatePresence>
        {showFeaturedGame && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#141414] rounded-lg max-w-2xl w-full p-6 relative shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                onClick={() => {
                  setShowFeaturedGame(false);
                  setGameStarted(false);
                  setGameOver(false);
                }}
              >
                <FaTimes size={24} />
              </button>
              
              <SnakeGame />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Games Section */}
      <div className="relative z-10 -mt-32 px-4 md:px-16">
        <div className="space-y-16">
          {/* Popular Games */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 px-4">Popular Games</h2>
            <MiniGames />
          </div>

          {/* Game Categories */}
         
        </div>
      </div>

      {/* Add some bottom padding */}
      <div className="h-20"></div>

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
}

export default Kids; 