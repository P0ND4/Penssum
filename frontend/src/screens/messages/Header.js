import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { change } from "../../features/user/messagesContentSlice";
import { save } from "../../features/product/productsSlice";
import { blockUser, getProducts, socket } from "../../api";
import swal from "sweetalert";

function Header() {
  const user = useSelector(state => state.user);
  const { contactActive, isBlocked } = useSelector((state) => state.messagesContent);

  const [width, setWidth] = useState(window.innerWidth);
  
  const dispatch = useDispatch();

  const changeWidth = () => setWidth(window.innerWidth);

  useEffect(() => {
    window.addEventListener("resize", changeWidth);
    return () => window.removeEventListener("resize", changeWidth);
  });

  const block = async (from, to) => {
    swal({
      title: "¿Estás seguro?",
      text: "Si bloqueas al usuario, no podrá enviarte mensajes o ver tus publicaciones, todas las notificaciones de este usuario, o cotizaciones quedarán eliminadas. Solo tú lo puedes desbloquear entrando de nuevo a su perfil y presionando el botón de desbloqueo.",
      icon: "warning",
      buttons: ["Rechazar", "Aceptar"],
    }).then(async (res) => {
      if (res) {
        const result = await blockUser({ from, to });

        if (!result.error) {
          const products = await getProducts({
            blockSearch: user._id,
          });
          dispatch(save(products));
          //await searchNotifications();

          dispatch(change({ isBlocked: { blocked: true, userView: "from" } }));
          socket.emit("send_block", { from, to });

          swal({
            title: "Usuario Bloqueado",
            text: "El usuario ha sido bloqueado con éxito.",
            icon: "success",
            timer: "2000",
            button: false,
          });

          socket.emit("received event", to);
        } else {
          swal({
            title: "Error",
            text: "Hubo un error al bloquear el usuario.",
            icon: "error",
            timer: "2000",
            button: false,
          });
        }
      }
    });
  };

  return (
    <div className="message-header">
      <div className="message-header-main">
        {width <= 700 && (
          <i
            className="fa-solid fa-bars"
            onClick={() => dispatch(change({ isActiveContact: false }))}
          ></i>
        )}
        <Link
          to={`/${
            contactActive === null || contactActive.username === undefined
              ? "messages"
              : contactActive.username === "Admin"
              ? "messages"
              : contactActive.username
          }`}
          style={{ textDecoration: "none" }}
        >
          <h1 className="message-header-title">
            {contactActive === null
              ? "Cargando..."
              : contactActive.firstName === undefined ||
                contactActive.firstName === "" ||
                contactActive.firstName === null
              ? contactActive.username === undefined ||
                contactActive.username === null
                ? "ELIMINADO"
                : contactActive.username
              : `${contactActive.firstName} .${
                  contactActive.lastName === undefined
                    ? ""
                    : contactActive.lastName.slice(0, 1)
                }`}
          </h1>
        </Link>
      </div>
      <div className="message-header-icon">
        {!isBlocked.blocked &&
        contactActive !== null &&
        contactActive.username !== "Admin" &&
        contactActive.username !== undefined ? (
          <i
            className="fas fa-ban"
            title="Bloquear"
            onClick={() => block(user._id, contactActive.idUser)}
          ></i>
        ) : (
          ""
        )}
        {/*<i className="fas fa-trash-alt" title="Eliminar Chat"></i>*/}
      </div>
    </div>
  );
}

export default Header;
