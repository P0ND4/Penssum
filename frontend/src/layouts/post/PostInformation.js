import PostInformationController from "../../controllers/PostInformation";

import Handlers from "../../screens/post/information/Handlers";
import Main from "../../screens/post/information/Main";

function PostInformation() {
  return (
    <PostInformationController>
      <Handlers/>
      <Main />
    </PostInformationController>
  );
}

export default PostInformation;