import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCandidates = createAsyncThunk(
  'dashboard/fetchCandidates',
  async ({ page = 1, sortBy = 'final_score', sortOrder = 'desc', search = '' } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      sortBy,
      sortOrder,
      search,
    });
    
    const response = await fetch(`/api/candidates?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }
    
    return response.json();
  }
);

export const fetchCandidateDetail = createAsyncThunk(
  'dashboard/fetchCandidateDetail',
  async (candidateId) => {
    const response = await fetch(`/api/candidates/${candidateId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch candidate details');
    }
    
    return response.json();
  }
);

const initialState = {
  candidates: [],
  selectedCandidate: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  },
  filters: {
    search: '',
    sortBy: 'final_score',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.candidates;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCandidateDetail.fulfilled, (state, action) => {
        state.selectedCandidate = action.payload;
      });
  },
});

export const { setFilters, setSelectedCandidate, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;