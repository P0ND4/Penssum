const { createSlice } = require('@reduxjs/toolkit');

export const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    city: "ciudad",
    classType: "classType",
    category: "categoria",
  },
  reducers: {
    change: (state, action) => state = action.payload
  }
});

export const { change } = filterSlice.actions;
export default filterSlice.reducer;