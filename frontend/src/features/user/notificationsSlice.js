const { createSlice } = require('@reduxjs/toolkit');

export const notificationsSlice = createSlice({
  name: 'notifications-user',
  initialState: {
    count: 0,
    information: null
  },
  reducers: {
    set: (state, action) => state = { ...state, count: action.payload },
    increment: (state, action) => state = { ...state, count: state.count + 1},
    decrement: (state, action) => state = { ...state, count: state.count - 1},
    clean: (state, action) => state = { ...state, count: 0 },
    change: (state, action) => state = { ...state, information: action.payload }
  }
});

export const { increment, decrement, clean, change, set } = notificationsSlice.actions;
export default notificationsSlice.reducer;