import { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUser,
  getProducts,
  socket,
  getAdminInformation,
  suspensionControl,
  userStatusChange,
  getVote,
  getDashboardInformation,
  getTransaction,
  getCoupons,
  getUsers,
} from "../api"; // Penssum api call
import { getRemainTime, verificationOfInformation } from "../helpers";

// Slice redux

import { save as saveUser } from "../features/user/userSlice";
import { change as changeAuth } from "../features/user/authSlice";
import { save as saveProducts } from "../features/product/productsSlice";
import { change as changeRegistration } from "../features/function/registrationSlice";
import { change as changeInformation } from "../features/dashboard/informationSlice";
import { change as changeReview } from "../features/dashboard/reviewSlice";
import { change as changeUsers } from "../features/dashboard/usersSlice";
import { change as changeTransactions } from "../features/dashboard/transactionsSlice";
import { change as changeCoupons } from "../features/dashboard/couponsSlice";
import {
  active as activeSuspended,
  inactive as inactiveSuspended,
} from "../features/user/suspendedSlice";
import {
  active as activeBlock,
  inactive as inactiveBlock,
} from "../features/user/blockSlice";
import { change as changeHangTime } from "../features/user/hangTimeSlice";
import { change as changeVote } from "../features/function/voteSlice";
import { active as activeVote } from "../features/function/handlerVoteSlice";
import {
  active as activePending,
  inactive as inactivePending,
} from "../features/function/pendingSlice";
import { active as activeRegistrationControl } from "../features/user/registrationControlSlice";

import Cookies from "universal-cookie";

const cookies = new Cookies();

function Information({ children }) {
  const auth = useSelector((state) => state.auth);
  const hangTime = useSelector((state) => state.hangTime);
  const user = useSelector((state) => state.user);
  const handlerVote = useSelector((state) => state.handlerVote);

  const dispatch = useDispatch();
  const timerHelper = useRef();

  useEffect(() => {
    const checkSuspension = async () => {
      if (cookies.get("id")) await suspensionControl({ id: cookies.get("id") });
    };
    checkSuspension();
  }, []);

  useEffect(() => {
    socket.on("suspension-ended", () => dispatch(inactiveSuspended()));
    if (auth) {
      socket.on("user_connected", () => {
        socket.emit("save_current_user", {
          id: cookies.get("id"),
          socketId: socket.id,
        });
      });
    }
    return () => socket.off();
  }, [auth, dispatch]);

  useEffect(() => {
    const connectWithUser = async () => {
      const id = cookies.get("id");
      if (id !== undefined) {
        const user = await getUser({ id });
        if (!user.error) {
          dispatch(saveUser(user));
          if (user.validated) {
            dispatch(changeAuth(true));
            socket.emit("connected", id);
          } else dispatch(activeRegistrationControl());
          dispatch(
            changeRegistration({
              validated: user.validated,
              selection: user.objetive === "" ? false : true,
            })
          );
        } else cookies.remove("id");
        return;
      }
      return dispatch(changeRegistration({ validated: true, selection: true }));
    };
    dispatch(changeAuth(false));
    connectWithUser();
  }, [dispatch]);

  useEffect(() => {
    const searchProducts = async () => {
      const products = await getProducts({ blockSearch: cookies.get("id") });
      dispatch(saveProducts(products));
    };
    searchProducts();
  }, [auth, dispatch]);

  useEffect(() => {
    const getInformation = async () => await getAdminInformation();
    getInformation();
  }, []);

  useEffect(() => {
    if (Object.keys(user).length !== 0 && user.typeOfUser.user === "block")
      dispatch(activeBlock());
    else dispatch(inactiveBlock());

    if (Object.keys(user).length !== 0 && user.typeOfUser.user === "layoff")
      dispatch(activeSuspended());
    else dispatch(inactiveSuspended());
  }, [user, dispatch]);

  useEffect(() => {
    const dateTimer = async () => {
      if (
        user !== null &&
        user.typeOfUser &&
        user.typeOfUser.user === "layoff"
      ) {
        if (hangTime === null) {
          dispatch(changeHangTime(getRemainTime(user.typeOfUser.suspension)));
          timerHelper.current = setInterval(
            () =>
              dispatch(
                changeHangTime(getRemainTime(user.typeOfUser.suspension))
              ),
            1000
          );
        }
        if (hangTime !== null && hangTime.remainTime <= 1) {
          clearInterval(timerHelper.current);
          dispatch(inactiveSuspended());
          await userStatusChange({ id: cookies.get("id"), typeOfUser: "free" });
          socket.emit("suspension-ended", cookies.get("id"));
        }
      }
    };
    dateTimer();
  }, [user, hangTime, dispatch]);

  useEffect(() => {
    if (auth) {
      const searchVotePending = async () => {
        const result = await getVote({ from: user._id, voteType: "pending" });
        if (result.error) return;
        else dispatch(changeVote(result));
      };
      searchVotePending();
    }
  }, [auth, user, dispatch]);

  useEffect(() => {
    if (!handlerVote) setTimeout(() => dispatch(activeVote()), 1000);
  }, [handlerVote, dispatch]);

  useEffect(() => {
    if (auth && user !== null) {
      if (!verificationOfInformation(user.objetive, user))
        dispatch(activePending());
      else dispatch(inactivePending());
    } else dispatch(inactivePending());
  }, [user, auth, dispatch]);

  useEffect(() => {
    const getInformation = async () => {
      const result = await getDashboardInformation();
      dispatch(changeInformation(result));
      const products = await getProducts({ review: true });
      dispatch(changeReview(products));
      const users = await getUsers();
      dispatch(changeUsers(users));
      const transactions = await getTransaction();
      dispatch(changeTransactions(transactions));
      const coupons = await getCoupons();
      dispatch(changeCoupons(coupons));
    };
    getInformation();
  }, [dispatch]);

  return <Fragment>{children}</Fragment>;
}

export default Information;