const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  email: "",
  user: null,
  code: "",
  section: "email",
};

export const recoverySlice = createSlice({
  name: "recovery",
  initialState,
  reducers: {
    set: (state, action) => (state = { ...state, ...action.payload }),
    change: (state, action) => (state = action.payload),
    clean: (state, action) => (state = initialState),
  },
});

export const { change, set, clean } = recoverySlice.actions;
export default recoverySlice.reducer;
