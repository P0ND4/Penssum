const { createSlice } = require('@reduxjs/toolkit');

export const filesSlice = createSlice({
  name: 'files',
  initialState: [],
  reducers: {
    upload: (state, action) => state = action.payload,
    clean: (state, action) => state = []
  }
});

export const { upload, clean } = filesSlice.actions;
export default filesSlice.reducer;