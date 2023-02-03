const { createSlice } = require('@reduxjs/toolkit');

export const suspendedSlice = createSlice({
  name: 'suspended',
  initialState: false,
  reducers: {
    change: (state, action) => state = action.payload,
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { change, active, inactive } = suspendedSlice.actions;
export default suspendedSlice.reducer;