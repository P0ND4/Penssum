const { createSlice } = require("@reduxjs/toolkit");

export const messagesContentSlice = createSlice({
  name: "messages-content",
  initialState: {
    contacts: null,
    messages: [],
    contactActive: null,
    isActiveContact: false,
    isBlocked: {
      blocked: false,
      userView: null,
    },
    canYouType: false,
    watching: "",
  },
  reducers: {
    changeMessages: (state, action) => void (state.messages = action.payload),
    changeContacts: (state, action) => void (state.contacts = action.payload),
    change: (state, action) => (state = { ...state, ...action.payload }),
    clean: (state, action) =>
      (state = {
        ...state,
        messages: [],
        contactActive: null,
        isActiveContact: false,
        isBlocked: {
          blocked: false,
          userView: null,
        },
        canYouType: false,
        watching: "",
      }),
  },
});

export const { changeMessages, changeContacts, change, clean } =
  messagesContentSlice.actions;
export default messagesContentSlice.reducer;
