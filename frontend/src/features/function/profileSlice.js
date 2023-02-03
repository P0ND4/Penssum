const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  isBlocked: { blocked: null, userView: null },
  score: { votes: 0, count: 0 },
  products: null,
  user: null,
  tasksTaken: 0,
  transaction: { active: false, amount: 0 },
  money: 0,
  zone: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    changeZone: (state, action) => void (state.zone = action.payload),
    changeMoney: (state, action) => void (state.money = action.payload),
    changeTransaction: (state, action) =>
      void (state.transaction = action.payload),
    changeProducts: (state, action) => void (state.products = action.payload),
    changeBlocked: (state, action) => void (state.isBlocked = action.payload),
    changeScore: (state, action) => void (state.score = action.payload),
    set: (state, action) =>
      void (state.user = { ...state.user, ...action.payload }),
    changeUser: (state, action) => void (state.user = action.payload),
    changeTasksTaken: (state, action) =>
      void (state.tasksTaken = action.payload),
    clean: (state, action) => (state = initialState),
  },
});

export const {
  changeMoney,
  changeUser,
  changeScore,
  clean,
  set,
  changeBlocked,
  changeProducts,
  changeTasksTaken,
  changeTransaction,
  changeZone,
} = profileSlice.actions;
export default profileSlice.reducer;
