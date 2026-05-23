import React, { useState, useEffect } from 'react';
import './ScrollToTopButton.css'; // Don't forget to create this CSS file!

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // The button shows up after the user scrolls down 300 pixels
      window.scrollY > 300 ? setIsVisible(true) : setIsVisible(false);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return isVisible && (
    <button 
      className="scroll-to-top" 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑ Top
    </button>
  );
};

export default ScrollToTopButton;