const { createSlice } = require('@reduxjs/toolkit');

export const reviewSlice = createSlice({
  name: 'review',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = null
  }
});

export const { change, clean } = reviewSlice.actions;
export default reviewSlice.reducer;