const { createSlice } = require('@reduxjs/toolkit');

export const productsSlice = createSlice({
  name: 'products',
  initialState: null,
  reducers: {
    save: (state,action) => state = action.payload
  }
});

export const { save } = productsSlice.actions;
export default productsSlice.reducer;