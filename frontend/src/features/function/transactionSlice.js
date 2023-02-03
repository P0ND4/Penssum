const { createSlice } = require('@reduxjs/toolkit');

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState: false,
  reducers: {
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { active, inactive } = transactionSlice.actions;
export default transactionSlice.reducer;