import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 1,
  subjects: [],
  selectedSubject: [],
  tags: []
};

export const completeInformationSlice = createSlice({
  name: "complete-information",
  initialState,
  reducers: {
    change: (state, action) => (state = { ...state, ...action.payload }),
    clean: (state, action) => (state = initialState),
  },
});

export const { change, clean } = completeInformationSlice.actions;
export default completeInformationSlice.reducer;
