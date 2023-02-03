import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../../router/PrivateRoute";

// Screens

import TransactionReceipt from "../function/TransactionReceipt";
import PostControl from "./PostControl";
import PostInformation from "./PostInformation";
import Error404 from "../Error404";

const Post = () => {
 return (
  <Routes>
    <Route path=":post_id" element={<PostInformation/>}/>
    <Route path=":post_id/transaction/receipt" element={<PrivateRoute><TransactionReceipt/></PrivateRoute>}/>
    <Route path=":post_id/control" element={<PrivateRoute><PostControl/></PrivateRoute>}/>
    <Route path="*" element={<Error404/>}/>
  </Routes>
 )
};

export default Post;