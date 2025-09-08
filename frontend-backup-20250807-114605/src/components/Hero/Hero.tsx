import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">
            Лучший агрегатор авто и компаний
          </h1>
          <p className="hero__subtitle">
            Найдите идеальный автомобиль и надежную компанию для покупки
          </p>
          <div className="hero__actions">
            <Link to="/cars" className="button button--primary button--lg">
              Смотреть подборки
            </Link>
            <Link to="/about" className="button button--tertiary button--lg">
              Узнать больше
            </Link>
          </div>
        </div>
        <div className="hero__image">
          <img 
            src="/images/hero-car.jpg" 
            alt="Luxury car" 
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero; 