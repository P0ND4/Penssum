import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: 'auth',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = authSlice.actions;
export default authSlice.reducer;