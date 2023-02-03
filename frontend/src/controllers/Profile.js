import { Fragment, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router";
import {
  getUser,
  getProducts,
  socket,
  reviewBlocked,
  removeBlock,
  getNotifications,
  getTransaction,
  getVote,
  totalMoney,
} from "../api";

import { save as saveProducts } from "../features/product/productsSlice";
import {
  change as changeNotifications,
  set,
} from "../features/user/notificationsSlice";
import {
  changeUser as changeProfile,
  changeScore,
  changeBlocked,
  changeTransaction,
  changeMoney,
  changeTasksTaken,
  changeProducts,
  changeZone,
} from "../features/function/profileSlice";

import Loading from "../components/Loading";

import swal from "sweetalert";

function Profile({ children }) {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const {
    user: foundUserInformation,
    isBlocked,
    products: userProducts,
    zone,
  } = useSelector((state) => state.profile);

  const [changeUsername, setChangeUsername] = useState(false);

  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const taskProducts = useRef(null);
  const productsCreated = useRef(null);

  useEffect(() => {
    const searchProducts = async () => {
      const userFound = await getUser({ username });
      taskProducts.current = await getProducts({ tasks: userFound._id });
      const userProducts = await getProducts({ username });
      productsCreated.current = userProducts;
      dispatch(changeTasksTaken(userProducts.length));
      dispatch(
        changeZone(userFound.objetive === "Profesor" ? "tasks" : "created")
      );
    };
    searchProducts();
  }, [username, dispatch, user]);

  useEffect(() => {
    if (zone === "tasks") dispatch(changeProducts(taskProducts.current));
    if (zone === "created") dispatch(changeProducts(productsCreated.current));
  }, [zone, dispatch]);

  useEffect(() => {
    const checkVote = async () => {
      if (foundUserInformation !== null) {
        const result = await getVote({
          to: foundUserInformation._id,
          voteType: "user",
        });
        dispatch(changeScore(result));
      }
    };
    checkVote();
  }, [foundUserInformation, dispatch]);

  useEffect(() => setChangeUsername(true), [username]);

  useEffect(() => {
    const getUserParams = async () => {
      if (changeUsername) {
        const userObtained = await getUser({ username });
        if (userObtained.error) return navigate("/");
        dispatch(changeProfile(userObtained));
        if (
          userObtained.objetive === "Profesor" &&
          user.username === username
        ) {
          const { amount } = await totalMoney({ tasks: userObtained._id });
          dispatch(changeMoney(amount));
          const userTransaction = await getTransaction({ userID: user._id });
          if (!userTransaction.error) {
            dispatch(
              changeTransaction({
                active: true,
                amount: userTransaction.amount,
              })
            );
          }
        }
      }
    };
    getUserParams();
    return () => setChangeUsername(false);
  }, [navigate, username, userProducts, changeUsername, dispatch, user]);

  useEffect(() => {
    const watchLock = async () => {
      const id = user._id;
      if (id !== undefined && foundUserInformation !== null) {
        const result = await reviewBlocked({
          from: id,
          to: foundUserInformation._id,
        });
        if (result.length > 0) {
          dispatch(
            changeBlocked({
              blocked: true,
              userView: result[0].from === user._id ? "from" : "to",
            })
          );
          if (result[0].from === user._id) {
            swal({
              title: "¿Quieres quitar el bloqueo?",
              text: "Si quitas el bloqueo podrás ver las publicaciones de este usuario, aparte que también podrá enviarte mensajes, entre otras funcionalidades.",
              icon: "warning",
              buttons: ["Rechazar", "Aceptar"],
            }).then(async (res) => {
              if (res) {
                await removeBlock({ from: id, to: foundUserInformation._id });
                dispatch(changeBlocked({ blocked: false, userView: null }));

                const products = await getProducts({ blockSearch: id });
                dispatch(saveProducts(products));
                const briefNotifications = await getNotifications(user._id);
                socket.emit("unlocked", {
                  userID: foundUserInformation._id,
                  from: user._id,
                });
                socket.emit("received event", foundUserInformation._id);

                const currentNotification = [];
                let count = 0;

                for (let i = 0; i < 3; i++) {
                  if (briefNotifications[i] !== undefined)
                    currentNotification.push(briefNotifications[i]);
                }
                for (let i = 0; i < briefNotifications.length; i++) {
                  if (!briefNotifications[i].view) count += 1;
                }

                dispatch(set(count));
                dispatch(changeNotifications(currentNotification));
              }
            });
          }
        } else dispatch(changeBlocked({ blocked: false, userView: null }));
      }
    };
    watchLock();
  }, [foundUserInformation, dispatch, user]);

  return userProducts !== null &&
    (isBlocked.blocked !== null || !auth) &&
    foundUserInformation !== null ? (
    foundUserInformation.typeOfUser.user !== "block" ? (
      <Fragment>{children}</Fragment>
    ) : (
      <div className="user-block-container">
        <h1>
          <i className="fas fa-ban"></i> Usuario bloqueado{" "}
          <i className="fas fa-ban"></i>
        </h1>
        <p>
          Este usuario ha sido bloqueado por los moderadores porque no cumple
          las políticas del uso de Pénsum.
        </p>
      </div>
    )
  ) : (
    <div style={{ paddingTop: "40px" }}>
      <Loading margin="auto" />
    </div>
  );
}

export default Profile;