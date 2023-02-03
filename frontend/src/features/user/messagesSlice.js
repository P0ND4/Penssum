const { createSlice } = require('@reduxjs/toolkit');

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: 0,
  reducers: {
    change: (state, action) => state = action.payload,
    increment: (state, action) => state += 1,
    decrement: (state, action) => state -= 1,
    clean: (state, action) => state = 0
  }
});

export const { change, increment, decrement, clean } = messagesSlice.actions;
export default messagesSlice.reducer;