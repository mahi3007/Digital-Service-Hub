import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  rfqs: [],
  rfq: null,
  loading: false,
  error: null,
};

export const createRFQ = createAsyncThunk(
  'rfq/create',
  async (rfqData, { rejectWithValue }) => {
    try {
      const res = await api.post('/rfq/create', rfqData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create RFQ');
    }
  }
);

export const fetchRFQs = createAsyncThunk(
  'rfq/fetchRFQs',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get('/rfq', { params });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch RFQs');
    }
  }
);

export const fetchRFQById = createAsyncThunk(
  'rfq/fetchRFQById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/rfq/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch RFQ');
    }
  }
);

const rfqSlice = createSlice({
  name: 'rfq',
  initialState,
  reducers: {
    clearRFQ: (state) => {
      state.rfq = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRFQ.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRFQ.fulfilled, (state, action) => {
        state.loading = false;
        state.rfq = action.payload;
      })
      .addCase(createRFQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRFQs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.loading = false;
        state.rfqs = action.payload;
      })
      .addCase(fetchRFQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRFQById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRFQById.fulfilled, (state, action) => {
        state.loading = false;
        state.rfq = action.payload;
      })
      .addCase(fetchRFQById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRFQ } = rfqSlice.actions;
export default rfqSlice.reducer;
