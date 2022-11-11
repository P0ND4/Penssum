import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    update: (state,action) => state = action.payload,
  },
});

export const { update } = usersSlice.actions;
export default usersSlice.reducer;
