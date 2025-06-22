import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompanyFilters } from '../../types';

interface CompaniesState {
  items: Company[];
  selectedCompany: Company | null;
  filters: CompanyFilters;
  loading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  items: [],
  selectedCompany: null,
  filters: {
    city: '',
    isVerified: '',
    rating: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CompanyFilters>>) => {
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
    addCompany: (state, action: PayloadAction<Company>) => {
      state.items.unshift(action.payload);
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.items.findIndex(
        (company) => company.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedCompany?.id === action.payload.id) {
        state.selectedCompany = action.payload;
      }
    },
    deleteCompany: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (company) => company.id !== action.payload
      );
      if (state.selectedCompany?.id === action.payload) {
        state.selectedCompany = null;
      }
    },
  },
});

export const {
  setCompanies,
  setSelectedCompany,
  setFilters,
  resetFilters,
  setLoading,
  setError,
  addCompany,
  updateCompany,
  deleteCompany,
} = companiesSlice.actions;

export default companiesSlice.reducer; 