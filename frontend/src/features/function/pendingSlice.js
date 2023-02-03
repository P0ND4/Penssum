const { createSlice } = require('@reduxjs/toolkit');

export const pendingSlice = createSlice({
  name: 'pending',
  initialState: false,
  reducers: {
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { active, inactive } = pendingSlice.actions;
export default pendingSlice.reducer;