import React from 'react';
import './About.css';

const features = [
  {
    icon: '🚗',
    title: 'Большой выбор',
    description: 'Тысячи автомобилей от проверенных компаний'
  },
  {
    icon: '✅',
    title: 'Проверенные компании',
    description: 'Только надежные автосалоны с верификацией'
  },
  {
    icon: '💰',
    title: 'Лучшие цены',
    description: 'Сравнивайте цены и находите выгодные предложения'
  },
  {
    icon: '🔍',
    title: 'Умный поиск',
    description: 'Быстрый поиск по всем параметрам автомобиля'
  }
];

const About = () => {
  return (
    <section className="about">
      <div className="about__container">
        <div className="about__header">
          <h2 className="about__title">О проекте</h2>
          <p className="about__subtitle">
            VELES AUTO — это современный агрегатор автомобилей и компаний, 
            который помогает найти идеальный автомобиль и надежного продавца
          </p>
        </div>

        <div className="about__features">
          {features.map((feature, index) => (
            <div key={index} className="about__feature">
              <div className="about__feature-icon">{feature.icon}</div>
              <h3 className="about__feature-title">{feature.title}</h3>
              <p className="about__feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="about__mission">
          <h3 className="about__mission-title">Наша миссия</h3>
          <p className="about__mission-text">
            Мы стремимся сделать процесс покупки автомобиля максимально 
            простым, прозрачным и безопасным для каждого клиента
          </p>
        </div>
      </div>
    </section>
  );
};

export default About; 