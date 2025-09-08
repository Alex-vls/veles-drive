import React, { useRef } from 'react';
import './ScrollSection.css';

const ScrollSection = ({
  title,
  subtitle,
  children,
  showControls = true,
}) => {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="scroll-section">
      <div className="scroll-section__header">
        <div className="scroll-section__titles">
          <h2 className="scroll-section__title">{title}</h2>
          {subtitle && (
            <p className="scroll-section__subtitle">{subtitle}</p>
          )}
        </div>
        
        {showControls && (
          <div className="scroll-section__controls">
            <button
              className="scroll-section__control scroll-section__control--prev"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              className="scroll-section__control scroll-section__control--next"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        )}
      </div>

      <div className="scroll-section__container" ref={scrollContainerRef}>
        <div className="scroll-section__content">
          {children}
        </div>
      </div>
    </section>
  );
};

export default ScrollSection; 