import { Routes, Route } from "react-router-dom";

import Nav from "../partials/MainNav";
//import Footer from "../partials/Footer";

import LoadingZone from "../controllers/LoadingZone"; // Show the payload if there is no data

import PopupWindow from "../components/PopupWindow"; // show popup window
import Tasks from "./Tasks";
import Home from "./Home";

import Error404 from "../layouts/Error404";

function App() {
  return (
    <LoadingZone>
      <Nav />
      <Routes>
        <Route path="/*" element={<Home/>}/>
        <Route path="/courses" />
        <Route path="/tasks/*" element={<Tasks/>}/>
        <Route path="/store"/>
        <Route path="*" element={<Error404/>}/>
      </Routes>
      {/*<Footer />*/}
      <PopupWindow/>
    </LoadingZone>
  );
}

export default App;