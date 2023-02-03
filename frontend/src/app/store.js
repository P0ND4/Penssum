import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/user/userSlice"; // User information
import authSlice from "../features/user/authSlice"; // User Authentication
import productsSlice from "../features/product/productsSlice"; // products
import searchSlice from "../features/function/searchSlice"; // Search bar
import filesSlice from "../features/function/filesSlice"; // File handler
import registrationSlice from "../features/function/registrationSlice"; // Register Control
import messagesSlice from "../features/user/messagesSlice"; // Message count
import userNotificationsSlice from "../features/user/notificationsSlice"; // General notifications
import filterSlice from "../features/function/filterSlice"; // search bar filter
import reportUserSlice from "../features/user/reportSlice"; // Username report
import suspendedSlice from "../features/user/suspendedSlice"; // Is the user suspended
import signInSlice from "../features/dashboard/signInSlice"; // Dashboard sign in
import validatedSlice from "../features/dashboard/validatedSlice"; // Dashboard Sign in validated
import quoteSlice from "../features/product/quoteSlice"; // ID quote
import blockSlice from "../features/user/blockSlice"; // Is the user blocked
import hangTimeSlice from "../features/user/hangTimeSlice"; // Suspension control
import reportProductSlice from "../features/product/reportSlice"; // report product id
import voteSlice from "../features/function/voteSlice"; // Vote pending
import handlerVoteSlice from "../features/function/handlerVoteSlice"; // handler vote pending
import pendingSlice from "../features/function/pendingSlice"; // pending information control
import transactionSlice from "../features/function/transactionSlice"; // is report transaction
import zoneSlice from "../features/user/zoneSlice"; // Complete information zone
import registrationControlSlice from "../features/user/registrationControlSlice"; // Is the user registration
import dashboardInformationSlice from "../features/dashboard/informationSlice"; // Dashboard information
import reviewSlice from "../features/dashboard/reviewSlice"; // Produtcs to review
import usersSlice from "../features/dashboard/usersSlice"; // General users
import transactionsSlice from "../features/dashboard/transactionsSlice"; // dashboard transactions
import couponsSlice from "../features/dashboard/couponsSlice"; // Dashboard coupons
import dashboardNotificationsSlice from "../features/dashboard/notificationsSlice"; // Dashboard Notifications
import profileSlice from "../features/function/profileSlice"; // found user information
import recoverySlice from "../features/registration/recoverySlice"; // Recovery Information
import registerSlice from "../features/function/registerSlice"; // Register information
import activitySlice from "../features/product/activitySlice"; // Post activity information
import postInformationSlice from "../features/product/informationSlice";
import completeInformationSlice from "../features/user/completeInformationSlice"; // Complete information about user
import messagesContentSlice from "../features/user/messagesContentSlice"; // Messages and contacts

export const store = configureStore({
  // Creating Store
  reducer: {
    user: userSlice, // User information
    auth: authSlice, // User Authentication
    products: productsSlice, // General products
    search: searchSlice, // Search bar
    files: filesSlice, // File handler
    registration: registrationSlice, // Register control
    messages: messagesSlice, // Message count
    userNotifications: userNotificationsSlice, // General notifications
    filter: filterSlice, // Search bar filter
    reportUser: reportUserSlice, // Username report
    suspended: suspendedSlice, // Is the user suspended
    signIn: signInSlice, // Dashboard sign in
    validated: validatedSlice, // Dashboard Sign in validated
    quote: quoteSlice, // ID quote
    block: blockSlice, // Is the user blocked
    hangTime: hangTimeSlice, // Suspension control
    reportProduct: reportProductSlice, // report product Id
    vote: voteSlice, // Vote pending
    handlerVote: handlerVoteSlice, // handler vote pending
    pending: pendingSlice, // pending information control
    transaction: transactionSlice, // is report transaction
    zone: zoneSlice, // Complete information zone
    registrationControl: registrationControlSlice, // Is the user registration
    dashboardInformation: dashboardInformationSlice, // Dashboard information
    review: reviewSlice, // Products to review
    users: usersSlice, // General users
    transactions: transactionsSlice, // Dashboard Transactions
    coupons: couponsSlice, // Dashboard coupons
    dashboardNotifications: dashboardNotificationsSlice, // Dashboard Notifications
    profile: profileSlice, // found user information
    recovery: recoverySlice, // Recovery Information
    register: registerSlice, // Register information
    activity: activitySlice, // Post activity information
    postInformation: postInformationSlice,
    completeInformation: completeInformationSlice, // Complete information about user
    messagesContent: messagesContentSlice, // Messages and contacts
  },
});
