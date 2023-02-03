const { createSlice } = require('@reduxjs/toolkit');

export const reportSlice = createSlice({
  name: 'reportProduct',
  initialState: '',
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = reportSlice.actions;
export default reportSlice.reducer;