import apiClient from './client';

// Сервис для работы с пользовательскими данными
// Система управления пользовательскими профилями и аутентификацией
class UsersService {
  // Аутентификация пользователя
  // Параметры: credentials - объект с данными для входа
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { accessToken, refreshToken } = response.data;
      
      // Сохранение токенов в локальное хранилище
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Регистрация нового пользователя
  // Параметры: userData - данные нового пользователя
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Выход из системы
  // Удаление токенов и очистка сессии
  async logout() {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение данных текущего пользователя
  // Возвращает профиль авторизованного пользователя
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Обновление профиля пользователя
  // Параметры: data - новые данные профиля
  async updateProfile(data) {
    try {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Изменение пароля
  // Параметры: data - объект с текущим и новым паролем
  async changePassword(data) {
    try {
      const response = await apiClient.post('/users/me/change-password', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение избранных автомобилей
  // Возвращает список сохраненных автомобилей
  async getFavorites() {
    try {
      const response = await apiClient.get('/users/me/favorites');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Добавление автомобиля в избранное
  // Параметры: carId - идентификатор автомобиля
  async addToFavorites(carId) {
    try {
      const response = await apiClient.post('/users/me/favorites', { carId });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Удаление автомобиля из избранного
  // Параметры: carId - идентификатор автомобиля
  async removeFromFavorites(carId) {
    try {
      const response = await apiClient.delete(`/users/me/favorites/${carId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение уведомлений пользователя
  // Возвращает список непрочитанных уведомлений
  async getNotifications() {
    try {
      const response = await apiClient.get('/users/me/notifications');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Отметка уведомления как прочитанного
  // Параметры: notificationId - идентификатор уведомления
  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/users/me/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Обработка ошибок API
  // Стандартизированный формат ошибок для всех запросов
  handleError(error) {
    if (error.response) {
      // Ошибка от сервера
      return {
        error: true,
        status: error.response.status,
        message: error.response.data.message || 'Ошибка сервера'
      };
    } else if (error.request) {
      // Ошибка сети
      return {
        error: true,
        status: 0,
        message: 'Ошибка сети'
      };
    } else {
      // Ошибка конфигурации
      return {
        error: true,
        status: 0,
        message: 'Ошибка конфигурации'
      };
    }
  }
}

export default new UsersService(); 