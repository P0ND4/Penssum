const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  coupon: null,
  data: {
    category: "",
    subCategory: "",
    customCategory: "",
    title: "",
    description: "",
    dateOfDelivery: "2023-01-01",
    videoCallActivated: false,
    paymentMethod: false,
    advancePayment: false,
  },
  sendingInformation: false,
  error: "",
  value: 0,
  price: "",
  paymentHandler: false,
  activatePayment: false,
  activateInformation: false,
  payForPenssum: false,
  subjects: [],
  subjectsSelected: [],
  isSubjectsOpen: false,
};

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    changeEvent: (state, action) => (state = { ...state, ...action.payload }),
    changeData: (state, action) =>
      (state = { ...state, data: { ...state.data, ...action.payload } }),
    clean: (state, action) => (state = initialState),
  },
});

export const { changeEvent, changeData, clean } = activitySlice.actions;
export default activitySlice.reducer;
