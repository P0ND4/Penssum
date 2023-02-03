import { Routes, Route } from "react-router-dom";


// Screens

import Recovery from "./Recovery";
import Signin from "./Signin";
import AdminLogin from "./AdminLogin";
import Error404 from "../Error404";

const Login = () => {
 return (
  <Routes>
    <Route path="/" element={<Signin/>}/>
    <Route path="/recovery/*" element={<Recovery/>}/>
    <Route path="/admin" element={<AdminLogin/>}/>
    <Route path="*" element={<Error404/>}/>
  </Routes>
 )
};

export default Login;