const { createSlice } = require('@reduxjs/toolkit');

export const voteSlice = createSlice({
  name: 'vote',
  initialState: [],
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = []
  }
});

export const { change } = voteSlice.actions;
export default voteSlice.reducer;