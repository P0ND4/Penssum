const { createSlice } = require('@reduxjs/toolkit');

export const registrationControlSlice = createSlice({
  name: 'registration-control',
  initialState: false,
  reducers: {
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { active, inactive } = registrationControlSlice.actions;
export default registrationControlSlice.reducer;