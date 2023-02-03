const { createSlice } = require('@reduxjs/toolkit');

export const validatedSlice = createSlice({
  name: 'validated',
  initialState: false,
  reducers: {
    change: (state, action) => state = action.payload,
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { change, active, inactive } = validatedSlice.actions;
export default validatedSlice.reducer;