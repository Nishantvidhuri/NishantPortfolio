import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaTrophy, FaPlay, FaRedo } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════
   GAME 1: Emoji Slots
   ═══════════════════════════════════════ */
const EmojiSlots = () => {
  const symbols = ['🎬', '🍿', '📺', '🎭', '🎞️', '🎥', '⭐', '🏆'];
  const [reels, setReels] = useState(['🎬', '📺', '🍿']);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState('');
  const [won, setWon] = useState(false);

  const spin = () => {
    if (spinning || coins < 10) return;
    setCoins(prev => prev - 10);
    setSpinning(true);
    setMessage('');
    setWon(false);

    let spins = 0;
    const interval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      spins++;
      if (spins > 15) {
        clearInterval(interval);
        const finalReels = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ];
        setReels(finalReels);
        setSpinning(false);

        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          setCoins(prev => prev + 100);
          setMessage('JACKPOT! +100');
          setWon(true);
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
          setCoins(prev => prev + 25);
          setMessage('Nice! +25');
          setWon(true);
        } else {
          setMessage('Try again!');
        }
      }
    }, 80);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-2 mb-4">
        <FaTrophy className="text-yellow-500" />
        <span className="text-white font-bold text-lg">{coins} coins</span>
      </div>
      <div className="flex gap-2 sm:gap-4 mb-6">
        {reels.map((symbol, i) => (
          <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-800 border-2 border-red-600 rounded-lg flex items-center justify-center">
            <span className={`text-4xl sm:text-5xl ${spinning ? 'animate-bounce' : ''}`}>{symbol}</span>
          </div>
        ))}
      </div>
      {message && (
        <p className={`text-lg font-bold mb-4 ${won ? 'text-green-400' : 'text-gray-400'}`}>{message}</p>
      )}
      <button
        onClick={spin}
        disabled={spinning || coins < 10}
        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors w-full max-w-xs"
      >
        {spinning ? 'Spinning...' : coins < 10 ? 'No Coins!' : 'Spin (10 coins)'}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 2: Card Match
   ═══════════════════════════════════════ */
