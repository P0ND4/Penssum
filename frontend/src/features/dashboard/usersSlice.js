const { createSlice } = require('@reduxjs/toolkit');

export const usersSlice = createSlice({
  name: 'users',
  initialState: null,
  reducers: {
    change: (state, action) => state = action.payload,
    clean: (state, action) => state = null
  }
});

export const { change, clean } = usersSlice.actions;
export default usersSlice.reducer;