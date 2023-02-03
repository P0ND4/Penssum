import { Routes, Route } from "react-router-dom";

// Screens

import Information from "./Information";
import Documentation from "./Documentation";
import Error404 from "../Error404";

const Register = () => {
 return (
  <Routes>
    <Route path="/" element={<Information/>}/>
    <Route path="/information/*" element={<Documentation/>}/>
    <Route path="*" element={<Error404/>}/>
  </Routes>
 )
};

export default Register;