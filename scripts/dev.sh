#!/bin/bash

echo "🚀 Запуск VELES AUTO в режиме разработки..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose -f docker-compose.dev.yml down

# Удаление старых volumes (опционально)
read -p "Удалить старые данные базы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Удаление старых данных..."
    docker-compose -f docker-compose.dev.yml down -v
fi

# Сборка и запуск контейнеров
echo "🔨 Сборка контейнеров..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Запуск сервисов..."
docker-compose -f docker-compose.dev.yml up -d

# Ожидание готовности базы данных
echo "⏳ Ожидание готовности базы данных..."
sleep 10

# Выполнение миграций
echo "📦 Выполнение миграций..."
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Создание суперпользователя
echo "👤 Создание суперпользователя..."
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser --noinput --username admin --email admin@veles-auto.com

# Загрузка демо-данных
echo "📊 Загрузка демо-данных..."
docker-compose -f docker-compose.dev.yml exec backend python manage.py load_demo_data

# Сборка статических файлов
echo "📁 Сборка статических файлов..."
docker-compose -f docker-compose.dev.yml exec backend python manage.py collectstatic --noinput

echo ""
echo "✅ VELES AUTO запущен в режиме разработки!"
echo ""
echo "🌐 Доступные сервисы:"
echo "   • Основной сайт: http://localhost:3000"
echo "   • Telegram Mini App: http://localhost:3001"
echo "   • API Backend: http://localhost:8000"
echo "   • Admin панель: http://localhost:8000/admin"
echo ""
echo "👤 Админ панель:"
echo "   • Логин: admin"
echo "   • Email: admin@veles-auto.com"
echo "   • Пароль: admin"
echo ""
echo "📊 Мониторинг контейнеров:"
echo "   docker-compose -f docker-compose.dev.yml ps"
echo ""
echo "📝 Логи:"
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 Остановка:"
echo "   docker-compose -f docker-compose.dev.yml down" 