const CardMatch = () => {
  const emojis = ['🎬', '📺', '🍿', '🎭', '🎞️', '🎥', '⭐', '🏆'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);

  const initGame = () => {
    const pairs = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji }));
    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setComplete(false);
    setStarted(true);
  };

  const handleFlip = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) setComplete(true);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Card Match</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Find all matching pairs of cards</p>
        <button onClick={initGame} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-2xl font-bold text-green-400 mb-2">Complete!</h3>
        <p className="text-white text-lg mb-4">Solved in {moves} moves</p>
        <button onClick={initGame} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-gray-300 mb-3">Moves: {moves}</p>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-xs sm:max-w-sm">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <button key={i} onClick={() => handleFlip(i)}
              className={`aspect-square rounded-lg text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 ${
                isFlipped ? 'bg-gray-900 border-2 border-red-500' : 'bg-red-600 hover:bg-red-700'
              } ${matched.includes(i) ? 'opacity-60' : ''}`}
            >
              {isFlipped ? card.emoji : 'N'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 3: Netflix Trivia
   ═══════════════════════════════════════ */
const NetflixTrivia = () => {
  const allQuestions = [
    { q: "Which Netflix show features kids fighting the Demogorgon?", opts: ["Dark", "Stranger Things", "The OA", "Black Mirror"], ans: 1 },
    { q: "In Squid Game, what is the prize money?", opts: ["38.6M won", "45.6B won", "100M won", "1B won"], ans: 1 },
    { q: "Which show is about a chess prodigy?", opts: ["The Crown", "Queen's Gambit", "Bridgerton", "Witcher"], ans: 1 },
    { q: "Who plays Geralt in The Witcher (S1-S3)?", opts: ["Jaskier", "Henry Cavill", "Vesemir", "Emhyr"], ans: 1 },
    { q: "Which show is set in Hawkins, Indiana?", opts: ["Ozark", "Stranger Things", "Dark", "Riverdale"], ans: 1 },
    { q: "Money Heist's Royal Mint is in which city?", opts: ["Barcelona", "Seville", "Madrid", "Valencia"], ans: 2 },
    { q: "Which show stars Wednesday Addams?", opts: ["Chilling Adventures", "Wednesday", "Locke & Key", "Sandman"], ans: 1 },
    { q: "Who plays Joe Goldberg in You?", opts: ["Zac Efron", "Penn Badgley", "Chris Evans", "Tom Holland"], ans: 1 },
    { q: "Which Korean drama has a glass bridge?", opts: ["All of Us Are Dead", "Squid Game", "Sweet Home", "Hellbound"], ans: 1 },
    { q: "Which show features the Byrde family?", opts: ["Breaking Bad", "Narcos", "Ozark", "Better Call Saul"], ans: 2 },
  ];
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('idle');

  const start = () => {
    setQuestions([...allQuestions].sort(() => Math.random() - 0.5).slice(0, 7));
    setIdx(0);
    setScore(0);
    setSelected(null);
    setPhase('playing');
  };

  const answer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[idx].ans) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        setPhase('done');
      }
    }, 1200);
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Netflix Trivia</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Test your Netflix knowledge</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Quiz
        </button>
      </div>
    );
  }
  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-2xl font-bold text-red-500 mb-2">Quiz Complete!</h3>
        <p className="text-white text-lg mb-4">{score}/{questions.length} correct</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-gray-400 text-sm mb-1">Question {idx + 1}/{questions.length} &middot; Score: {score}</p>
      <h3 className="text-white text-base sm:text-lg font-semibold mb-4 text-center">{q.q}</h3>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => answer(i)}
            disabled={selected !== null}
            className={`w-full p-3 rounded-lg text-left text-sm sm:text-base transition-colors ${
              selected === null ? 'bg-gray-800 hover:bg-gray-700 text-white' :
              i === q.ans ? 'bg-green-600 text-white' :
              selected === i ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 4: Reaction Test
   ═══════════════════════════════════════ */
const ReactionTest = () => {
  const [phase, setPhase] = useState('idle');
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(null);
  const timeoutRef = useRef(null);

  const start = () => {
    setPhase('waiting');
    setResult(null);
    const delay = 1500 + Math.random() * 3500;
    timeoutRef.current = setTimeout(() => {
      setPhase('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleTap = () => {
    if (phase === 'waiting') {
      clearTimeout(timeoutRef.current);
      setPhase('idle');
      setResult('Too early!');
    } else if (phase === 'go') {
      const time = Date.now() - startTime;
      setResult(`${time}ms`);
      if (!best || time < best) setBest(time);
      setPhase('result');
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="flex flex-col items-center w-full">
      <div
        onClick={phase === 'waiting' || phase === 'go' ? handleTap : undefined}
        className={`w-full max-w-sm aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 mb-4 ${
          phase === 'waiting' ? 'bg-red-800' :
          phase === 'go' ? 'bg-green-600' :
          'bg-gray-800'
        }`}
      >
        {phase === 'idle' && (
          <>
            <p className="text-white text-lg font-bold mb-2">Reaction Test</p>
            <p className="text-gray-400 text-sm mb-4 px-4 text-center">Tap when the screen turns green</p>
            {result && <p className="text-yellow-400 mb-4">{result}</p>}
            <button onClick={start} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700">
              <FaPlay className="inline mr-2" />Start
            </button>
          </>
        )}
        {phase === 'waiting' && <p className="text-white text-2xl font-bold">Wait for green...</p>}
        {phase === 'go' && <p className="text-white text-3xl font-bold">TAP NOW!</p>}
        {phase === 'result' && (
          <>
            <p className="text-white text-3xl font-bold mb-2">{result}</p>
            {best && <p className="text-gray-300 text-sm mb-4">Best: {best}ms</p>}
            <button onClick={start} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700">
              <FaRedo className="inline mr-2" />Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 5: Word Guess (Hangman)
   ═══════════════════════════════════════ */
const WordGuess = () => {
  const shows = ['STRANGER THINGS', 'SQUID GAME', 'WEDNESDAY', 'THE CROWN', 'DARK', 'OZARK', 'NARCOS', 'BRIDGERTON', 'BLACK MIRROR', 'MONEY HEIST'];
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState('idle');
  const maxWrong = 6;

  const start = () => {
    setWord(shows[Math.floor(Math.random() * shows.length)]);
    setGuessed([]);
    setWrong(0);
    setPhase('playing');
  };

  const guess = (letter) => {
    if (guessed.includes(letter) || phase !== 'playing') return;
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= maxWrong) setPhase('lost');
    } else {
      const allFound = word.split('').every(c => c === ' ' || newGuessed.includes(c));
      if (allFound) setPhase('won');
    }
  };

  const renderWord = () => word.split('').map((c, i) => (
    <span key={i} className="text-xl sm:text-2xl font-bold mx-0.5 sm:mx-1">
      {c === ' ' ? '\u00A0\u00A0' : guessed.includes(c) ? c : '_'}
    </span>
  ));

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Guess the Show</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Guess the Netflix show title letter by letter</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (phase === 'won' || phase === 'lost') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className={`text-2xl font-bold mb-2 ${phase === 'won' ? 'text-green-400' : 'text-red-500'}`}>
          {phase === 'won' ? 'You Got It!' : 'Game Over'}
        </h3>
        <p className="text-white text-lg mb-4">{phase === 'lost' ? `It was: ${word}` : word}</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-red-500 font-bold mb-2">Wrong: {wrong}/{maxWrong}</p>
      <div className="w-full h-3 bg-gray-800 rounded-full mb-4 max-w-xs">
        <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${(wrong / maxWrong) * 100}%` }} />
      </div>
      <div className="mb-6 flex flex-wrap justify-center">{renderWord()}</div>
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2 w-full max-w-sm">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
          <button key={letter} onClick={() => guess(letter)} disabled={guessed.includes(letter)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded text-xs sm:text-sm font-bold transition-colors ${
              guessed.includes(letter)
                ? word.includes(letter) ? 'bg-green-600 text-white' : 'bg-red-900 text-gray-500'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >{letter}</button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 6: Tic Tac Toe
   ═══════════════════════════════════════ */
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [phase, setPhase] = useState('idle');
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  const check = (b) => { for (const [a,bb,c] of wins) if (b[a] && b[a]===b[bb] && b[a]===b[c]) return b[a]; return null; };
  const full = (b) => b.every(s => s !== null);

  const start = () => { setBoard(Array(9).fill(null)); setPhase('playing'); setWinner(null); };

  const play = (i) => {
    if (board[i] || phase !== 'playing' || thinking) return;
    const b = [...board]; b[i] = 'X'; setBoard(b);
    const w = check(b);
    if (w) { setWinner(w); setPhase('done'); return; }
    if (full(b)) { setPhase('done'); return; }
    setThinking(true);
    setTimeout(() => {
      const empty = b.map((s,j) => s===null?j:null).filter(j=>j!==null);
      if (empty.length) { b[empty[Math.floor(Math.random()*empty.length)]] = 'O'; setBoard([...b]); }
      const w2 = check(b);
      if (w2) { setWinner(w2); setPhase('done'); }
      else if (full(b)) setPhase('done');
      setThinking(false);
    }, 400);
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Tic Tac Toe</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Play against Netflix AI</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className={`text-2xl font-bold mb-2 ${winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-500' : 'text-yellow-400'}`}>
          {winner === 'X' ? 'You Won!' : winner === 'O' ? 'Netflix Won!' : 'Draw!'}
        </h3>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold mt-4">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-gray-300 mb-3 text-sm">{thinking ? 'Netflix is thinking...' : 'Your turn (X)'}</p>
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[240px] sm:max-w-[280px]">
        {board.map((cell, i) => (
          <button key={i} onClick={() => play(i)}
            className={`aspect-square rounded-lg text-2xl sm:text-3xl font-bold flex items-center justify-center transition-colors border border-gray-700 ${
              cell === 'X' ? 'bg-gray-800 text-red-500' : cell === 'O' ? 'bg-gray-800 text-blue-400' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >{cell}</button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 7: Color Tap
   ═══════════════════════════════════════ */
const ColorTap = () => {
  const colors = [
    { name: 'Red', bg: 'bg-red-600' },
    { name: 'Blue', bg: 'bg-blue-600' },
    { name: 'Green', bg: 'bg-green-600' },
    { name: 'Yellow', bg: 'bg-yellow-500' },
    { name: 'Purple', bg: 'bg-purple-600' },
  ];
  const [phase, setPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [best, setBest] = useState(0);
  const timerRef = useRef(null);

  const newRound = () => {
    const t = colors[Math.floor(Math.random() * colors.length)];
    setTarget(t);
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  const start = () => {
    setScore(0);
    setTimeLeft(20);
    setPhase('playing');
    newRound();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const tap = (color) => {
    if (phase !== 'playing') return;
    if (color.name === target.name) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > best) setBest(newScore);
    } else {
      setTimeLeft(prev => Math.max(prev - 2, 0));
    }
    newRound();
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Color Tap</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Tap the color that matches the name</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-2xl font-bold text-red-500 mb-2">Time's Up!</h3>
        <p className="text-white text-lg mb-1">Score: {score}</p>
        {best > 0 && <p className="text-gray-400 text-sm mb-4">Best: {best}</p>}
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full max-w-xs mb-4">
        <span className="text-white font-bold">Score: {score}</span>
        <span className="text-red-400 font-bold">{timeLeft}s</span>
      </div>
      <p className="text-white text-2xl sm:text-3xl font-bold mb-6">Tap: {target?.name}</p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {options.map((c, i) => (
          <button key={i} onClick={() => tap(c)}
            className={`${c.bg} aspect-square rounded-xl hover:opacity-80 transition-opacity`}
          />
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 8: Speed Typer
   ═══════════════════════════════════════ */
const SpeedTyper = () => {
  const titles = ['STRANGER THINGS', 'SQUID GAME', 'THE CROWN', 'WEDNESDAY', 'DARK', 'OZARK', 'NARCOS', 'BRIDGERTON', 'BLACK MIRROR', 'MONEY HEIST', 'YOU', 'LUPIN', 'COBRA KAI', 'THE WITCHER', 'LUCIFER'];
  const [phase, setPhase] = useState('idle');
  const [current, setCurrent] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [best, setBest] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const nextWord = () => setCurrent(titles[Math.floor(Math.random() * titles.length)]);

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setInput('');
    setPhase('playing');
    nextWord();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setPhase('done'); return 0; }
        return prev - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInput = (e) => {
    const val = e.target.value.toUpperCase();
    setInput(val);
    if (val === current) {
      const s = score + 1;
      setScore(s);
      if (s > best) setBest(s);
      setInput('');
      nextWord();
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Speed Typer</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Type Netflix show titles as fast as you can</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-2xl font-bold text-red-500 mb-2">Time's Up!</h3>
        <p className="text-white text-lg mb-1">You typed {score} titles</p>
        {best > 0 && <p className="text-gray-400 text-sm mb-4">Best: {best}</p>}
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full max-w-xs mb-4">
        <span className="text-white font-bold">Score: {score}</span>
        <span className="text-red-400 font-bold">{timeLeft}s</span>
      </div>
      <p className="text-red-500 text-xl sm:text-2xl font-bold mb-4 text-center">{current}</p>
      <input ref={inputRef} type="text" value={input} onChange={handleInput}
        className="w-full max-w-xs px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg focus:border-red-500 focus:outline-none"
        placeholder="Type here..."
        autoComplete="off"
      />
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 9: Rock Paper Scissors
   ═══════════════════════════════════════ */
const RockPaperScissors = () => {
  const choices = [
    { name: 'Rock', emoji: '🪨' },
    { name: 'Paper', emoji: '📄' },
    { name: 'Scissors', emoji: '✂️' },
  ];
  const [phase, setPhase] = useState('idle');
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState('');
  const [pScore, setPScore] = useState(0);
  const [aScore, setAScore] = useState(0);
  const [round, setRound] = useState(0);

  const start = () => { setPScore(0); setAScore(0); setRound(0); setPhase('playing'); setPlayerChoice(null); setAiChoice(null); setResult(''); };

  const play = (choice) => {
    if (phase !== 'playing') return;
    const ai = choices[Math.floor(Math.random() * 3)];
    setPlayerChoice(choice);
    setAiChoice(ai);
    const newRound = round + 1;
    setRound(newRound);

    let r;
    if (choice.name === ai.name) { r = 'Draw!'; }
    else if (
      (choice.name === 'Rock' && ai.name === 'Scissors') ||
      (choice.name === 'Paper' && ai.name === 'Rock') ||
      (choice.name === 'Scissors' && ai.name === 'Paper')
    ) { r = 'You Win!'; setPScore(s => s + 1); }
    else { r = 'Netflix Wins!'; setAScore(s => s + 1); }
    setResult(r);

    if (newRound >= 5) setTimeout(() => setPhase('done'), 1500);
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Rock Paper Scissors</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Best of 5 rounds against Netflix AI</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className={`text-2xl font-bold mb-2 ${pScore > aScore ? 'text-green-400' : pScore < aScore ? 'text-red-500' : 'text-yellow-400'}`}>
          {pScore > aScore ? 'You Won the Series!' : pScore < aScore ? 'Netflix Won!' : 'Series Tied!'}
        </h3>
        <p className="text-white text-lg mb-4">You {pScore} - {aScore} Netflix</p>
        <button onClick={start} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full max-w-xs mb-3">
        <span className="text-white font-bold">You: {pScore}</span>
        <span className="text-gray-400 text-sm">Round {round}/5</span>
        <span className="text-red-400 font-bold">AI: {aScore}</span>
      </div>
      {result && (
        <div className="mb-4 text-center">
          <p className="text-gray-300 text-sm">{playerChoice?.emoji} vs {aiChoice?.emoji}</p>
          <p className="text-white font-bold text-lg">{result}</p>
        </div>
      )}
      <p className="text-gray-300 mb-3 text-sm">Choose your move:</p>
      <div className="flex gap-4">
        {choices.map(c => (
          <button key={c.name} onClick={() => play(c)}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-red-500 rounded-xl flex items-center justify-center text-3xl sm:text-4xl transition-colors"
          >{c.emoji}</button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   GAME 10: Number Puzzle (Sliding)
   ═══════════════════════════════════════ */
const NumberPuzzle = () => {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState('idle');

  const init = () => {
    const pieces = Array.from({ length: 8 }, (_, i) => i + 1);
    pieces.push(null);
    let shuffled = [...pieces];
    for (let i = 0; i < 200; i++) {
      const ei = shuffled.indexOf(null);
      const possible = [];
      if (ei % 3 > 0) possible.push(ei - 1);
      if (ei % 3 < 2) possible.push(ei + 1);
      if (ei >= 3) possible.push(ei - 3);
      if (ei < 6) possible.push(ei + 3);
      const mi = possible[Math.floor(Math.random() * possible.length)];
      [shuffled[ei], shuffled[mi]] = [shuffled[mi], shuffled[ei]];
    }
    setTiles(shuffled);
    setMoves(0);
    setPhase('playing');
  };

  const solved = (t) => t.every((v, i) => i === 8 ? v === null : v === i + 1);

  const tap = (i) => {
    if (phase !== 'playing') return;
    const ei = tiles.indexOf(null);
    const canH = Math.floor(i/3) === Math.floor(ei/3) && Math.abs(i%3 - ei%3) === 1;
    const canV = Math.abs(Math.floor(i/3) - Math.floor(ei/3)) === 1 && i%3 === ei%3;
    if (canH || canV) {
      const n = [...tiles];
      [n[i], n[ei]] = [n[ei], n[i]];
      setTiles(n);
      setMoves(m => m + 1);
      if (solved(n)) setPhase('won');
    }
  };

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-xl font-bold text-red-500 mb-3">Number Puzzle</h3>
        <p className="text-gray-300 mb-6 text-center text-sm sm:text-base">Slide tiles into order (1-8)</p>
        <button onClick={init} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaPlay className="mr-2" /> Start Game
        </button>
      </div>
    );
  }

  if (phase === 'won') {
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-2xl font-bold text-green-400 mb-2">Solved!</h3>
        <p className="text-white text-lg mb-4">In {moves} moves</p>
        <button onClick={init} className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold">
          <FaRedo className="mr-2" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-gray-300 mb-3">Moves: {moves}</p>
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[220px] sm:max-w-[260px]">
        {tiles.map((t, i) => (
          <button key={i} onClick={() => tap(i)}
            className={`aspect-square rounded-lg text-xl sm:text-2xl font-bold flex items-center justify-center transition-all ${
              t === null ? 'bg-gray-900' : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
            }`}
          >{t}</button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN: MiniGames Section
   ═══════════════════════════════════════ */
const MiniGames = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);
  const location = useLocation();

  const isKidsPage = location.pathname.includes('/kids');

  const games = [
    { id: 'slots',   title: 'Emoji Slots',         icon: '🎰', component: <EmojiSlots />,        desc: 'Spin the reels and win coins!',             badge: 'TOP 10' },
    { id: 'match',   title: 'Card Match',           icon: '🃏', component: <CardMatch />,         desc: 'Find matching emoji pairs.',                badge: 'NEW' },
    { id: 'trivia',  title: 'Netflix Trivia',       icon: '❓', component: <NetflixTrivia />,     desc: 'Test your Netflix knowledge.',              badge: 'TOP 10' },
    { id: 'react',   title: 'Reaction Test',        icon: '⚡', component: <ReactionTest />,      desc: 'Tap when green. How fast are you?',         badge: 'HOT' },
    { id: 'guess',   title: 'Guess the Show',       icon: '🎬', component: <WordGuess />,         desc: 'Guess the Netflix title letter by letter.', badge: 'TOP 10' },
    { id: 'ttt',     title: 'Tic Tac Toe',          icon: '❌', component: <TicTacToe />,         desc: 'Play against Netflix AI.',                  badge: 'NEW' },
    { id: 'color',   title: 'Color Tap',            icon: '🎨', component: <ColorTap />,          desc: 'Tap the matching color fast!',              badge: 'HOT' },
    { id: 'type',    title: 'Speed Typer',          icon: '⌨️', component: <SpeedTyper />,        desc: 'Type Netflix titles against the clock.',    badge: 'NEW' },
    { id: 'rps',     title: 'Rock Paper Scissors',  icon: '✊', component: <RockPaperScissors />, desc: 'Best of 5 vs Netflix AI.',                  badge: 'TOP 10' },
    { id: 'puzzle',  title: 'Number Puzzle',        icon: '🧩', component: <NumberPuzzle />,      desc: 'Slide tiles into the right order.',         badge: 'HOT' },
  ];

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

  const startDrag = (e) => { isDragging.current = true; startX.current = e.pageX - sliderRef.current.offsetLeft; scrollLeftRef.current = sliderRef.current.scrollLeft; };
  const onDrag = (e) => { if (!isDragging.current) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; sliderRef.current.scrollLeft = scrollLeftRef.current - (x - startX.current) * 2; };
  const stopDrag = () => { isDragging.current = false; };

  const openGame = (id) => { setActiveGame(id); setShowModal(true); };
  const closeGame = () => setShowModal(false);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') closeGame(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <div className="bg-[#141414] py-8 w-full">
      <div className="mx-auto">
        {isKidsPage ? (
          <h2 className="text-4xl font-bold mb-8 text-white flex items-center px-4 sm:px-10">
            <span className="text-5xl mr-4">🎮</span>Game Zone<span className="text-5xl ml-4">🎮</span>
          </h2>
        ) : (
          <h2 className="ml-4 sm:ml-10 text-lg sm:text-xl font-['Poppins'] text-white mb-6">Netflix Games</h2>
        )}

        <div className="relative group">
          <button className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 sm:w-12 sm:h-12 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={scrollLeft}>
            <FaChevronLeft className="text-white" size={20} />
          </button>

          <div ref={sliderRef} className="flex gap-3 sm:gap-4 px-4 sm:px-10 overflow-x-auto overflow-y-hidden no-scrollbar pb-4 cursor-grab active:cursor-grabbing"
            onMouseDown={startDrag} onMouseLeave={stopDrag} onMouseUp={stopDrag} onMouseMove={onDrag}
          >
            {games.map((game) => (
              <div key={game.id} onClick={() => openGame(game.id)}
                className="flex-none w-[200px] sm:w-[280px] relative group/card cursor-pointer transition-transform duration-300"
              >
                <div className="relative aspect-video rounded overflow-hidden border border-gray-700 bg-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                  {game.badge && (
                    <div className="absolute top-0 right-0 z-10 bg-red-600 flex items-center justify-center py-0.5 px-1.5"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
                    >
                      <span className="text-white text-[9px] font-bold leading-tight">{game.badge}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center ">
                    <span className="text-4xl sm:text-5xl mb-2">{game.icon}</span>
                    <h3 className="text-white text-sm sm:text-base font-bold text-center">{game.title}</h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs text-center mt-1 line-clamp-2">{game.desc}</p>
                    <button className="mt-2 bg-white text-black px-4 py-1.5 rounded text-xs sm:text-sm font-semibold opacity-0 group-hover/card:opacity-100 transition-all translate-y-2 group-hover/card:translate-y-0">
                      ▶ Play
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 sm:w-12 sm:h-12 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={scrollRight}>
            <FaChevronRight className="text-white" size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && activeGame && (
          <motion.div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-3 sm:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeGame}
          >
            <motion.div
              className="bg-[#141414] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative border border-gray-800"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="absolute top-3 right-3 text-gray-400 hover:text-white z-10" onClick={closeGame}>
                <FaTimes size={22} />
              </button>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{games.find(g => g.id === activeGame)?.icon}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{games.find(g => g.id === activeGame)?.title}</h3>
              </div>
              <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-lg border border-gray-800">
                {games.find(g => g.id === activeGame)?.component}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MiniGames;
