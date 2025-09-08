#!/bin/bash

# Скрипт для полной перестройки фронтенда ВЕЛЕС АВТО
# Основан на анализе 35 скриншотов дизайна

set -e  # Остановить выполнение при ошибке

echo "🚀 Начинаем полную перестройку фронтенда ВЕЛЕС АВТО"
echo "=================================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для логирования
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка наличия необходимых директорий
check_prerequisites() {
    log_info "Проверка предварительных условий..."
    
    if [ ! -d "frontend" ]; then
        log_error "Директория frontend не найдена!"
        exit 1
    fi
    
    if [ ! -d "design-analysis" ]; then
        log_error "Директория design-analysis не найдена! Сначала запустите анализ дизайна."
        exit 1
    fi
    
    log_success "Предварительные условия выполнены"
}

# Создание резервной копии
create_backup() {
    log_info "Создание резервной копии текущего фронтенда..."
    
    BACKUP_DIR="frontend-backup-$(date +%Y%m%d-%H%M%S)"
    
    if cp -r frontend "$BACKUP_DIR"; then
        log_success "Резервная копия создана: $BACKUP_DIR"
    else
        log_error "Ошибка при создании резервной копии"
        exit 1
    fi
}

# Сохранение важных файлов
save_important_files() {
    log_info "Сохранение важных файлов..."
    
    mkdir -p temp-backup
    
    # Сохранить важные конфигурации
    if [ -f "frontend/package.json" ]; then
        cp frontend/package.json temp-backup/
    fi
    
    if [ -f "frontend/tsconfig.json" ]; then
        cp frontend/tsconfig.json temp-backup/
    fi
    
    if [ -f "frontend/public/index.html" ]; then
        cp frontend/public/index.html temp-backup/
    fi
    
    # Сохранить типы TypeScript
    if [ -d "frontend/src/types" ]; then
        cp -r frontend/src/types temp-backup/
    fi
    
    # Сохранить сервисы API
    if [ -d "frontend/src/services" ]; then
        cp -r frontend/src/services temp-backup/
    fi
    
    log_success "Важные файлы сохранены в temp-backup/"
}

