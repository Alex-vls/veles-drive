import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Car, CarFilters } from '../../types';

interface CarsState {
  items: Car[];
  selectedCar: Car | null;
  filters: CarFilters;
  loading: boolean;
  error: string | null;
}

const initialState: CarsState = {
  items: [],
  selectedCar: null,
  filters: {
    brand: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    transmission: '',
    fuelType: '',
    bodyType: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

const carsSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    setCars: (state, action: PayloadAction<Car[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedCar: (state, action: PayloadAction<Car | null>) => {
      state.selectedCar = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CarFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addCar: (state, action: PayloadAction<Car>) => {
      state.items.unshift(action.payload);
    },
    updateCar: (state, action: PayloadAction<Car>) => {
      const index = state.items.findIndex((car) => car.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedCar?.id === action.payload.id) {
        state.selectedCar = action.payload;
      }
    },
    deleteCar: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((car) => car.id !== action.payload);
      if (state.selectedCar?.id === action.payload) {
        state.selectedCar = null;
      }
    },
  },
});

export const {
  setCars,
  setSelectedCar,
  setFilters,
  resetFilters,
  setLoading,
  setError,
  addCar,
  updateCar,
  deleteCar,
} = carsSlice.actions;

export default carsSlice.reducer; 