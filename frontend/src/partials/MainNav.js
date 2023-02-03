import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

// Slice redux
import { change as changeAuth } from "../features/user/authSlice";
import { logOut } from "../features/user/userSlice";

import { change as changeSearch } from "../features/function/searchSlice";

import {
  change as changeMessages,
  clean as cleanMessages,
} from "../features/user/messagesSlice";

import {
  set,
  change as changeNotifications,
  clean as cleanNotifications,
} from "../features/user/notificationsSlice";

import { change as changeFilter } from "../features/function/filterSlice";

//

import Cookies from "universal-cookie";
import { Howl, Howler } from "howler";

import {
  getNotifications,
  markNotification,
  getUncheckedMessages,
  markUncheckedMessages,
  socket,
} from "../api";
import PlainNotification from "../components/PlainNotification";

import messageSound from "../source/Message.mp3";
import { useNotificationSocket } from "../helpers/socketHandler";

const cookies = new Cookies();

function Nav() {
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);
  const search = useSelector((state) => state.search);
  const messages = useSelector((state) => state.messages);
  const notifications = useSelector((state) => state.userNotifications);
  //const filter = useSelector((state) => state.filter);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenNoLogin, setIsOpenNotLogin] = useState(false);
  const [isOpenPlainNotification, setIsOpenPlainNotification] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  let menuRef = useRef();
  let menuNoLogin = useRef();
  let plainNotificationMenu = useRef();

  useNotificationSocket();
  const changeWidth = () => setWidth(window.innerWidth);

  const searchNotifications = useCallback(async () => {
    const briefNotifications = await getNotifications(cookies.get("id"));

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
  }, [dispatch]);

  useEffect(() => {
    socket.on("new_message", async () => {
      const briefMessages = await getUncheckedMessages(cookies.get("id"));
      dispatch(changeMessages(briefMessages.wrote));
      const sound = new Howl({
        src: messageSound,
      });

      sound.play();
    });

    return () => socket.off();
  });

  useEffect(() => {
    const obtainCountInformation = async () => {
      const briefMessages = await getUncheckedMessages(cookies.get("id"));
      dispatch(changeMessages(briefMessages.wrote));
      searchNotifications();
    };
    obtainCountInformation();
  }, [searchNotifications, auth, dispatch]);

  useEffect(() => (document.getElementById("search").value = search), [search]);

  useEffect(() => {
    window.addEventListener("resize", changeWidth);
    return () => window.removeEventListener("resize", changeWidth);
  });

  useEffect(() => {
    if (!auth) {
      if (isOpenNoLogin) {
        document
          .querySelector(".nav-sidebar-no-login")
          .classList.add("nav-sidebar-no-login-active");
      } else {
        document
          .querySelector(".nav-sidebar-no-login")
          .classList.remove("nav-sidebar-no-login-active");
      }

      const handler = (e) => {
        if (menuNoLogin.current) {
          if (!menuNoLogin.current.contains(e.target)) {
            setIsOpenNotLogin(false);
          }
        }
      };

      document.addEventListener("mousedown", handler);

      return () => document.removeEventListener("mousedown", handler);
    } else {
      const handler = (element, e) => {
        if (element.current) {
          if (!element.current.contains(e.target)) {
            element === menuRef
              ? setIsOpen(false)
              : setIsOpenPlainNotification(false);
          }
        }
      };

      document.addEventListener("mousedown", (e) => handler(menuRef, e));
      document.addEventListener("mousedown", (e) =>
        handler(plainNotificationMenu, e)
      );

      return () => {
        document.removeEventListener("mousedown", (e) => handler(menuRef, e));
        document.removeEventListener("mousedown", (e) =>
          handler(plainNotificationMenu, e)
        );
      };
    }
  });

  const logOutUser = () => {
    socket.emit("logout", cookies.get("id"));
    cookies.remove("id", { path: "/" });
    dispatch(changeAuth(false));
    setIsOpen(false);
    dispatch(logOut());
    navigate("/");
  };

  const changeSearchBar = (e) => {
    dispatch(changeSearch(e.target.value));
    if (e.target.value === "") {
      navigate("/");
      dispatch(
        changeFilter({
          city: "ciudad",
          classType: "classType",
          category: "categoria",
        })
      );
    } else navigate(`/search/${e.target.value}`);
  };

  Howler.volume(0.5);

  return (
    <nav className="nav-container">
      <div className="nav-left">
        <Link to="/" className="main-logo">
          Penssum
        </Link>
        <div className="nav-icons-container">
          <Link to="/" title="Inicio">
            <i className="fa-solid fa-house nav-icons"></i>
          </Link>
          <Link to="/tasks" title="Tareas">
            <i className="fa-sharp fa-solid fa-bars-progress nav-icons"></i>
          </Link>
          <Link to="/" title="Cursos">
            <i className="fa-solid fa-book nav-icons"></i>
          </Link>
          <Link to="/" title="Tienda">
            <i className="fa-solid fa-shop nav-icons"></i>
          </Link>
        </div>
      </div>
      <div
        className="search-provider"
        style={{
          display:
            isOpenSearch && width < 600
              ? "flex"
              : width > 600
              ? "flex"
              : "none",
        }}
      >
        {/*
          <select
          id="filter-city"
          value={filter.city}
          onChange={(e) => {
            dispatch(changeFilter({ ...filter, city: e.target.value }));
            if (search === "") navigate("/search/mod=filter");
          }}
        >
          <option value="ciudad">Ciudad</option>
          <option value="ciudad">Cualquier ciudad</option>
          <option value="Bogota">Bogotá</option>
          <option value="Valle del cauca">Valle del cauca</option>
          <option value="Antioquia">Antioquia</option>
          <option value="Satander">Santander</option>
          <option value="Amazonas">Amazonas</option>
          <option value="Aracua">Aracua</option>
          <option value="Atlantico">Atlantico</option>
          <option value="Bolivar">Bolivar</option>
          <option value="Boyaca">Boyaca</option>
          <option value="Caldas">Caldas</option>
          <option value="Caqueta">Caqueta</option>
          <option value="Casanare">Casanare</option>
          <option value="Cauca">Cauca</option>
          <option value="Cesar">Cesar</option>
          <option value="Choco">Choco</option>
          <option value="Cordoba">Cordoba</option>
          <option value="Cundinamarca">Cundinamarca</option>
          <option value="Guainia">Guainia</option>
          <option value="Guaviare">Guaviare</option>
          <option value="Huila">Huila</option>
          <option value="La guajira">La guajira</option>
          <option value="Magdalena">Magdalena</option>
          <option value="Meta">Meta</option>
          <option value="Nariño">Nariño</option>
          <option value="Norte de santander">Norte de santander</option>
          <option value="Putumayo">Putumayo</option>
          <option value="Quindio">Quindio</option>
          <option value="Risaralda">Risaralda</option>
          <option value="San andres">San andres</option>
          <option value="Sucre">Sucre</option>
          <option value="Tolima">Tolima</option>
          <option value="Vaupes">Vaupes</option>
          <option value="Vichada">Vichada</option>
        </select>
        {(user.objetive === "Alumno" || !auth) && (
          <select
            id="filter-user"
            value={filter.classType}
            onChange={(e) => {
              dispatch(changeFilter({ ...filter, classType: e.target.value }));
              if (search === "") navigate("/search/mod=filter");
            }}
          >
            <option value="classType">Tipo</option>
            <option value="virtual">Virtual</option>
            <option value="presencial">Presencial</option>
            <option value="classType">Ambos</option>
          </select>
        )}
        {user.objetive === "Profesor" && auth && (
          <select
            id="filter-user"
            value={filter.category}
            onChange={(e) => {
              dispatch(changeFilter({ ...filter, category: e.target.value }));
              if (search === "") navigate("/search/mod=filter");
            }}
          >
            <option value="categoria">Categoría</option>
            <option value="Virtual">Virtual</option>
            <option value="Presencial">Presencial</option>
            <option value="Ambos">Ambos</option>
          </select>
        )}
        */}
      </div>
      <div className="nav-button-container">
        <input
          type="text"
          placeholder={
            user.objetive === "Profesor" && auth
              ? "Encuentra Publicaciones"
              : "Encuentra Profesores"
          }
          id="search"
          value={search}
          autoComplete="off"
          onChange={(e) => changeSearchBar(e)}
        />
        {auth && user.typeOfUser.user !== "block" && (
          <i class="fa-solid fa-wallet" id="wallet"></i>
        )}
        {auth && user.typeOfUser.user !== "block" && (
          <div ref={plainNotificationMenu}>
            <div
              className="user-span-container"
              onClick={() => {
                if (notifications.count > 0)
                  markNotification(cookies.get("id"));
                dispatch(cleanNotifications());
                setIsOpenPlainNotification(!isOpenPlainNotification);
              }}
            >
              <i className="fas fa-bell" id="bell"></i>
              {notifications.count > 0 ? (
                <span className="user-count">
                  {notifications.count > 3 ? "+3" : notifications.count}
                </span>
              ) : (
                ""
              )}
            </div>
            <div
              className="plain-notification-container"
              style={{ display: isOpenPlainNotification ? "block" : "none" }}
            >
              {notifications.information !== null &&
              notifications.information.length > 0 ? (
                notifications.information.map((notification) => {
                  return (
                    <div key={notification._id}>
                      <Link
                        to="/notifications"
                        style={{ textDecoration: "none" }}
                        onClick={() => setIsOpenPlainNotification(false)}
                      >
                        <PlainNotification
                          title={notification.title}
                          description={notification.description}
                          color={notification.color}
                          image={notification.image}
                        />
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="thereAreNoPlainNotification">
                  No hay notificaciones
                </p>
              )}
              {notifications.information !== null &&
              notifications.information.length > 0 && (
                <Link
                  to="/notifications"
                  className="notification-view"
                  onClick={() => setIsOpenPlainNotification(false)}
                >
                  Ver todas las notificaciones
                </Link>
              )}
            </div>
          </div>
        )}
        {auth && user.typeOfUser.user !== "block" && (
          <Link
            to="/messages"
            className="user-span-container"
            style={{ textDecoration: "none" }}
            onClick={() => {
              dispatch(cleanMessages());
              if (messages > 0) markUncheckedMessages(cookies.get("id"));
            }}
          >
            <i className="fas fa-envelope" id="user-messages"></i>
            {messages > 0 && (
              <span className="user-count">
                {messages > 3 ? "+3" : messages}
              </span>
            )}
          </Link>
        )}
        <i
          className="fas fa-search"
          id="icon-search"
          onClick={() => setIsOpenSearch(!isOpenSearch)}
        ></i>
        {!auth ? (
          <div>
            <div className="nav-button">
              <Link to="/signup">
                <button id="signup">Regístrate</button>
              </Link>
              <Link to="/signin">
                <button id="signin">Ingresar</button>
              </Link>
              <i
                id="bars"
                className="fas fa-bars"
                onClick={() => setIsOpenNotLogin(true)}
              ></i>
            </div>
            <div
              ref={menuNoLogin}
              className="nav-sidebar-no-login"
              style={{ display: width < 600 ? "block" : "none" }}
            >
              <div className="nav-title-container-no-login">
                <i
                  className="fas fa-chevron-left"
                  onClick={() => setIsOpenNotLogin(false)}
                ></i>
                <h1 className="nav-sidebar-name">
                  {user.firstName === "" ? user.username : user.firstName}
                </h1>
              </div>
              <div className="nav-user-not-register">
                <Link
                  to="/signin"
                  className="nav-sidebar-link-divider"
                  onClick={() => setIsOpenNotLogin(false)}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  <h2 className="nav-sidebar-link">Iniciar Sesión</h2>
                </Link>
                <hr />
                <Link
                  className="nav-sidebar-link-divider"
                  to="/signup"
                  onClick={() => setIsOpenNotLogin(false)}
                >
                  <i className="fa-solid fa-user"></i>
                  <h2 className="nav-sidebar-link">Regístrate</h2>
                </Link>
                <hr />
                <Link
                  className="nav-sidebar-link-divider"
                  to="/help"
                  onClick={() => setIsOpenNotLogin(false)}
                >
                  <i className="fa-solid fa-circle-question"></i>
                  <h2 className="nav-sidebar-link">Ayuda y contacto</h2>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div ref={menuRef}>
            <div className="auth-successfuly">
              <button
                id="account"
                style={{ background: isOpen ? "#2c373d" : "transparent" }}
                onClick={() => setIsOpen(!isOpen)}
              >
                <img
                  src={
                    user.profilePicture === null
                      ? "/img/noProfilePicture.png"
                      : user.profilePicture
                  }
                  className="nav-profile-image"
                  referrerPolicy="no-referrer"
                  alt="imagen de perfil"
                />
              </button>
            </div>
            <div
              className="nav-sidebar-container"
              style={{ display: isOpen ? "flex" : "none" }}
            >
              <div className="nav-sidebar">
                <div className="nav-title-container">
                  <i
                    className="fas fa-chevron-left"
                    id="fa-chevron-left"
                    onClick={() => setIsOpen(false)}
                  ></i>
                  <h1 className="nav-sidebar-name">
                    {user.firstName === "" ? user.username : user.firstName}
                  </h1>
                </div>
                <div className="main-nav-sidebar-link">
                  {user.typeOfUser.user !== "block" && (
                    <div>
                      <Link
                        to="/improvement/comment"
                        className="nav-sidebar-link-divider"
                        onClick={() => setIsOpen(false)}
                      >
                        <i className="far fa-comments"></i>
                        <div className="nav-sidebar-link-comment-container">
                          <h2 className="nav-sidebar-link-comment">
                            Enviar Comentarios
                          </h2>
                          <p>Ayúdanos a mejorar la nueva versión de Penssum</p>
                        </div>
                      </Link>
                      <hr />
                      <div>
                        <Link
                          to={`/${user.username}`}
                          className="nav-sidebar-link-divider"
                          onClick={() => setIsOpen(false)}
                        >
                          <i className="far fa-user-circle"></i>
                          <h2 className="nav-sidebar-link">Perfil</h2>
                        </Link>
                        <Link
                          className="nav-sidebar-link-divider"
                          to="/messages"
                          onClick={() => setIsOpen(false)}
                        >
                          <i className="fas fa-envelope"></i>
                          <h2 className="nav-sidebar-link">Mensajes</h2>
                        </Link>
                        <Link
                          className="nav-sidebar-link-divider"
                          to="/preference/general"
                          onClick={() => setIsOpen(false)}
                        >
                          <i className="fas fa-cog"></i>
                          <h2 className="nav-sidebar-link">Preferencias</h2>
                        </Link>
                        <Link
                          className="nav-sidebar-link-divider"
                          to="/report"
                          onClick={() => setIsOpen(false)}
                        >
                          <i className="fas fa-exclamation-triangle"></i>
                          <h2 className="nav-sidebar-link">Reportar</h2>
                        </Link>
                        <Link
                          className="nav-sidebar-link-divider"
                          to="/help"
                          onClick={() => setIsOpen(false)}
                        >
                          <i className="far fa-question-circle"></i>
                          <h2 className="nav-sidebar-link">Ayuda y soporte</h2>
                        </Link>
                      </div>
                    </div>
                  )}
                  <hr />
                  <button
                    className="nav-sidebar-link-divider logout"
                    id="logout"
                    onClick={() => logOutUser()}
                  >
                    <i className="fas fa-door-open"></i>
                    <h2 className="nav-sidebar-link">Cerrar Sesión</h2>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Nav;
