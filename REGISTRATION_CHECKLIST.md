# 📋 Чек-лист регистрации для VELES AUTO

## 🎯 Обязательные сервисы (для запуска)

### 1. 🔐 Telegram Bot & Mini App
- [ ] **BotFather** (https://t.me/BotFather)
  - [ ] Создать бота: `/newbot`
  - [ ] Получить `TELEGRAM_BOT_TOKEN`
  - [ ] Создать канал: `/newchannel`
  - [ ] Получить `TELEGRAM_CHANNEL_ID`
  - [ ] Создать Mini App: `/newapp`
  - [ ] Получить `TELEGRAM_MINI_APP_TOKEN`

### 2. 📧 Email (Gmail)
- [ ] **Gmail** (https://gmail.com)
  - [ ] Создать аккаунт или использовать существующий
  - [ ] Включить 2FA
  - [ ] Создать пароль приложения
  - [ ] Получить `EMAIL_HOST_USER` и `EMAIL_HOST_PASSWORD`

### 3. 🐛 Sentry (мониторинг ошибок)
- [ ] **Sentry** (https://sentry.io)
  - [ ] Зарегистрироваться
  - [ ] Создать проект для Django
  - [ ] Получить `SENTRY_DSN`

## 🌐 Социальная аутентификация

### 4. 🔍 Google OAuth2
- [ ] **Google Cloud Console** (https://console.developers.google.com/)
  - [ ] Создать проект
  - [ ] Включить Google+ API
  - [ ] Создать OAuth 2.0 credentials
  - [ ] Получить `GOOGLE_CLIENT_ID` и `GOOGLE_SECRET`

### 5. 📘 VK OAuth2
- [ ] **VK Developers** (https://vk.com/dev)
  - [ ] Создать приложение
  - [ ] Получить `VK_CLIENT_ID` и `VK_SECRET`

### 6. 📘 Facebook OAuth2
- [ ] **Facebook Developers** (https://developers.facebook.com/)
  - [ ] Создать приложение
  - [ ] Получить `FACEBOOK_APP_ID` и `FACEBOOK_APP_SECRET`

## 💳 Платежные системы

### 7. 💳 Stripe
- [ ] **Stripe** (https://stripe.com)
  - [ ] Зарегистрироваться
  - [ ] Получить `STRIPE_PUBLIC_KEY` и `STRIPE_SECRET_KEY`
  - [ ] Настроить webhook для `STRIPE_WEBHOOK_SECRET`

### 8. 💳 ЮKassa (для России)
- [ ] **ЮKassa** (https://yookassa.ru)
  - [ ] Зарегистрироваться как ИП/ООО
  - [ ] Получить `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`

## 📊 Аналитика и SEO

### 9. 📈 Google Analytics
- [ ] **Google Analytics** (https://analytics.google.com/)
  - [ ] Создать аккаунт
  - [ ] Создать ресурс для veles-drive.ru
  - [ ] Получить `GOOGLE_ANALYTICS_ID`

### 10. 📊 Yandex Metrika
- [ ] **Yandex Metrika** (https://metrika.yandex.ru/)
  - [ ] Создать счетчик
  - [ ] Получить `YANDEX_METRIKA_ID`

### 11. 🔍 Google Search Console
- [ ] **Google Search Console** (https://search.google.com/search-console)
  - [ ] Добавить сайт veles-drive.ru
  - [ ] Подтвердить владение
  - [ ] Получить `GOOGLE_SEARCH_CONSOLE_VERIFICATION`

## 🎥 Контент и API

### 12. 📺 YouTube API
- [ ] **Google Cloud Console** (https://console.developers.google.com/)
  - [ ] Включить YouTube Data API v3
  - [ ] Создать API ключ
  - [ ] Получить `YOUTUBE_API_KEY`
  - [ ] Создать YouTube канал для `YOUTUBE_CHANNEL_ID`

### 13. 🌤️ OpenWeatherMap
- [ ] **OpenWeatherMap** (https://openweathermap.org/api)
  - [ ] Зарегистрироваться
  - [ ] Получить `OPENWEATHER_API_KEY`

## ☁️ Облачные сервисы

### 14. ☁️ AWS S3 (для бэкапов)
- [ ] **AWS** (https://aws.amazon.com/)
  - [ ] Создать аккаунт
  - [ ] Создать IAM пользователя
  - [ ] Получить `AWS_ACCESS_KEY_ID` и `AWS_SECRET_ACCESS_KEY`
  - [ ] Создать bucket для `AWS_STORAGE_BUCKET_NAME`

### 15. ☁️ Yandex Cloud (альтернатива)
- [ ] **Yandex Cloud** (https://cloud.yandex.ru/)
  - [ ] Зарегистрироваться
  - [ ] Создать сервисный аккаунт
  - [ ] Получить `YANDEX_CLOUD_ACCESS_KEY` и `YANDEX_CLOUD_SECRET_KEY`

## 📱 Дополнительные сервисы

### 16. 📞 Twilio (SMS)
- [ ] **Twilio** (https://www.twilio.com/)
  - [ ] Зарегистрироваться
  - [ ] Получить `TWILIO_ACCOUNT_SID` и `TWILIO_AUTH_TOKEN`
  - [ ] Купить номер для `TWILIO_PHONE_NUMBER`

### 17. 📧 SendGrid (Email маркетинг)
- [ ] **SendGrid** (https://sendgrid.com/)
  - [ ] Зарегистрироваться
  - [ ] Получить `SENDGRID_API_KEY`

### 18. 🛡️ Cloudflare (CDN и DNS)
- [ ] **Cloudflare** (https://cloudflare.com/)
  - [ ] Зарегистрироваться
  - [ ] Добавить домен veles-drive.ru
  - [ ] Получить `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ZONE_ID`

## 🌐 DNS настройки

### 19. 📍 DNS записи
- [ ] Настроить A записи для всех поддоменов:
  - [ ] `veles-drive.ru` → IP сервера
  - [ ] `www.veles-drive.ru` → IP сервера
  - [ ] `api.veles-drive.ru` → IP сервера
  - [ ] `tg.veles-drive.ru` → IP сервера
  - [ ] `admin.veles-drive.ru` → IP сервера
  - [ ] `cdn.veles-drive.ru` → IP сервера (опционально)

## 🔐 Безопасность

### 20. 🔑 Генерация ключей
- [ ] Сгенерировать `DJANGO_SECRET_KEY`:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] Сгенерировать пароли для базы данных
- [ ] Сгенерировать пароли для MinIO

## 📝 Заполнение .env файла

### 21. 📄 Обновление переменных
- [ ] Скопировать `env.example` в `.env`
- [ ] Заменить все `your-*` значения на реальные
- [ ] Проверить все URL'ы и домены
- [ ] Убедиться в корректности всех ключей

## 🚀 Тестирование

### 22. ✅ Проверка подключений
- [ ] Проверить подключение к Telegram Bot
- [ ] Проверить отправку email
- [ ] Проверить подключение к Sentry
- [ ] Проверить работу платежных систем
- [ ] Проверить подключение к облачным сервисам

## 📋 Приоритеты регистрации

### 🔴 Критично (для запуска):
1. Telegram Bot & Mini App
2. Email (Gmail)
3. Sentry
4. DNS настройки

### 🟡 Важно (для полного функционала):
5. Google OAuth2
6. VK OAuth2
7. Google Analytics
8. Yandex Metrika

### 🟢 Опционально (для расширенного функционала):
9. Платежные системы
10. YouTube API
11. Облачные сервисы
12. Дополнительные сервисы

## 💡 Полезные ссылки

- **Документация Django**: https://docs.djangoproject.com/
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Telegram Mini Apps**: https://core.telegram.org/bots/webapps
- **Docker документация**: https://docs.docker.com/
- **Nginx документация**: https://nginx.org/en/docs/

## ⚠️ Важные замечания

1. **Безопасность**: Никогда не коммитьте `.env` файл в git
2. **Резервные копии**: Сохраните все ключи в безопасном месте
3. **Тестирование**: Всегда тестируйте на staging окружении
4. **Мониторинг**: Настройте алерты для критических сервисов
5. **Обновления**: Регулярно обновляйте зависимости и сервисы 