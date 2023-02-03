const { createSlice } = require('@reduxjs/toolkit');

export const signInSlice = createSlice({
  name: 'signIn',
  initialState: false,
  reducers: {
    change: (state, action) => state = action.payload,
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { active, inactive } = signInSlice.actions;
export default signInSlice.reducer;