const { createSlice } = require("@reduxjs/toolkit");

export const hangTimeSlice = createSlice({
  name: 'hangTime',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = hangTimeSlice.actions;
export default hangTimeSlice.reducer;