# Очистка старого фронтенда
clean_old_frontend() {
    log_info "Очистка старого фронтенда..."
    
    cd frontend/src
    
    # Удалить старые компоненты (кроме design/)
    log_info "Удаление старых компонентов..."
    rm -rf users erp forms reviews cars companies
    rm -f Modal.tsx Notifications.tsx Pagination.tsx PrivateRoute.tsx ProtectedRoute.tsx
    rm -f Sort.tsx Layout.tsx Loading.tsx ErrorBoundary.tsx Filters.tsx
    rm -rf OptimizedImage SchemaOrg ScrollSection VirtualList
    rm -rf Header Hero LoadingSpinner CompanyCard
    rm -rf Footer About AttributeCard Button CarCard Cards
    
    # Удалить старые страницы
    log_info "Удаление старых страниц..."
    rm -f Home.tsx Settings.tsx Login.tsx Register.tsx Profile.tsx
    rm -f News.tsx NewsDetails.tsx NotFound.tsx Notifications.tsx
    rm -f Moderation.tsx ErpDashboard.tsx ErpDashboard.css
    rm -f TelegramApp.tsx TelegramApp.css
    rm -f ArticleForm.tsx Articles.tsx ArticleDetails.tsx
    rm -f CarCreate.tsx CarDetail.tsx CarDetails.tsx CarEdit.tsx Cars.tsx
    rm -f CompanyCreate.tsx CompanyDetail.tsx CompanyDetails.tsx CompanyEdit.tsx Companies.tsx
    rm -rf vehicles
    
    # Удалить старые стили
    log_info "Удаление старых стилей..."
    rm -rf styles/*
    
    cd ../..
    
    log_success "Старый фронтенд очищен"
}

# Создание новой структуры
create_new_structure() {
    log_info "Создание новой структуры проекта..."
    
    cd frontend/src
    
    # Создать новые директории
    mkdir -p components/{ui,layout,features}
    mkdir -p pages
    mkdir -p styles/{base,components,utilities}
    mkdir -p hooks utils types services store contexts
    
    cd ../..
    
    log_success "Новая структура создана"
}

# Настройка дизайн-системы
setup_design_system() {
    log_info "Настройка дизайн-системы..."
    
    # Копировать дизайн-токены
    if [ -f "design-analysis/styles/variables.css" ]; then
        cp design-analysis/styles/variables.css frontend/src/styles/base/
        log_success "Дизайн-токены скопированы"
    fi
    
    if [ -f "design-analysis/styles/components.css" ]; then
        cp design-analysis/styles/components.css frontend/src/styles/components/
        log_success "Стили компонентов скопированы"
    fi
    
    # Создать основной CSS файл
    cat > frontend/src/styles/index.css << 'EOF'
/* Основные стили ВЕЛЕС АВТО */

/* Импорт дизайн-токенов */
@import './base/variables.css';

/* Импорт стилей компонентов */
@import './components/components.css';

/* Глобальные стили */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  transition: all var(--transition-speed) ease;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: var(--color-background-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: all var(--transition-speed) ease;
}

/* Утилитарные классы */
.container {
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Плавные переходы для смены темы */
* {
  transition: background-color var(--transition-speed) ease,
              color var(--transition-speed) ease,
              border-color var(--transition-speed) ease,
              box-shadow var(--transition-speed) ease;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
}
EOF
    
    log_success "Дизайн-система настроена"
}

# Восстановление важных файлов
restore_important_files() {
    log_info "Восстановление важных файлов..."
    
    if [ -d "temp-backup" ]; then
        # Восстановить package.json
        if [ -f "temp-backup/package.json" ]; then
            cp temp-backup/package.json frontend/
        fi
        
        # Восстановить tsconfig.json
        if [ -f "temp-backup/tsconfig.json" ]; then
            cp temp-backup/tsconfig.json frontend/
        fi
        
        # Восстановить index.html
        if [ -f "temp-backup/index.html" ]; then
            cp temp-backup/index.html frontend/public/
        fi
        
        # Восстановить типы
        if [ -d "temp-backup/types" ]; then
            cp -r temp-backup/types frontend/src/
        fi
        
        # Восстановить сервисы
        if [ -d "temp-backup/services" ]; then
            cp -r temp-backup/services frontend/src/
        fi
        
        log_success "Важные файлы восстановлены"
    fi
}

# Обновление index.tsx
update_index_tsx() {
    log_info "Обновление index.tsx..."
    
    cat > frontend/src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
    
    log_success "index.tsx обновлен"
}

# Создание базового App.tsx
create_basic_app() {
    log_info "Создание базового App.tsx..."
    
    cat > frontend/src/App.tsx << 'EOF'
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
EOF
    
    log_success "App.tsx создан"
}

# Установка зависимостей
install_dependencies() {
    log_info "Проверка и установка зависимостей..."
    
    cd frontend
    
    # Проверить, есть ли node_modules
    if [ ! -d "node_modules" ]; then
        log_info "Установка зависимостей..."
        npm install
    else
        log_info "Зависимости уже установлены"
    fi
    
    # Установить дополнительные зависимости для нового фронтенда
    log_info "Установка дополнительных зависимостей..."
    npm install react-router-dom @types/react-router-dom
    npm install @reduxjs/toolkit react-redux @types/react-redux
    npm install axios
    npm install react-helmet-async
    npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event
    
    cd ..
    
    log_success "Зависимости установлены"
}

# Финальная проверка
final_check() {
    log_info "Финальная проверка..."
    
    # Проверить структуру
    if [ -d "frontend/src/components/design" ]; then
        log_success "Компоненты дизайна на месте"
    else
        log_warning "Компоненты дизайна не найдены"
    fi
    
    if [ -f "frontend/src/styles/base/variables.css" ]; then
        log_success "Дизайн-токены на месте"
    else
        log_warning "Дизайн-токены не найдены"
    fi
    
    if [ -f "frontend/src/App.tsx" ]; then
        log_success "App.tsx создан"
    else
        log_error "App.tsx не найден"
    fi
    
    log_success "Финальная проверка завершена"
}

# Основная функция
main() {
    echo "Начинаем процесс перестройки фронтенда..."
    echo ""
    
    check_prerequisites
    create_backup
    save_important_files
    clean_old_frontend
    create_new_structure
    setup_design_system
    restore_important_files
    update_index_tsx
    create_basic_app
    install_dependencies
    final_check
    
    echo ""
    echo "🎉 Перестройка фронтенда завершена!"
    echo ""
    echo "📁 Структура проекта:"
    echo "   frontend/src/"
    echo "   ├── components/"
    echo "   │   ├── design/     (готовые компоненты)"
    echo "   │   ├── ui/         (базовые UI компоненты)"
    echo "   │   ├── layout/     (layout компоненты)"
    echo "   │   └── features/   (feature компоненты)"
    echo "   ├── pages/          (страницы)"
    echo "   ├── styles/         (стили)"
    echo "   ├── hooks/          (кастомные хуки)"
    echo "   ├── utils/          (утилиты)"
    echo "   ├── types/          (TypeScript типы)"
    echo "   ├── services/       (API сервисы)"
    echo "   ├── store/          (Redux store)"
    echo "   └── contexts/       (React contexts)"
    echo ""
    echo "🚀 Следующие шаги:"
    echo "   1. Запустить: cd frontend && npm start"
    echo "   2. Проверить работу Header и HeroSection"
    echo "   3. Начать создание остальных компонентов"
    echo "   4. Следовать плану из FRONTEND_REBUILD_PLAN.md"
    echo ""
    echo "📋 Резервная копия сохранена в: frontend-backup-*"
    echo ""
}

# Запуск скрипта
main "$@" 