import { useEffect, useState } from 'react';
import './NetflixIntro.css';

const NetflixIntro = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const text = "NISHANT VIDHURI";
  const characters = text.split('');
  const midIndex = (characters.length - 1) / 2;

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
            const distance = index - midIndex;
            // Adjust these multipliers for desired curve on different screen sizes
            // For desktop, current values are Math.pow(distance, 2) * 0.5 - 20;
            // For mobile, you might need smaller values for a smoother curve
            const translation = Math.pow(distance, 2) * 0.3 - 10; // Example adjusted values for mobile

            return (
              <span
                key={index}
                className="netflix-text-char"
                style={{ transform: `translateY(${translation}px)` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NetflixIntro; 