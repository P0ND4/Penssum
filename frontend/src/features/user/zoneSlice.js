import { createSlice } from "@reduxjs/toolkit";

export const zoneSlice = createSlice({
  name: 'zone',
  initialState: 'main',
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = 'main'
  }
});

export const { change, clean } = zoneSlice.actions;
export default zoneSlice.reducer;