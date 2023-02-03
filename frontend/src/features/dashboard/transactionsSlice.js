const { createSlice } = require('@reduxjs/toolkit');

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = null
  }
});

export const { change, clean } = transactionsSlice.actions;
export default transactionsSlice.reducer;