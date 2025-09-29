import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const uploadResume = createAsyncThunk(
  'candidate/uploadResume',
  async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch('/api/upload-resume', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload resume');
    }
    
    return response.json();
  }
);

export const saveCandidate = createAsyncThunk(
  'candidate/save',
  async (candidateData) => {
    const response = await fetch('/api/candidate/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save candidate');
    }
    
    return response.json();
  }
);

const initialState = {
  id: null,
  name: '',
  email: '',
  phone: '',
  resumeText: '',
  status: 'not_started',
  finalScore: null,
  summary: '',
  createdAt: null,
  updatedAt: null,
  loading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    resetCandidate: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.loading = false;
        const { parsedText, name, email, phone } = action.payload;
        state.resumeText = parsedText;
        if (name) state.name = name;
        if (email) state.email = email;
        if (phone) state.phone = phone;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(saveCandidate.fulfilled, (state, action) => {
        state.id = action.payload.id;
        state.updatedAt = new Date().toISOString();
      });
  },
});

export const { setField, setStatus, resetCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;