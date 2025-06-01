import { useEffect, useState } from 'react';
import './NetflixIntro.css';

const NetflixIntro = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const text = "NISHANT VIDHURI";
  const characters = text.split('');
  const midIndex = (characters.length - 1) / 2; // Adjust midIndex calculation for even/odd length

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3000); // Animation duration

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="netflix-intro">
      <div className="netflix-intro-content">
        <div className="netflix-logo">
          {characters.map((char, index) => {
            // Calculate translation using a squared distance for a smoother curve
            const distance = index - midIndex;
            const translation = Math.pow(distance, 2) * 0.5 - 20; // Adjust multipliers (0.5 and 20) for desired curve
            return (
              <span
                key={index}
                className="netflix-text-char"
                style={{ transform: `translateY(${translation}px)` }}
              >
                {char === ' ' ? '\u00A0' : char} {/* Render space as non-breaking space */}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NetflixIntro; 