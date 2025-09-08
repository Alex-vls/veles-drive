import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/design/Header';
import HeroSection from './components/design/HeroSection';

function App() {
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

  return (
    <Router>
      <div className="App">
        <Header
          onMenuClick={handleMenuClick}
          onFavoritesClick={handleFavoritesClick}
          onProfileClick={handleProfileClick}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <HeroSection onCatalogClick={handleCatalogClick} />
            } 
          />
          {/* Другие маршруты будут добавлены позже */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
