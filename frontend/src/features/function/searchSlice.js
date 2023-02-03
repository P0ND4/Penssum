const { createSlice } = require('@reduxjs/toolkit');

export const searchSlice = createSlice({
  name: 'search',
  initialState: '',
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = searchSlice.actions;
export default searchSlice.reducer;