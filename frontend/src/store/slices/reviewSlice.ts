import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Review } from '../../types';

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

interface ReviewFilters {
  car?: number;
  company?: number;
  user?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

const initialState: ReviewState = {
  reviews: [],
  currentReview: null,
  loading: false,
  error: null,
  totalCount: 0,
};

export const fetchReviews = createAsyncThunk(
  'review/fetchReviews',
  async (filters: ReviewFilters) => {
    const response = await api.get('/reviews/', { params: filters });
    return response.data;
  }
);

export const fetchReviewById = createAsyncThunk(
  'review/fetchReviewById',
  async (id: number) => {
    const response = await api.get(`/reviews/${id}/`);
    return response.data;
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async (reviewData: Partial<Review>) => {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ id, reviewData }: { id: number; reviewData: Partial<Review> }) => {
    const response = await api.patch(`/reviews/${id}/`, reviewData);
    return response.data;
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (id: number) => {
    await api.delete(`/reviews/${id}/`);
    return id;
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearCurrentReview: (state) => {
      state.currentReview = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      // fetchReviewById
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch review';
      })
      // createReview
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create review';
      })
      // updateReview
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(review => review.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        if (state.currentReview?.id === action.payload.id) {
          state.currentReview = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update review';
      })
      // deleteReview
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(review => review.id !== action.payload);
        if (state.currentReview?.id === action.payload) {
          state.currentReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete review';
      });
  },
});

export const { clearCurrentReview } = reviewSlice.actions;

export default reviewSlice.reducer; 