import { createSlice } from "@reduxjs/toolkit";

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    update: (state, action) => (state = action.payload),
  },
});

export const { update } = notificationsSlice.actions;
export default notificationsSlice.reducer;
