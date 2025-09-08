import { createSlice } from '@reduxjs/toolkit';
import { User } from '@/types';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { clearUser, logout, setUser, setError } = userSlice.actions;

export default userSlice.reducer; 