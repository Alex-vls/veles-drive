import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Company } from '../../types';

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

interface CompanyFilters {
  city?: string;
  is_verified?: boolean;
  rating_min?: number;
  rating_max?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
  totalCount: 0,
};

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (filters: CompanyFilters) => {
    const response = await api.get('/companies/', { params: filters });
    return response.data;
  }
);

export const fetchCompanyById = createAsyncThunk(
  'company/fetchCompanyById',
  async (id: number) => {
    const response = await api.get(`/companies/${id}/`);
    return response.data;
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (companyData: Partial<Company>) => {
    const response = await api.post('/companies/', companyData);
    return response.data;
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async ({ id, companyData }: { id: number; companyData: Partial<Company> }) => {
    const response = await api.patch(`/companies/${id}/`, companyData);
    return response.data;
  }
);

export const deleteCompany = createAsyncThunk(
  'company/deleteCompany',
  async (id: number) => {
    await api.delete(`/companies/${id}/`);
    return id;
  }
);

export const addCompanySchedule = createAsyncThunk(
  'company/addCompanySchedule',
  async ({ companyId, scheduleData }: { companyId: number; scheduleData: any }) => {
    const response = await api.post(`/companies/${companyId}/add_schedule/`, scheduleData);
    return response.data;
  }
);

export const addCompanyFeature = createAsyncThunk(
  'company/addCompanyFeature',
  async ({ companyId, featureData }: { companyId: number; featureData: any }) => {
    const response = await api.post(`/companies/${companyId}/add_feature/`, featureData);
    return response.data;
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCompanies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      // fetchCompanyById
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCompany = action.payload;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch company';
      })
      // createCompany
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.unshift(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create company';
      })
      // updateCompany
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.companies.findIndex(company => company.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        if (state.currentCompany?.id === action.payload.id) {
          state.currentCompany = action.payload;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update company';
      })
      // deleteCompany
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(company => company.id !== action.payload);
        if (state.currentCompany?.id === action.payload) {
          state.currentCompany = null;
        }
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete company';
      })
      // addCompanySchedule
      .addCase(addCompanySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanySchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCompany) {
          state.currentCompany.schedules.push(action.payload);
        }
      })
      .addCase(addCompanySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add schedule';
      })
      // addCompanyFeature
      .addCase(addCompanyFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanyFeature.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCompany) {
          state.currentCompany.features.push(action.payload);
        }
      })
      .addCase(addCompanyFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add feature';
      });
  },
});

export const { clearCurrentCompany } = companySlice.actions;

export default companySlice.reducer; 