import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    update: (state,action) => state = action.payload,
    logOut: (state,action) => state = null
  },
});

export const { update, logOut } = userSlice.actions;
export default userSlice.reducer;
