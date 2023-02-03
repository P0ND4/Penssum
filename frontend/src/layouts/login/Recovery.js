import { Route, Routes } from "react-router-dom";

import Email from "../../pages/login/recovery/Email";
import Check from "../../pages/login/recovery/Check";
import Password from "../../pages/login/recovery/Password";
import Error404 from "../Error404";

function Recovery() {
  return (
    <Routes>
      <Route path="/email" element={<Email />} />
      <Route path="/check" element={<Check />} />
      <Route path="/password" element={<Password />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default Recovery;
