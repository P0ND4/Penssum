import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUser,
  getVote,
  socket,
  getProducts,
  getOffer,
  getTransaction,
  reviewBlocked,
  getTask,
  increaseView,
  teacherPayment,
  removeFiles,
  deleteProduct,
} from "../api";
import { useNotificationSocket } from "../helpers/socketHandler";
import { change as changeInformation } from "../features/product/informationSlice";
import { save } from "../features/product/productsSlice";
import { increment } from "../features/user/messagesSlice";
import swal from "sweetalert";
import Loading from "../components/Loading";

function LoadingZone({ children }) {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const {
    productFound,
    copied,
    scoreUpdated,
    teacherUsername,
    task,
    sentReportTransaction,
  } = useSelector((state) => state.postInformation);

  const { post_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const closeTimerCopied = useRef();
  const closeTimerScoreUpdated = useRef();

  useNotificationSocket();

  useEffect(() => {
    if (productFound !== null && productFound.takenBy) {
      const checkVote = async () => {
        const result = await getUser({ id: productFound.takenBy });
        if (!result.error) dispatch(changeInformation({ teacher: result }));
      };
      checkVote();
    }
  }, [productFound, user, dispatch]);

  useEffect(() => {
    if (productFound !== null && productFound.takenBy) {
      const checkVote = async () => {
        const result = await getVote({
          to: user._id,
          from: productFound.takenBy,
          voteType: "product",
        });
        if (!result.error) dispatch(changeInformation({ currentVote: result }));
      };
      checkVote();
    }
  }, [productFound, user, dispatch]);

  useEffect(() => {
    socket.on("product updated", async ({ product, global, remove }) => {
      if (product._id === post_id) {
        if (remove) {
          dispatch(changeInformation({ offerTeacher: null }));
          dispatch(changeInformation({ offerVerification: null }));
        }

        dispatch(changeInformation({ offerTeacher: null }));
        dispatch(changeInformation({ productFound: product }));
        if (global) {
          const currentProductsCollections = await getProducts({
            blockSearch: user._id,
          });
          dispatch(save(currentProductsCollections));
        }
      }
    });

    socket.on("product deleted", ({ finished }) => {
      if (finished) {
        swal({
          title: "PAGO ACEPTADO",
          text: "¡El estudiante ha aceptado la solicitud de pago que has hecho! FELICIDADES, la publicación será eliminada.",
          icon: "success",
          button: "!Gracias!",
        }).then(() => navigate(`/${teacherUsername}`));
      } else {
        swal({
          title: "PUBLICACIÓN ELIMINADA",
          text: "La publicación ha sido eliminada por el estudiante, si crees que has sufrido de estafa, por favor reporta.",
          icon: "error",
          button: "Ok",
        }).then(() => navigate(`/${teacherUsername}`));
      }
    });

    socket.on("new offer", async ({ productID }) => {
      if (productID === post_id) {
        const result = await getOffer({ id_product: post_id });
        if (!result.error) dispatch(changeInformation({ offer: result }));
      }
    });

    socket.on("new_message", () => dispatch(increment()));

    socket.on("offer event", async ({ productID }) => {
      if (productID === post_id) {
        const result = await getOffer({
          id_user: user._id,
          id_product: post_id,
        });
        if (!result.error)
          dispatch(changeInformation({ offerVerification: result }));
        else dispatch(changeInformation({ offerVerification: null }));

        dispatch(
          changeInformation({
            productFound: { ...productFound, takenBy: user._id },
          })
        );

        if (productFound.takenBy) {
          const result = await getOffer({
            id_user: productFound.takenBy,
            id_product: post_id,
          });
          dispatch(changeInformation({ offerTeacher: result }));
        }
      }
    });

    return () => socket.off();
  });

  useEffect(() => {
    if (copied) {
      clearTimeout(closeTimerCopied.current);
      closeTimerCopied.current = setTimeout(
        () => dispatch(changeInformation({ copied: false })),
        2000
      );
    }
  }, [copied, dispatch]);

  useEffect(() => {
    if (productFound && user) {
      if (productFound.owner === user._id) {
        const checkTransaction = async () => {
          const result = await getTransaction({
            checkVerification: user._id,
            post_id,
          });
          if (result.error)
            dispatch(changeInformation({ sentReportTransaction: true }));
          else dispatch(changeInformation({ sentReportTransaction: false }));
        };
        checkTransaction();
      } else dispatch(changeInformation({ sentReportTransaction: false }));
    }
  }, [user, productFound, post_id, dispatch]);

  useEffect(() => {
    const searchOffers = async () => {
      const result = await getOffer({ id_product: post_id });
      if (!result.error) dispatch(changeInformation({ offer: result }));
    };
    searchOffers();
  }, [post_id, productFound, dispatch]);

  useEffect(() => {
    if (auth) {
      const checkOffer = async () => {
        const result = await getOffer({
          id_user: user._id,
          id_product: post_id,
        });
        if (!result.error)
          dispatch(changeInformation({ offerVerification: result }));

        if (productFound !== null && productFound.takenBy) {
          const result = await getOffer({
            id_user: productFound.takenBy,
            id_product: post_id,
          });
          dispatch(changeInformation({ offerTeacher: result }));
        }
      };
      checkOffer();
    }
  }, [auth, post_id, user, productFound, dispatch]);

  useEffect(() => {
    const watchLock = async () => {
      const result = await reviewBlocked({
        from: user._id,
        to: post_id,
        productFound: true,
      });

      if (result.length > 0) {
        navigate("/");
      }
    };
    watchLock();
  }, [post_id, user, navigate]);

  useEffect(() => {
    if (productFound !== null && productFound.takenBy !== null) {
      const checkTask = async () => {
        const taskObtained = await getTask({
          from: productFound.takenBy,
          to: productFound.owner,
          productId: post_id,
        });
        if (
          taskObtained === null ||
          taskObtained.length === 0 ||
          taskObtained === ""
        )
          dispatch(changeInformation({ task: false }));
        else dispatch(changeInformation({ task: taskObtained }));
      };
      checkTask();
    } else if (productFound !== null)
      dispatch(changeInformation({ task: false }));
  }, [productFound, post_id, dispatch]);

  useEffect(() => {
    const checkProduct = async () => {
      if (productFound !== null && productFound.takenBy !== null) {
        const teacher = await getUser({ id: productFound.takenBy });
        dispatch(changeInformation({ teacherUsername: teacher.username }));
      }
    };
    checkProduct();
  }, [productFound, dispatch]);

  useEffect(() => {
    const searchProducts = async () => {
      const productObtained = await getProducts({ id: post_id });
      if (productObtained.error || productObtained.length === 0) navigate("/");
      else {
        if (productObtained.takenBy !== null) {
          const teacher = await getUser({ id: productObtained.takenBy });
          dispatch(changeInformation({ teacherUsername: teacher.username }));
        }
        dispatch(changeInformation({ productFound: productObtained }));
        if (auth) {
          await increaseView(post_id);
        }
      }
    };
    searchProducts();
  }, [post_id, navigate, auth, dispatch]);

  useEffect(() => {
    if (scoreUpdated) {
      clearTimeout(closeTimerScoreUpdated.current);
      closeTimerScoreUpdated.current = setTimeout(
        () => dispatch(changeInformation({ scoreUpdated: false })),
        2000
      );
    }
  }, [scoreUpdated, dispatch]);

  useEffect(() => {
    if (productFound !== null && productFound.takenBy) {
      const searchUserToVote = async () => {
        const result = await getUser({
          id:
            user._id === productFound.owner
              ? productFound.takenBy
              : productFound.owner,
        });
        dispatch(changeInformation({ userToVote: result }));
      };
      searchUserToVote();
    }
  }, [productFound, user, dispatch]);

  useEffect(() => {
    const checkDate = async () => {
      if (
        user.objetive === "Profesor" &&
        productFound !== null &&
        productFound.paymentRequest.active === true
      ) {
        const dateLimit = new Date(productFound.paymentRequest.timeLimit);
        const currentDate = new Date();

        if (currentDate.getTime() >= dateLimit.getTime()) {
          dispatch(changeInformation({ sendingInformation: true }));
          await teacherPayment({
            typeData: "accept",
            post_id,
            user_id: productFound.owner,
          });
          await removeFiles({ files: productFound.files, activate: true });
          await deleteProduct({
            id: post_id,
            notification: false,
            finished: true,
          });
          socket.emit("received event", productFound.takenBy);
          dispatch(changeInformation({ sendingInformation: false }));
          const currentProductsCollections = await getProducts({
            blockSearch: user._id,
          });
          dispatch(save(currentProductsCollections));
          swal({
            title: "! FELICIDADES !",
            text: "Se ha cumplido el tiempo de espera, te hemos enviado el pago de la publicación.",
            icon: "success",
            button: "!Gracias!",
          }).then(() => navigate("/"));
        }
      }
    };
    checkDate();
  }, [productFound, navigate, user, post_id, dispatch]);


  return productFound !== null &&
    task !== null &&
    sentReportTransaction !== null ? (
    <>{children}</>
  ) : (
    <div style={{ paddingTop: "40px" }}>
      <Loading margin="auto" />
    </div>
  );
}

export default LoadingZone;