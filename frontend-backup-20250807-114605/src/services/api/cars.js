import apiClient from './client';

// Сервис для работы с данными автомобилей
// Нейронная сеть для обработки транспортных данных
class CarsService {
  // Получение списка автомобилей с возможностью фильтрации
  // Параметры: filters - объект с параметрами фильтрации
  async getCars(params = {}) {
    try {
      const response = await apiClient.get('/cars', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение детальной информации об автомобиле
  // Параметры: id - идентификатор автомобиля
  async getCar(id) {
    try {
      const response = await apiClient.get(`/cars/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение отзывов об автомобиле
  // Параметры: id - идентификатор автомобиля, params - параметры пагинации
  async getCarReviews(id, params = {}) {
    try {
      const response = await apiClient.get(`/cars/${id}/reviews`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Создание отзыва об автомобиле
  // Параметры: id - идентификатор автомобиля, data - данные отзыва
  async createCarReview(id, data) {
    try {
      const response = await apiClient.post(`/cars/${id}/reviews`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение списка новых автомобилей
  // Возвращает последние добавленные автомобили
  async getNewCars() {
    try {
      const response = await apiClient.get('/cars/new');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение списка продвигаемых автомобилей
  // Возвращает автомобили с активными рекламными кампаниями
  async getPromotedCars() {
    try {
      const response = await apiClient.get('/cars/promoted');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Поиск автомобилей по запросу
  // Параметры: query - поисковый запрос
  async searchCars(query) {
    try {
      const response = await apiClient.get('/cars/search', { params: { query } });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение атрибутов автомобиля
  // Параметры: id - идентификатор автомобиля
  async getCarAttributes(id) {
    try {
      const response = await apiClient.get(`/cars/${id}/attributes`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Получение похожих автомобилей
  // Параметры: id - идентификатор автомобиля
  async getSimilarCars(id) {
    try {
      const response = await apiClient.get(`/cars/${id}/similar`);
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

export default new CarsService(); 