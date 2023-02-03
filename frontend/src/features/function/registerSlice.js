const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  sendingInformation: false,
  activeFloatingUsername: false,
  activeFloatingPassword: false,
  socialNetworkData: {},
};

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    change: (state, action) => (state = { ...state, ...action.payload }),
    clean: (state, action) => (state = initialState),
  },
});

export const { clean, change } = registerSlice.actions;
export default registerSlice.reducer;
