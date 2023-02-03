const { createSlice } = require('@reduxjs/toolkit');

export const informationSlice = createSlice({
  name: 'dashboard-information',
  initialState: null,
  reducers: {
    clean: (state, action) => state = null,
    change: (state, action) => state = action.payload
  }
});

export const { clean, change } = informationSlice.actions;
export default informationSlice.reducer;