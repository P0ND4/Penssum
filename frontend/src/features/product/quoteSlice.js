const { createSlice } = require('@reduxjs/toolkit');

export const quoteSlice = createSlice({
  name: 'quoteId',
  initialState: '',
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = ''
  }
});

export const { change, clean } = quoteSlice.actions;
export default quoteSlice.reducer;