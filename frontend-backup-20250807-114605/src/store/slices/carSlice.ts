import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Car } from '../../types';

interface CarState {
  cars: Car[];
  currentCar: Car | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

interface CarFilters {
  brand?: string;
  model?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  transmission?: string;
  fuel_type?: string;
  company?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

const initialState: CarState = {
  cars: [],
  currentCar: null,
  loading: false,
  error: null,
  totalCount: 0,
};

export const fetchCars = createAsyncThunk(
  'car/fetchCars',
  async (filters: CarFilters) => {
    const response = await api.get('/cars/', { params: filters });
    return response.data;
  }
);

export const fetchCarById = createAsyncThunk(
  'car/fetchCarById',
  async (id: number) => {
    const response = await api.get(`/cars/${id}/`);
    return response.data;
  }
);

export const createCar = createAsyncThunk(
  'car/createCar',
  async (carData: Partial<Car>) => {
    const response = await api.post('/cars/', carData);
    return response.data;
  }
);

export const updateCar = createAsyncThunk(
  'car/updateCar',
  async ({ id, carData }: { id: number; carData: Partial<Car> }) => {
    const response = await api.patch(`/cars/${id}/`, carData);
    return response.data;
  }
);

export const deleteCar = createAsyncThunk(
  'car/deleteCar',
  async (id: number) => {
    await api.delete(`/cars/${id}/`);
    return id;
  }
);

export const uploadCarImage = createAsyncThunk(
  'car/uploadCarImage',
  async ({ carId, image }: { carId: number; image: File }) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await api.post(`/cars/${carId}/add_image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

const carSlice = createSlice({
  name: 'car',
  initialState,
  reducers: {
    clearCurrentCar: (state) => {
      state.currentCar = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCars
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cars';
      })
      // fetchCarById
      .addCase(fetchCarById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCar = action.payload;
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch car';
      })
      // createCar
      .addCase(createCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCar.fulfilled, (state, action) => {
        state.loading = false;
        state.cars.unshift(action.payload);
      })
      .addCase(createCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create car';
      })
      // updateCar
      .addCase(updateCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cars.findIndex(car => car.id === action.payload.id);
        if (index !== -1) {
          state.cars[index] = action.payload;
        }
        if (state.currentCar?.id === action.payload.id) {
          state.currentCar = action.payload;
        }
      })
      .addCase(updateCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update car';
      })
      // deleteCar
      .addCase(deleteCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = state.cars.filter(car => car.id !== action.payload);
        if (state.currentCar?.id === action.payload) {
          state.currentCar = null;
        }
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete car';
      })
      // uploadCarImage
      .addCase(uploadCarImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadCarImage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCar) {
          state.currentCar.images.push(action.payload);
        }
      })
      .addCase(uploadCarImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload image';
      });
  },
});

export const { clearCurrentCar } = carSlice.actions;

export default carSlice.reducer; 