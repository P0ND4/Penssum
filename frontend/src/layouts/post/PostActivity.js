import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { verificationOfInformation } from "../../helpers";

// Slice redux
import Left from "../../screens/post/activity/Left";
import Right from "../../screens/post/activity/Right";
import Handlers from "../../screens/post/activity/Handlers";
import PostActivityController from "../../controllers/PostActivity";

function PostActivity() {
  const user = useSelector((state) => state.user);
  const suspended = useSelector((state) => state.suspended);

  return user.objetive !== "Profesor" &&
    verificationOfInformation(user.objetive, user) ? (
    !suspended ? (
      <PostActivityController>
        <div className="post-activity-container">
          <div className="post-activity">
            <Left />
            <Right />
          </div>
          <Handlers />
        </div>
      </PostActivityController>
    ) : (
      <Navigate to={`/${user.username}`} />
    )
  ) : (
    <Navigate to="/signin" />
  );
}

export default PostActivity;