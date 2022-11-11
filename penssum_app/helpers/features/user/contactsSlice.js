import { createSlice } from "@reduxjs/toolkit";

export const contactsSlice = createSlice({
  name: "contacts",
  initialState: [],
  reducers: {
    update: (state, action) => (state = action.payload),
  },
});

export const { update } = contactsSlice.actions;
export default contactsSlice.reducer;
