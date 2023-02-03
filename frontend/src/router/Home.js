import { Routes, Route } from "react-router-dom"
import Home from "../layouts/Home"
import Error404 from "../layouts/Error404"

function Main() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="*" element={<Error404/>}/>
    </Routes>
  )
}

export default Main;