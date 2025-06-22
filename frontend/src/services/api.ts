import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, Car, Company, Review, CarFilters, CompanyFilters, PaginatedResponse } from '@/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Car', 'Company', 'Review'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ access: string; user: User }, { email: string; password: string }>({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<User, { username: string; email: string; password: string }>({
      query: (userData) => ({
        url: 'auth/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout/',
        method: 'POST',
      }),
    }),

    // User endpoints
    getCurrentUser: builder.query<User, void>({
      query: () => 'users/me/',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: 'users/me/',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, { current_password: string; new_password: string }>({
      query: (passwords) => ({
        url: 'users/change-password/',
        method: 'POST',
        body: passwords,
      }),
    }),

    // Car endpoints
    getCars: builder.query<PaginatedResponse<Car>, CarFilters>({
      query: (filters) => ({
        url: 'cars/',
        params: filters,
      }),
      providesTags: ['Car'],
    }),
    getCar: builder.query<Car, number>({
      query: (id) => `cars/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Car', id }],
    }),
    createCar: builder.mutation<Car, Partial<Car>>({
      query: (carData) => ({
        url: 'cars/',
        method: 'POST',
        body: carData,
      }),
      invalidatesTags: ['Car'],
    }),
    updateCar: builder.mutation<Car, { id: number; data: Partial<Car> }>({
      query: ({ id, data }) => ({
        url: `cars/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Car', id }],
    }),
    deleteCar: builder.mutation<void, number>({
      query: (id) => ({
        url: `cars/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Car'],
    }),
    addToFavorites: builder.mutation<void, number>({
      query: (carId) => ({
        url: `cars/${carId}/favorite/`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Car'],
    }),
    removeFromFavorites: builder.mutation<void, number>({
      query: (carId) => ({
        url: `cars/${carId}/favorite/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Car'],
    }),

    // Company endpoints
    getCompanies: builder.query<PaginatedResponse<Company>, CompanyFilters>({
      query: (filters) => ({
        url: 'companies/',
        params: filters,
      }),
      providesTags: ['Company'],
    }),
    getCompany: builder.query<Company, number>({
      query: (id) => `companies/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    createCompany: builder.mutation<Company, Partial<Company>>({
      query: (companyData) => ({
        url: 'companies/',
        method: 'POST',
        body: companyData,
      }),
      invalidatesTags: ['Company'],
    }),
    updateCompany: builder.mutation<Company, { id: number; data: Partial<Company> }>({
      query: ({ id, data }) => ({
        url: `companies/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),
    deleteCompany: builder.mutation<void, number>({
      query: (id) => ({
        url: `companies/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Company'],
    }),

    // Review endpoints
    getCarReviews: builder.query<PaginatedResponse<Review>, number>({
      query: (carId) => `cars/${carId}/reviews/`,
      providesTags: (result, error, carId) => [{ type: 'Review', id: carId }],
    }),
    getCompanyReviews: builder.query<PaginatedResponse<Review>, number>({
      query: (companyId) => `companies/${companyId}/reviews/`,
      providesTags: (result, error, companyId) => [{ type: 'Review', id: companyId }],
    }),
    createCarReview: builder.mutation<Review, { carId: number; data: Partial<Review> }>({
      query: ({ carId, data }) => ({
        url: `cars/${carId}/reviews/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { carId }) => [
        { type: 'Review', id: carId },
        { type: 'Car', id: carId },
      ],
    }),
    createCompanyReview: builder.mutation<Review, { companyId: number; data: Partial<Review> }>({
      query: ({ companyId, data }) => ({
        url: `companies/${companyId}/reviews/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: 'Review', id: companyId },
        { type: 'Company', id: companyId },
      ],
    }),
    updateReview: builder.mutation<Review, { id: number; data: Partial<Review> }>({
      query: ({ id, data }) => ({
        url: `reviews/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Review', id }],
    }),
    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `reviews/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Review', id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetCarsQuery,
  useGetCarQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useGetCarReviewsQuery,
  useGetCompanyReviewsQuery,
  useCreateCarReviewMutation,
  useCreateCompanyReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = api; 