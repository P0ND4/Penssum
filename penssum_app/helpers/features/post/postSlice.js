import { createSlice } from "@reduxjs/toolkit";

export const postSlice = createSlice({
  name: "post",
  initialState: [],
  reducers: {
    update: (state,action) => state = action.payload
  },
});

export const { update } = postSlice.actions;
export default postSlice.reducer;
