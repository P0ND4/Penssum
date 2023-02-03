import { Routes, Route } from "react-router-dom";
import PublicRoute from "../../router/PublicRoute";

// Screens

import Signup from "./Signup";
import Selection from "./Selection";
import CheckEmail from "../user/CheckEmail";
import TokenVerification from "../user/TokenVerification";
import Error404 from "../Error404";

const Register = () => {
 return (
  <Routes>
    <Route path="/" element={<PublicRoute><Signup/></PublicRoute>}/>
    <Route path="/selection" element={<Selection/>}/>
    <Route path="/check/email" element={<CheckEmail/>}/>
    <Route path="/email/verification/:token" element={<TokenVerification/>}/>
    <Route path="*" element={<Error404/>}/>
  </Routes>
 )
};

export default Register;