const { createSlice } = require('@reduxjs/toolkit');

export const couponsSlice = createSlice({
  name: 'coupons',
  initialState: null,
  reducers: {
    clean: (state, action) => state = null,
    change: (state, action) => state = action.payload
  }
});

export const { clean, change } = couponsSlice.actions;
export default couponsSlice.reducer;