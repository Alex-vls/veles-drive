# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Создаем пользователя для безопасности
RUN useradd --create-home --shell /bin/bash veles

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.txt pyproject.toml ./

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY . .

# Создаем необходимые директории
RUN mkdir -p /app/staticfiles /app/mediafiles /app/uploads /app/logs

# Устанавливаем права доступа
RUN chown -R veles:veles /app

# Переключаемся на пользователя veles
USER veles

# Собираем статические файлы
RUN python manage.py collectstatic --noinput

# Создаем health check endpoint
RUN echo 'from django.http import HttpResponse\n\
def health_check(request):\n\
    return HttpResponse("ok", content_type="text/plain")' > /app/health_check.py

# Открываем порт
EXPOSE 8000

# Запускаем приложение
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "--keep-alive", "5", "veles_auto.wsgi:application"] 