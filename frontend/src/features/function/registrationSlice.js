const { createSlice } = require('@reduxjs/toolkit');

export const registrationSlice = createSlice({
  name: 'registration',
  initialState: {
    validated: null,
    selection: null
  },
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = registrationSlice.actions;
export default registrationSlice.reducer;