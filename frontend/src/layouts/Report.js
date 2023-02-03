import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import swal from "sweetalert";
import {
  getUser,
  sendReport,
  blockUser,
  getProducts,
  reviewBlocked,
  removeFiles,
  getNotifications,
  getTransaction,
  sendTransactionVerification,
} from "../api";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

// Slice redux
import { save } from "../features/product/productsSlice";
import { clean } from "../features/function/filesSlice";
import {
  set,
  change as changeNotifications,
} from "../features/user/notificationsSlice";
import { change as changeUser } from "../features/user/reportSlice";
import { change as changeProduct } from "../features/product/reportSlice";
import { inactive as inactiveTransaction } from "../features/function/transactionSlice";
import Form from "../screens/report/Form";

const cookies = new Cookies();

function Report() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const files = useSelector((state) => state.files);
  const reportProduct = useSelector((state) => state.reportProduct);
  const transaction = useSelector((state) => state.transaction);

  const [sendingInformation, setSendingInformation] = useState(false);
  const [error, setError] = useState(false);
  const [errorContent, setErrorContent] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (transaction) {
      const checkTransaction = async () => {
        const result = await getTransaction({
          checkVerification: cookies.get("id"),
          post_id: transaction,
        });
        if (!result.error) {
          dispatch(inactiveTransaction());
          dispatch(changeProduct(null));
        }
      };
      checkTransaction();
    }
  }, [transaction, dispatch]);

  const validateReport = async (data) => {
    const { description, report, amount } = data;
    setError(false);
    setErrorContent("");

    if (transaction) {
      setSendingInformation(true);
      await sendTransactionVerification({
        userID: cookies.get("id"),
        post_id: reportProduct,
        amount,
        description,
        files,
      });
      setSendingInformation(false);
      swal({
        title: "!Éxito!",
        text: "Se ha completado el envío de la verificación de transacción.",
        icon: "success",
        timer: "3000",
        button: false,
      }).then(() => navigate(`/post/information/${reportProduct}`));
    } else {
      setSendingInformation(true);
      const user = await getUser({ username: report });

      if (!user.error) {
        const result = await reviewBlocked({
          from: cookies.get("id"),
          to: user._id,
        });

        if (result.length > 0) {
          swal({
            title: "Error",
            text: "No puedes enviar un reporte a un usuario bloqueado.",
            icon: "error",
            timer: "3000",
            button: false,
          });

          dispatch(changeUser(""));
          await removeFiles({ files });
        } else {
          swal({
            title: "¿Quieres bloquear al usuario?",
            text: "Si bloqueas al usuario no podrá enviarte mensajes o ver tus publicaciones, al igual que tú. Solo lo puedes desbloquear entrando de nuevo a su perfil y presionando el botón de desbloqueo.",
            icon: "info",
            closeOnClickOutside: false,
            closeOnEsc: false,
            buttons: {
              cancel: {
                text: "Rechazar",
                value: false,
                visible: true,
              },
              confirm: {
                text: "Aceptar",
                value: true,
              },
            },
          }).then(async (res) => {
            if (res) {
              await blockUser({ from: cookies.get("id"), to: user._id });
              await sendReport({
                from: cookies.get("id"),
                userToReport: report,
                description,
                files,
                post_id: reportProduct,
              });

              const products = await getProducts({
                blockSearch: cookies.get("id"),
              });
              dispatch(save(products));

              const briefNotifications = await getNotifications(
                cookies.get("id")
              );

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
            } else {
              await sendReport({
                from: cookies.get("id"),
                userToReport: report,
                description,
                files,
              });
            }
            swal({
              title: "!Éxito!",
              text: "Se ha completado el reporte.",
              icon: "success",
              timer: "3000",
              button: false,
            }).then(() => navigate("/"));
          });
        }
        dispatch(clean());
        setSendingInformation(false);
      } else {
        swal({
          title: "Error",
          text: "El usuario no existe.",
          icon: "error",
          timer: "3000",
          button: false,
        });
        setSendingInformation(false);
      }
    }
  };

  return (
    <div className="report-container">
      <div className="report">
        <h1 className="report-title">
          {transaction ? "Comprobar transacción" : "Reporta usuario"}
        </h1>
        <form
          className="report-form"
          onSubmit={handleSubmit((data) => {
            if (!sendingInformation) validateReport(data);
          })}
        >
          <Form
            error={error}
            errors={errors}
            errorContent={errorContent}
            register={register}
            setError={setError}
            setErrorContent={setErrorContent}
            setSendingInformation={setSendingInformation}
            sendingInformation={sendingInformation}
          />
        </form>
      </div>
    </div>
  );
}

export default Report;