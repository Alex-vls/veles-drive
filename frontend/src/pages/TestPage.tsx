import React, { useState } from 'react';
import Header from '../components/design/Header';
import HeroSection from '../components/design/HeroSection';
import CarCard from '../components/design/CarCard';
import ThemeToggle from '../components/design/ThemeToggle';
import { Button, Input, Modal, Loading } from '../components/ui';
import './TestPage.css';

const TestPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCatalogClick = () => {
    console.log('Каталог автомобилей');
  };

  const handleMenuClick = () => {
    console.log('Меню');
  };

  const handleFavoritesClick = () => {
    console.log('Избранное');
  };

  const handleProfileClick = () => {
    console.log('Профиль');
  };

  const handleCarClick = (id: string) => {
    console.log('Клик по автомобилю:', id);
  };

  const handleFavoriteClick = (id: string) => {
    console.log('Добавить в избранное:', id);
  };

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  // Тестовые данные для карточки автомобиля
  const testCar = {
    id: '1',
    brand: 'Rolls-Royce',
    model: 'Cullinan',
    image: 'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Rolls-Royce+Cullinan',
    price: 74400000,
    specs: {
      year: 2025,
      mileage: 5,
      maxSpeed: 250,
      power: 571,
      acceleration: 5.2
    },
    badge: 'ПРЕДЛОЖЕНИЕ НЕДЕЛИ',
    isFavorite: false,
    images: [
      'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Image+1',
      'https://via.placeholder.com/400x250/2a2a2a/ffffff?text=Image+2',
      'https://via.placeholder.com/400x250/3a3a3a/ffffff?text=Image+3'
    ]
  };

  return (
    <div className="test-page">
      <Header
        onMenuClick={handleMenuClick}
        onFavoritesClick={handleFavoritesClick}
        onProfileClick={handleProfileClick}
      />
      
      <main className="test-page__content">
        <div className="container">
          <h1 className="test-page__title">Тестовая страница компонентов</h1>
          
          {/* Hero секция */}
          <section className="test-section">
            <h2>Hero Section</h2>
            <HeroSection onCatalogClick={handleCatalogClick} />
          </section>

          {/* UI компоненты */}
          <section className="test-section">
            <h2>UI Компоненты</h2>
            
            <div className="test-grid">
              {/* Кнопки */}
              <div className="test-item">
                <h3>Кнопки</h3>
                <div className="test-buttons">
                  <Button variant="primary" size="small">Primary Small</Button>
                  <Button variant="primary" size="medium">Primary Medium</Button>
                  <Button variant="primary" size="large">Primary Large</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button 
                    icon="🚀" 
                    iconPosition="left"
                    onClick={handleLoadingTest}
                  >
                    With Icon
                  </Button>
                </div>
              </div>

              {/* Инпуты */}
              <div className="test-item">
                <h3>Инпуты</h3>
                <div className="test-inputs">
                  <Input 
                    placeholder="Обычный инпут"
                    value={inputValue}
                    onChange={setInputValue}
                  />
                  <Input 
                    type="search"
                    placeholder="Поиск..."
                  />
                  <Input 
                    label="Email"
                    type="email"
                    placeholder="example@email.com"
                    required
                  />
                  <Input 
                    label="Пароль"
                    type="password"
                    placeholder="Введите пароль"
                    error="Пароль слишком короткий"
                  />
                  <Input 
                    disabled
                    placeholder="Отключенный инпут"
                  />
                </div>
              </div>

              {/* Модальное окно */}
              <div className="test-item">
                <h3>Модальное окно</h3>
                <Button onClick={() => setIsModalOpen(true)}>
                  Открыть модальное окно
                </Button>
                
                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title="Тестовое модальное окно"
                  size="medium"
                >
                  <p>Это тестовое модальное окно для демонстрации компонента.</p>
                  <div className="modal-actions">
                    <Button onClick={() => setIsModalOpen(false)}>
                      Закрыть
                    </Button>
                  </div>
                </Modal>
              </div>

              {/* Загрузка */}
              <div className="test-item">
                <h3>Загрузка</h3>
                <div className="test-loading">
                  <Loading type="spinner" size="small" />
                  <Loading type="dots" size="medium" />
                  <Loading type="pulse" size="large" />
                  <Loading type="bars" text="Загрузка..." />
                  {isLoading && <Loading type="spinner" fullScreen text="Загрузка данных..." />}
                </div>
              </div>
            </div>
          </section>

          {/* Карточка автомобиля */}
          <section className="test-section">
            <h2>Карточка автомобиля</h2>
            <div className="test-car-card">
              <CarCard
                {...testCar}
                onClick={handleCarClick}
                onFavoriteClick={handleFavoriteClick}
              />
            </div>
          </section>

          {/* Переключатель темы */}
          <section className="test-section">
            <h2>Переключатель темы</h2>
            <div className="test-theme-toggle">
              <ThemeToggle size="small" />
              <ThemeToggle size="medium" />
              <ThemeToggle size="large" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TestPage; 