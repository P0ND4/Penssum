const { createSlice } = require('@reduxjs/toolkit');

export const handlerVoteSlice = createSlice({
  name: 'handlerVote',
  initialState: true,
  reducers: {
    active: (state, action) => state = true,
    inactive: (state, action) => state = false
  }
});

export const { active, inactive } = handlerVoteSlice.actions;
export default handlerVoteSlice.reducer;