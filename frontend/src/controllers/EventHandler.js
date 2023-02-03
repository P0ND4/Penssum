import { useEffect, Fragment, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFiles } from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import { verificationOfInformation } from "../helpers";

// Slice redux
import { change as changeSearch } from "../features/function/searchSlice";
import { clean as cleanFiles } from "../features/function/filesSlice";
import { inactive as inactiveValidated } from "../features/dashboard/validatedSlice";
import { change as changeUser } from "../features/user/reportSlice";
import { change as changeProduct } from "../features/product/reportSlice";
import {
  inactive as inactivePending,
  active as activePending,
} from "../features/function/pendingSlice";
import { inactive as inactiveTransaction } from "../features/function/transactionSlice";
import {
  inactive as inactiveRegistrationControl,
  active as activeRegistrationControl,
} from "../features/user/registrationControlSlice";
import { clean as cleanProfile } from "../features/function/profileSlice";
import { clean as cleanRegistration } from "../features/registration/recoverySlice";
import { clean as cleanRegister } from "../features/function/registerSlice";
import { clean as cleanActivity } from "../features/product/activitySlice";
import { clean as cleanInformation } from "../features/product/informationSlice";
import { clean as cleanCompleteInformation } from "../features/user/completeInformationSlice";
import { clean as cleanMessagesContent } from "../features/user/messagesContentSlice";

//

function EventHandler({ children }) {
  const user = useSelector((state) => state.user);
  const files = useSelector((state) => state.files);
  const block = useSelector((state) => state.block);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.slice(0, 17) !== "/signin/recovery/")
      dispatch(cleanRegistration());
    if (location.pathname.slice(0, 21) !== "/complete/information")
      dispatch(cleanCompleteInformation());

    dispatch(cleanMessagesContent());
    dispatch(cleanInformation());
    dispatch(cleanActivity());
    dispatch(cleanRegister());
    dispatch(cleanProfile());
  }, [location.pathname, dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
    block && navigate("/");
  }, [location.pathname, navigate, block]);

  const removeAllFiles = async () => {
    await removeFiles({ files });
    dispatch(cleanFiles());
  };

  useEffect(() => {
    if (files !== null && files.length > 0)
      window.addEventListener(
        "beforeunload",
        (event) => (event.returnValue = "")
      );
    if (files !== null && files.length > 0)
      window.addEventListener("unload", removeAllFiles);
    return () => {
      window.removeEventListener(
        "beforeunload",
        (event) => (event.returnValue = "")
      );
      window.removeEventListener("unload", removeAllFiles);
    };
  });

  const memorizedTheRegistration = useCallback(() => {
    if (
      location.pathname === "/signup/selection" ||
      location.pathname === "/signup/check/email"
    )
      dispatch(inactiveRegistrationControl());
    else if (user.validated !== undefined && !user.validated)
      dispatch(activeRegistrationControl());
    else dispatch(inactiveRegistrationControl());
  }, [location.pathname, user.validated, dispatch]);

  useEffect(() => {
    memorizedTheRegistration();
    if (location.pathname.slice(0, 9) !== "/profile/")
      if (location.pathname.slice(0, 11) !== "/dashboard/")
        dispatch(inactiveValidated());
    if (location.pathname.slice(0, 7) !== "/report") {
      dispatch(changeProduct(null));
      dispatch(changeUser(""));
      dispatch(inactiveTransaction());
    }

    if (location.pathname.slice(0, 21) === "/complete/information")
      dispatch(inactivePending());
    else {
      if (!verificationOfInformation(user.objetive, user))
        dispatch(activePending());
      else dispatch(inactivePending());
    }
  }, [location.pathname, memorizedTheRegistration, user, dispatch]);

  useEffect(() => {
    if (location.pathname.slice(0, 8) !== "/search/")
      dispatch(changeSearch(""));
    const listenToObtainedFiles = async () => {
      if (
        location.pathname.slice(0, 14) !== "/post/activity" &&
        location.pathname.slice(0, 11) !== "/send/quote" &&
        location.pathname.slice(0, 7) !== "/report" &&
        location.pathname.slice(0, 20) !== "/improvement/comment" &&
        location.pathname.slice(0, 5) !== "/help"
      ) {
        if (files.length > 0) {
          await removeFiles({ files });
          dispatch(cleanFiles());
        }
      }
    };
    listenToObtainedFiles();
  });

  return <Fragment>{children}</Fragment>;
}

export default EventHandler;
