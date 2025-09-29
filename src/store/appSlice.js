import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeView: 'interviewee',
  showWelcomeBack: false,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setShowWelcomeBack: (state, action) => {
      state.showWelcomeBack = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    checkForUnfinishedSession: (state) => {
      const unfinishedSession = localStorage.getItem('unfinished_session');
      if (unfinishedSession) {
        state.showWelcomeBack = true;
      }
    },
  },
});

export const { setActiveView, setShowWelcomeBack, setLoading, setError, checkForUnfinishedSession } = appSlice.actions;
export default appSlice.reducer;