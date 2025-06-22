FROM node:18-alpine

WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование проекта
COPY . .

# Очистка кэша
RUN npm run clean

# Запуск сервера разработки
CMD ["npm", "start"] 