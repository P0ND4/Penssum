import { Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import Error404 from "../layouts/Error404"; // Show error if there isn't a route

import Report from "../layouts/Report"; // Report transactions, users, publications
import Help from "../layouts/help/Help"; // Ask for help, and documentation
import ImprovementComment from "../layouts/ImprovementComment"; // Improvement Comment

import CompleteInformation from "../layouts/CompleteInformation"; // Complete user information

// login
import Login from "../layouts/login/Login";

// User
import Profile from "../layouts/user/Profile";
import Messages from "../layouts/user/Messages";
import Notifications from "../layouts/user/Notifications";
import Preferences from "../layouts/user/Preference";

//Post
import Post from "../layouts/post/Post";
import PostActivity from "../layouts/post/PostActivity"; // Create publication
import Quote from "../layouts/post/Quote"; // send homework and explanation

//import VideoCall from './layouts/function/VideoCall';
import Found from "../layouts/function/Found"; // Search products and users

import Task from '../layouts/Task';

import Register from "../layouts/register/Register";

function Tasks() {
  return (
    <Routes>
      <Route path="/" element={<Task />}/>
      <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>}/>
      <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>}/>
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>}/>
      <Route path="/help/*" element={<Help />} />
      <Route path="/preference/*" element={<PrivateRoute><Preferences /></PrivateRoute>}/>
      <Route path="/search/:profile_provider" element={<Found />} />
      <Route path="/post/activity" element={<PrivateRoute><PostActivity /></PrivateRoute>}/>
      <Route path="/post/information/*" element={<Post />} />
      <Route path="/send/quote" element={<PrivateRoute><Quote /></PrivateRoute>}/>
      <Route path="/complete/information/*" element={<PrivateRoute><CompleteInformation /></PrivateRoute>}/>
      <Route path="/improvement/comment" element={<PrivateRoute><ImprovementComment /></PrivateRoute>}/>
      <Route path="/signup/*" element={<Register />} />
      <Route path="/signin/*" element={<PublicRoute><Login /></PublicRoute>}/>
      <Route path="/:username" element={<Profile />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  )
}

export default Tasks