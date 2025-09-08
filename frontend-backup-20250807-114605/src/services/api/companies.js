import apiClient from './client';

class CompaniesService {
  async getCompanies(params = {}) {
    try {
      const response = await apiClient.get('/companies/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCompany(id) {
    try {
      const response = await apiClient.get(`/companies/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCompanyCars(id, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${id}/cars/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCompanyReviews(id, params = {}) {
    try {
      const response = await apiClient.get(`/companies/${id}/reviews/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCompanyReview(id, data) {
    try {
      const response = await apiClient.post(`/companies/${id}/reviews/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopCompanies() {
    try {
      const response = await apiClient.get('/companies/top/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchCompanies(query) {
    try {
      const response = await apiClient.get('/companies/search/', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        message: 'No response from server',
        data: null
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        message: error.message,
        data: null
      };
    }
  }
}

export default new CompaniesService(); 