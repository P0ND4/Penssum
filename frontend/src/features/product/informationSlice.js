const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  offerVerification: null,
  offerTeacher: null,
  offer: null,
  productFound: null,
  copied: false,
  score: 0,
  scoreUpdated: false,
  sendingInformation: false,
  offerValue: 0,
  offerPrice: "",
  teacher: null,
  teacherUsername: "",
  task: null,
  activeVote: false,
  handlerVote: false,
  userToVote: {},
  currentVote: null,
  sentReportTransaction: null,
  urlVideoCall: "",
  activeInformation: false,
};

export const informationSlice = createSlice({
  name: "product-information",
  initialState,
  reducers: {
    change: (state, action) => (state = { ...state, ...action.payload }),
    clean: (state, action) => (state = initialState),
  },
});

export const { change, clean } = informationSlice.actions;
export default informationSlice.reducer;
