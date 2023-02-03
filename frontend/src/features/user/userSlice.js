import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    save: (state, action) => state = action.payload,
    logOut: (state, action) => state = {}
  }
});

export const { save, logOut } = userSlice.actions;
export default userSlice.reducer;