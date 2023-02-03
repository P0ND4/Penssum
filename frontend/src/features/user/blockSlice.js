const { createSlice } = require('@reduxjs/toolkit');

export const blockSlice = createSlice({
  name: 'block',
  initialState: false,
  reducers: {
    change: (state, action) => state = action.payload,
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { change, active, inactive } = blockSlice.actions;
export default blockSlice.reducer;