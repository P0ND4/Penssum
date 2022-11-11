import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import {
  getUser,
  getProducts,
  changePhoto,
  blockUser,
  socket,
  reviewBlocked,
  removeBlock,
  //   filterProducts,
  getNotifications,
  getTransaction,
  getVote,
  getOffer,
} from "../../../api";
import {
  changeDate,
  thousandsSystem,
  verificationOfInformation,
  defineName,
} from "../../helpers";
import getCroppedImg from "../../parts/user/cropImage";
import Cropper from "react-easy-crop";
import swal from "sweetalert";
import Cookies from "universal-cookie";

import Product from "../../parts/Product";
import Loading from "../../parts/Loading";

const cookies = new Cookies();

function Profile({
  mainUsername,
  userInformation,
  setUserInformation,
  auth,
  setProducts,
  setReportUsername,
  setNotifications,
  setCountInNotification,
  isTheUserSuspended,
  deadline,
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 });
  const [photoType, setPhotoType] = useState("");
  const [foundUserInformation, setFoundUserInformation] = useState(null);
  const [userProducts, setUserProducts] = useState(null);
  const [isBlocked, setIsBlocked] = useState({ blocked: null, userView: null });
  const [userTransaction, setUserTransaction] = useState({
    transaction: false,
    amount: 0,
  });
  const [informationIsActivated, setInformationIsActivated] = useState(false);
  const [tasksTaken, setTasksTaken] = useState(0);
  /*const [filter, setFilter] = useState({
        mainCategory: 'category',
        mainSubcategory: 'subcategory'
    });*/
  const [score, setScore] = useState({ votes: 0, count: 0 });
  const [zone, setZone] = useState("tasks");
  const [moneyHandler, setMoneyHandler] = useState(0);

  const { username } = useParams();
  const navigate = useNavigate();

  const searchPhoto = useRef();
  const newsSpan = useRef();
  const userProfile = useRef();
  const userInformationDetails = useRef();
  const changePhotoToCover = useRef();

  useEffect(() => {
    const checkVote = async () => {
      if (foundUserInformation !== null) {
        const result = await getVote({
          to: foundUserInformation._id,
          voteType: "user",
        });

        setScore(result);
      }
    };
    checkVote();
  }, [foundUserInformation]);

  useEffect(() => {
    const getUserParams = async () => {
      if (!userProducts) {
        const user = await getUser({ username });
        let userProducts;
        if (user.objetive === "Profesor") {
          userProducts = await getProducts({ tasks: user._id });

          for (let i = 0; i < userProducts.length; i++) {
            let amount = 0;

            if (userProducts[i].paymentRequest.active) {
              const result = await getOffer({
                id_user: user._id,
                id_product: userProducts[i]._id,
              });
              if (!result.error) {
                amount += result.amountNumber;
                setMoneyHandler(amount);
              } else {
                amount += userProducts[i].valueNumber;
                setMoneyHandler(amount);
              }
            }
          }

          setTasksTaken(userProducts.length);
        } else userProducts = await getProducts({ username });
        const userTransaction = await getTransaction({
          userID: cookies.get("id"),
        });
        if (user.error) return navigate("/");
        if (!userTransaction.error) {
          setUserTransaction({
            transaction: true,
            amount: userTransaction.amount,
          });
        }
        setFoundUserInformation(user);
        setUserProducts(userProducts);
      }
    };
    getUserParams();
  }, [navigate, username, foundUserInformation, userProducts]);

  useEffect(() => {
    const searchProducts = async () => {
      if (zone === "tasks") {
        const products = await getProducts({ tasks: userInformation._id });
        setUserProducts(products);
      }

      if (zone === "created") {
        const products = await getProducts({ username });
        setUserProducts(products);
      }
    };
    searchProducts();
  }, [zone, userInformation, username]);

  useEffect(() => {
    const watchLock = async () => {
      const id = cookies.get("id");

      if (id !== undefined && foundUserInformation !== null) {
        const result = await reviewBlocked({
          from: id,
          to: foundUserInformation._id,
        });

        if (result.length > 0) {
          setIsBlocked({
            blocked: true,
            userView: result[0].from === cookies.get("id") ? "from" : "to",
          });
          if (result[0].from === cookies.get("id")) {
            swal({
              title: "¿Quieres quitar el bloqueo?",
              text: "Si quitas el bloqueo podrás ver las publicaciones de este usuario, aparte que también podrá enviarte mensajes, entre otras funcionalidades.",
              icon: "warning",
              buttons: ["Rechazar", "Aceptar"],
            }).then(async (res) => {
              if (res) {
                await removeBlock({ from: id, to: foundUserInformation._id });
                setIsBlocked({ blocked: false, userView: null });

                const products = await getProducts({ blockSearch: id });
                setProducts(products);
                const briefNotifications = await getNotifications(
                  cookies.get("id")
                );
                socket.emit("unlocked", {
                  userID: foundUserInformation._id,
                  from: userInformation._id,
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

                setCountInNotification(count);
                setNotifications(currentNotification);
              }
            });
          }
        } else setIsBlocked({ blocked: false, userView: null });
      }
    };
    watchLock();
  }, [
    foundUserInformation,
    setProducts,
    setCountInNotification,
    setNotifications,
    userInformation,
  ]);

  const getNotificationsInProfile = async () => {
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

    setCountInNotification(count);
    setNotifications(currentNotification);
  };

  const block = async (from, to) => {
    swal({
      title: "¿Estás seguro?",
      text: "Si bloqueas al usuario, no podrá enviarte mensajes o ver tus publicaciones, todas las notificaciones de este usuario, o cotizaciones quedarán eliminadas. Solo tú lo puedes desbloquear entrando de nuevo a su perfil y presionando el botón de desbloqueo.",
      icon: "warning",
      buttons: ["Rechazar", "Aceptar"],
    }).then(async (res) => {
      if (res) {
        const result = await blockUser({ from, to });
        socket.emit("received event", to);

        if (!result.error) {
          const products = await getProducts({
            blockSearch: cookies.get("id"),
          });
          setProducts(products);

          await getNotificationsInProfile();

          swal({
            title: "Usuario Bloqueado",
            text: "El usuario ha sido bloqueado con éxito.",
            icon: "success",
            timer: "2000",
            button: false,
          }).then(() => navigate("/"));
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

  const sendMessage = (transmitter, receiver) => {
    swal({
      title: "ESCRIBE EL MENSAJE",
      content: {
        element: "input",
        attributes: {
          placeholder: "Mensaje",
          type: "text",
        },
      },
      button: "Enviar",
    }).then((value) => {
      if (value === null) return;

      if (value) {
        socket.emit("send_message", transmitter, receiver, value);

        swal({
          title: "Enviado",
          text: "Mensaje enviado con éxito",
          icon: "success",
          timer: "2000",
          button: false,
        });
      }
    });
  };

  const saveCroppedImage = useCallback(async () => {
    newsSpan.current.textContent = "!Guardado con éxito!";

    try {
      const { file } = await getCroppedImg(imgSrc, croppedAreaPixels);
      closeCropArea();
      const formData = new FormData();
      formData.append("image", file, file.name);
      formData.set(
        "oldPhoto",
        photoType === "profile"
          ? foundUserInformation.profilePicture
          : photoType === "cover"
          ? foundUserInformation.coverPhoto
          : ""
      );
      formData.set("photoType", photoType);
      formData.set("id", cookies.get("id"));

      const result = await changePhoto(formData);

      if (result.error) {
        newsSpan.current.textContent = "Hubo un error";
        newsSpan.current.classList.add("news-span-active");
        setTimeout(
          () => newsSpan.current.classList.remove("news-span-active"),
          4000
        );
      } else {
        if (photoType === "profile") {
          setUserInformation({
            ...userInformation,
            profilePicture: result.url,
          });
          setFoundUserInformation({
            ...foundUserInformation,
            profilePicture: result.url,
          });
        } else if (photoType === "cover") {
          setFoundUserInformation({
            ...foundUserInformation,
            coverPhoto: result.url,
          });
          setUserInformation({
            ...userInformation,
            coverPhoto: result.url,
          });
        }
        newsSpan.current.classList.add("news-span-active");
        setTimeout(
          () => newsSpan.current.classList.remove("news-span-active"),
          4000
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    croppedAreaPixels,
    imgSrc,
    foundUserInformation,
    userInformation,
    setUserInformation,
    photoType,
  ]);

  const uploadedImage = (image, photoType) => {
    photoType === "cover"
      ? setCropSize({ width: 350, height: 100 })
      : setCropSize({ width: 200, height: 200 });
    window.scrollTo(0, 0);
    document.querySelector("body").style.overflow = "hidden";
    setImgSrc(URL.createObjectURL(image));
  };

  const closeCropArea = () => {
    setImgSrc(null);
    searchPhoto.current.value = "";
    document.querySelector("body").style.overflow = "auto";
  };

  /*const searchByFilter = async e => {
        document.getElementById("subcategory-secondary").value = '';

        setFilter({
            ...filter,
            [e.target.name]: e.target.value
        });

        const products = await filterProducts({
            idUser: foundUserInformation._id,
            category: (e.target.name === 'mainCategory') ? e.target.value : filter.mainCategory,
            subCategory: (e.target.name === 'mainSubcategory') ? e.target.value : filter.mainSubcategory
        });
        setUserProducts(products);
    };*/

  const checkAuth = (typeOfButton) => {
    if (!auth) {
      swal({
        title: "No estás registrado",
        text:
          typeOfButton === "quote"
            ? "Para enviar una actividad necesitas tener una cuenta como PROFESOR ¿quieres crear una cuenta?"
            : "Para hacer una publicación necesitas tener una cuenta como Alumno, ¿quieres crear una cuenta?",
        icon: "info",
        buttons: ["No", "Si"],
      }).then((res) => res && navigate("/signup"));
    } else
      navigate(
        verificationOfInformation(userInformation.objetive, userInformation)
          ? typeOfButton === "quote"
            ? "/send/quote"
            : "/post/activity"
          : "/complete/information"
      );
  };

  return userProducts !== null &&
    (isBlocked.blocked !== null || !auth) &&
    foundUserInformation !== null ? (
    foundUserInformation.typeOfUser.user !== "block" ? (
      <div className="profile-container">
        <header
          className="user-profile-container"
          style={{
            background: `linear-gradient(45deg, #1B262Cbb,#0F4C7588), url(${
              foundUserInformation.coverPhoto === null ||
              foundUserInformation.coverPhoto === undefined
                ? "/img/cover.jpg"
                : foundUserInformation.coverPhoto
            })`,
          }}
        >
          <div className="user-profile" ref={userProfile}>
            <div className="user-profile-option-container">
              <div className="union-user-profile-picture">
                {mainUsername === username ? (
                  <label
                    htmlFor="change-profile-picture"
                    className="edit-user-profile-picture"
                    title="Edita la foto de perfil"
                    onClick={() => setPhotoType("profile")}
                  >
                    <i className="fa fa-pencil"></i>
                  </label>
                ) : (
                  ""
                )}
                <img
                  src={
                    foundUserInformation.profilePicture === null ||
                    foundUserInformation.profilePicture === undefined
                      ? "/img/noProfilePicture.png"
                      : foundUserInformation.profilePicture
                  }
                  className="profile-picture"
                  referrerPolicy="no-referrer"
                  alt="imagen de perfil"
                />
              </div>
              {mainUsername !== username && auth && !isBlocked.blocked && (
                <div
                  className="user-option-icon"
                  style={{
                    justifyContent:
                      (foundUserInformation.objetive === "Alumno" &&
                        userInformation.objetive === "Alumno") ||
                      (foundUserInformation.objetive === "Profesor" &&
                        userInformation.objetive === "Profesor")
                        ? "center"
                        : "",
                    width:
                      (foundUserInformation.objetive === "Alumno" &&
                        userInformation.objetive === "Alumno") ||
                      (foundUserInformation.objetive === "Profesor" &&
                        userInformation.objetive === "Profesor")
                        ? "60px"
                        : "",
                  }}
                >
                  {((foundUserInformation.objetive === "Profesor" &&
                    userInformation.objetive === "Alumno") ||
                    (foundUserInformation.objetive === "Alumno" &&
                      userInformation.objetive === "Profesor")) && (
                    <i
                      className="fas fa-ban"
                      title="Bloquear"
                      onClick={() =>
                        block(cookies.get("id"), foundUserInformation._id)
                      }
                    ></i>
                  )}
                  {((foundUserInformation.objetive === "Profesor" &&
                    userInformation.objetive === "Alumno") ||
                    (foundUserInformation.objetive === "Alumno" &&
                      userInformation.objetive === "Profesor")) && (
                    <i
                      className="fas fa-paper-plane"
                      title="Enviar mensaje"
                      onClick={() =>
                        sendMessage(cookies.get("id"), foundUserInformation._id)
                      }
                    ></i>
                  )}
                  <i
                    className="fas fa-exclamation-triangle"
                    title="Reportar usuario"
                    onClick={() => {
                      setReportUsername(username);
                      navigate("/report");
                    }}
                  ></i>
                </div>
              )}
            </div>

            <div className="profile-cover">
              {isBlocked.blocked && (
                <div className="profile-blocked">
                  <i className="fas fa-ban"></i>
                  <p>
                    {isBlocked.userView === "from"
                      ? "Has bloqueado a este usuario"
                      : "Este usuario te ha bloqueado"}
                  </p>
                </div>
              )}
              {isBlocked.blocked && isBlocked.userView === "from" && (
                <button
                  className="unlock-user"
                  onClick={async () => {
                    await removeBlock({
                      from: cookies.get("id"),
                      to: foundUserInformation._id,
                    });
                    setIsBlocked({ blocked: false, userView: null });

                    const products = await getProducts({
                      blockSearch: cookies.get("id"),
                    });
                    setProducts(products);
                    await getNotificationsInProfile();
                  }}
                >
                  <i className="fas fa-ban"></i> Desbloquear
                </button>
              )}
              {!isBlocked.blocked && (
                <div className="profile-description-control">
                  <h1 className="profile-username">
                    {defineName(foundUserInformation)}
                  </h1>
                  <p className="profile-description">
                    {foundUserInformation.description}
                  </p>
                </div>
              )}
              {!isBlocked.blocked && (
                <div>
                  <h1 className="profile-score-title">
                    Puntuacion:{" "}
                    {score.votes === 0
                      ? ""
                      : score.votes % 1 === 0
                      ? score.votes
                      : score.votes.toFixed(1)}
                  </h1>
                  <div className="profile-score">
                    <i
                      className="fas fa-star"
                      style={{
                        color: Math.round(score.votes) === 5 ? "#fbff00" : "",
                      }}
                    ></i>
                    <i
                      className="fas fa-star"
                      style={{
                        color:
                          Math.round(score.votes) === 4 ||
                          Math.round(score.votes) === 5
                            ? "#fbff00"
                            : "",
                      }}
                    ></i>
                    <i
                      className="fas fa-star"
                      style={{
                        color:
                          Math.round(score.votes) === 3 ||
                          Math.round(score.votes) === 5 ||
                          Math.round(score.votes) === 4
                            ? "#fbff00"
                            : "",
                      }}
                    ></i>
                    <i
                      className="fas fa-star"
                      style={{
                        color:
                          Math.round(score.votes) === 2 ||
                          Math.round(score.votes) === 5 ||
                          Math.round(score.votes) === 4 ||
                          Math.round(score.votes) === 3
                            ? "#fbff00"
                            : "",
                      }}
                    ></i>
                    <i
                      className="fas fa-star"
                      style={{
                        color:
                          Math.round(score.votes) === 1 ||
                          Math.round(score.votes) === 5 ||
                          Math.round(score.votes) === 4 ||
                          Math.round(score.votes) === 3 ||
                          Math.round(score.votes) === 2
                            ? "#fbff00"
                            : "",
                      }}
                    ></i>
                  </div>
                  {score.count !== 0 && (
                    <p className="total-votes">Votos totales: {score.count}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="user-information" ref={userInformationDetails}>
            <section>
              <p>Tipo de usuario: {foundUserInformation.objetive}</p>
              <p>
                Ciudad:{" "}
                {foundUserInformation.city === null ||
                foundUserInformation.city === ""
                  ? "Indefinido"
                  : foundUserInformation.city}
              </p>
              {foundUserInformation.objetive === "Profesor" && (
                <p>
                  Años de experiencia:{" "}
                  {foundUserInformation.yearsOfExperience === null ||
                  foundUserInformation.yearsOfExperience === ""
                    ? "Indefinido"
                    : foundUserInformation.yearsOfExperience}
                </p>
              )}
              <p>
                Disponibilidad de clases virtuales:{" "}
                {foundUserInformation.virtualClasses === false ? "No" : "Si"}
              </p>
              <p>
                Disponibilidad de clases presenciales:{" "}
                {foundUserInformation.faceToFaceClasses === false ? "No" : "Si"}
              </p>
              {foundUserInformation.objetive === "Profesor" && (
                <p>
                  Facultad:{" "}
                  {foundUserInformation.faculties.length === 0
                    ? "No definido"
                    : foundUserInformation.faculties[0]}
                </p>
              )}
              {foundUserInformation.objetive === "Profesor" && (
                <p>
                  Asignatura:{" "}
                  {foundUserInformation.specialty.subjects.length === 0
                    ? "No definido"
                    : foundUserInformation.specialty.subjects}
                </p>
              )}
              <p>
                Fecha de creación:{" "}
                {changeDate(foundUserInformation.creationDate, true)}
              </p>
            </section>
          </div>
          {!isBlocked.blocked && (
            <span
              className="show-more-information"
              title="Ver más información"
              onClick={() => {
                if (!informationIsActivated) {
                  userProfile.current.style.transform = "scaleY(0)";
                  userInformationDetails.current.style.transform = "scaleY(1)";
                  if (mainUsername === username)
                    changePhotoToCover.current.style.transform = "scaleY(0)";
                } else {
                  userProfile.current.style.transform = "scaleY(1)";
                  userInformationDetails.current.style.transform = "scaleY(0)";
                  if (mainUsername === username)
                    changePhotoToCover.current.style.transform = "scaleY(1)";
                }

                setInformationIsActivated(!informationIsActivated);
              }}
            >
              <i className="fa-solid fa-circle-exclamation view-user-information"></i>
              <p>Más información</p>
            </span>
          )}
          {mainUsername === username ? (
            <label
              htmlFor="change-profile-picture"
              className="edit-user-cover-photo"
              title="Edita la foto de portada"
              ref={changePhotoToCover}
              onClick={() => setPhotoType("cover")}
            >
              <i className="fa fa-pencil"></i> <p>Editar foto de portada</p>
            </label>
          ) : (
            ""
          )}
          {mainUsername === username ? (
            <input
              ref={searchPhoto}
              type="file"
              accept="image/*"
              id="change-profile-picture"
              hidden
              onChange={(e) => uploadedImage(e.target.files[0], photoType)}
            />
          ) : (
            ""
          )}
        </header>
        {isTheUserSuspended && deadline !== null && (
          <section className="userSuspendedContainer">
            <p className="suspended-title">Tiempo de suspensión</p>
            <div className="profile-date-timer">
              <div className="profile-timer-data">
                <p className="timer-data-title">Dias</p>
                <p className="profile-count-timer-data">
                  {deadline.remainDays}
                </p>
              </div>
              <div className="profile-timer-data">
                <p className="timer-data-title">Horas</p>
                <p className="profile-count-timer-data">
                  {deadline.remainHours}
                </p>
              </div>
              <div className="profile-timer-data">
                <p className="timer-data-title">Minutos</p>
                <p className="profile-count-timer-data">
                  {deadline.remainMinutes}
                </p>
              </div>
              <div className="profile-timer-data">
                <p className="timer-data-title">Segundos</p>
                <p className="profile-count-timer-data">
                  {deadline.remainSeconds}
                </p>
              </div>
            </div>
          </section>
        )}
        {auth && !isTheUserSuspended && userTransaction.transaction && (
          <div className="profile-money-container">
            {mainUsername === username && moneyHandler !== 0 && (
              <p className="profile-money-on-hold">
                Dinero en espera: <span>${thousandsSystem(moneyHandler)}</span>
              </p>
            )}
            {mainUsername === username && userTransaction.transaction && (
              <p className="profile-money-pit">
                Dinero retenido:{" "}
                <span>${thousandsSystem(userTransaction.amount)}</span>
              </p>
            )}
            {mainUsername === username &&
              userTransaction.transaction &&
              moneyHandler !== 0 && (
                <p className="profile-money-total">
                  Dinero total:{" "}
                  <span>
                    ${thousandsSystem(userTransaction.amount + moneyHandler)}
                  </span>
                </p>
              )}
          </div>
        )}
        {!verificationOfInformation(
          userInformation.objetive,
          userInformation
        ) &&
          mainUsername === username && (
            <section className="complete-information">
              <p>
                <i className="fa-solid fa-circle-exclamation"></i> Necesitas
                completar tu información como {userInformation.objetive},{" "}
                <Link to="/complete/information">Completar información</Link>
              </p>
            </section>
          )}
        {!isBlocked.blocked ? (
          <div className="profile-business-hours-for-mobile">
            <h1 className="business-hours-title">
              {foundUserInformation.objetive === "Profesor"
                ? "Horario De Atención"
                : "Días Disponible"}
            </h1>
            <div className="weeksdays-container">
              <p
                className={
                  foundUserInformation.availability.monday ? "day-active" : ""
                }
              >
                Lunes
              </p>
              <p
                className={
                  foundUserInformation.availability.tuesday ? "day-active" : ""
                }
              >
                Martes
              </p>
              <p
                className={
                  foundUserInformation.availability.wednesday
                    ? "day-active"
                    : ""
                }
              >
                Miercoles
              </p>
              <p
                className={
                  foundUserInformation.availability.thursday ? "day-active" : ""
                }
              >
                Jueves
              </p>
              <p
                className={
                  foundUserInformation.availability.friday ? "day-active" : ""
                }
              >
                Viernes
              </p>
              <p
                className={
                  foundUserInformation.availability.saturday ? "day-active" : ""
                }
              >
                Sábado
              </p>
              <p
                className={
                  foundUserInformation.availability.sunday ? "day-active" : ""
                }
              >
                Domingo
              </p>
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="profile-development-container">
          <section className="filter-container">
            {!isBlocked.blocked && (
              <div className="profile-options">
                {auth &&
                foundUserInformation.showMyNumber &&
                foundUserInformation.phoneNumber !== null ? (
                  <div id="profile-phone-number">
                    {foundUserInformation.phoneNumber}
                  </div>
                ) : (
                  ""
                )}
                {mainUsername === username &&
                  !isTheUserSuspended &&
                  userInformation.objetive !== "Profesor" && (
                    <button
                      id="create-post"
                      onClick={() => checkAuth("activity")}
                    >
                      Crear una publicación
                    </button>
                  )}
                {!isTheUserSuspended && userInformation.objetive !== "Alumno" && (
                  <button id="send-quote" onClick={() => checkAuth("quote")}>
                    Enviar actividad
                  </button>
                )}
              </div>
            )}
            {!isBlocked.blocked && (
              <div className="profile-filter">
                {/*<select id="main-category" defaultValue={filter.mainCategory} name="mainCategory" onChange={e => searchByFilter(e)}>
                                    <option value="category">CATEGORIA</option>
                                    <option value="Resolver">RESOLVER...</option>
                                    <option value="Explicar">EXPLICAR...</option>
                                    <option value="Tutoria">TUTORIA...</option>
                                    <option value="Curso">CURSO...</option>
                                    <option value="Otros">OTROS</option>
                                </select>*/}
                {/*<select id="main-subcategory" defaultValue={filter.subCategory} name="mainSubcategory" onChange={e => searchByFilter(e)}>
                                    <option value="subcategory">SUBCATEGORIA</option>
                                    <option value="Facultad ingenieria">FACULTAD INGENIERIA</option>
                                    <option value="Facultad arquitectura">FACULTAD ARQUITECTURA</option>
                                    <option value="Facultad ciencias">FACULTAD CIENCIAS</option>
                                    <option value="Facultad ciencias politicas y sociales">FACULTAD CIENCIAS POLITICAS Y SOCIALES</option>
                                    <option value="Facultad contaduria y administracion">FACULTAD CONTADURIA Y ADMINISTRACION</option>
                                    <option value="Facultad derecho">FACULTAD DERECHO</option>
                                    <option value="Facultad economia">FACULTAD ECONOMIA</option>
                                    <option value="Facultad filosofia y letras">FACULTAD FILOSOFIA Y LETRAS</option>
                                    <option value="Facultad medicina">FACULTAD MEDICINA</option>
                                    <option value="Facultad medicina veterinaria y zootecnia">FACULTAD MEDICINA VETERINARIA Y ZOOTECNIA</option>
                                    <option value="Facultad musica">FACULTAD MUSICA</option>
                                    <option value="Facultad odontologia">FACULTAD ODONTOLOGIA</option>
                                    <option value="Facultad psicologia">FACULTAD PSICOLOGIA</option>
                                    <option value="Facultad quimica">FACULTAD QUIMICA</option>
                                    <option value="Facultad turismo">FACULTAD TURISMO</option>
                                    <option value="Otros">OTRO</option>
                                </select>*/}
                {/*<input id="subcategory-secondary" placeholder="Busca por subcategorias Personalizadas" onChange={async e => {
                                    if (e.target.value === '') {
                                        const userProducts = await getProducts({ username });
                                        setUserProducts(userProducts);
                                    } else {
                                        document.getElementById('main-category').value = 'category';
                                        document.getElementById('main-subcategory').value = 'subcategory';

                                        setFilter({
                                            mainCategory: 'category',
                                            mainSubcategory: 'subcategory'
                                        });

                                        const products = await filterProducts({ idUser: foundUserInformation._id, customSearch: e.target.value });
                                        setUserProducts(products);
                                    }
                                }} />*/}
              </div>
            )}
          </section>
          <section className="profile-products-container">
            <div className="profile-business-hours">
              <h1 className="business-hours-title">
                {foundUserInformation.objetive === "Profesor"
                  ? "Horario De Atención"
                  : "Días Disponible"}
              </h1>
              {!isBlocked.blocked && (
                <div className="weeksdays-container">
                  <p
                    className={
                      foundUserInformation.availability.monday
                        ? "day-active"
                        : ""
                    }
                  >
                    Lunes
                  </p>
                  <p
                    className={
                      foundUserInformation.availability.tuesday
                        ? "day-active"
                        : ""
                    }
                  >
                    Martes
                  </p>
                  <p
                    className={
                      foundUserInformation.availability.wednesday
                        ? "day-active"
                        : ""
                    }
                  >
                    Miercoles
                  </p>
                  <p
                    className={
                      foundUserInformation.availability.thursday
                        ? "day-active"
                        : ""
                    }
                  >
                    Jueves
                  </p>
                  <p
                    className={
                      foundUserInformation.availability.friday
                        ? "day-active"
                        : ""
                    }
                  >
                    Viernes
                  </p>
                  <p
                    className={
                      foundUserInformation.availability.saturday
                        ? "day-active"
                        : ""
                    }
                  >
                    Sábado
                  </p>
                  <p
                    className={
                      foundUserInformation.availability.sunday
                        ? "day-active"
                        : ""
                    }
                  >
                    Domingo
                  </p>
                </div>
              )}
            </div>
            <hr />
            {!isBlocked.blocked && (
              <div className="product-divider-container">
                {userProducts.length === 0 && (
                  <h1 className="thereAreNoProducts-profile">
                    NO HAY PUBLICACIONES
                  </h1>
                )}
                {foundUserInformation._id === userInformation._id &&
                  userInformation.objetive === "Profesor" && (
                    <div className="product-divider">
                      {userProducts.length !== 0 && zone === "tasks" && (
                        <p
                          style={{
                            marginRight: "16px",
                            color: "#3282B8",
                            fontSize: "24px",
                            display: "inline-block",
                          }}
                        >
                          {userProducts.length}/6
                        </p>
                      )}
                      <i
                        className="fa-solid fa-list-check"
                        title="Publicaciones tomadas"
                        style={{
                          background: zone === "tasks" ? "#0f2749" : "",
                        }}
                        onClick={() => {
                          if (zone !== "tasks") setZone("tasks");
                        }}
                      ></i>
                      <i
                        className="fa-solid fa-bars-progress"
                        title="Publicaciones creadas"
                        style={{
                          background: zone === "created" ? "#0f2749" : "",
                        }}
                        onClick={() => {
                          if (zone !== "created") setZone("created");
                        }}
                      ></i>
                    </div>
                  )}
              </div>
            )}
            {isBlocked.blocked && (
              <div className="profile-blocked">
                <i className="fas fa-ban"></i>
                <p>
                  {isBlocked.userView === "from"
                    ? "Has bloqueado a este usuario"
                    : "Este usuario te ha bloqueado"}
                </p>
              </div>
            )}
            {!isBlocked.blocked && (
              <div className="product-zone">
                <h1 className="profile-filter-name">CATEGORÍA</h1>
                <div className="profile-products">
                  {userProducts.length > 0 ? (
                    userProducts.map((product) =>
                      product.stateActivated === false ? (
                        product.owner === cookies.get("id") ? (
                          <div key={product._id}>
                            <Product
                              data={{
                                uniqueId: product._id,
                                image: `url(${product.linkMiniature})`,
                                dateOfDelivery:
                                  product.dateOfDelivery === null
                                    ? "No definido"
                                    : changeDate(product.dateOfDelivery),
                                mainCategory: product.category,
                                category: product.subCategory,
                                title: product.title.slice(0, 30) + "...",
                                description:
                                  product.description.slice(0, 40) + "...",
                                price: product.valueNumber,
                                review: true,
                              }}
                            />
                          </div>
                        ) : (
                          <></>
                        )
                      ) : (
                        <div key={product._id}>
                          <Product
                            data={{
                              uniqueId: product._id,
                              image: `url(${product.linkMiniature})`,
                              dateOfDelivery:
                                product.dateOfDelivery === null
                                  ? "No definido"
                                  : changeDate(product.dateOfDelivery),
                              mainCategory: product.category,
                              category: product.subCategory,
                              title: product.title.slice(0, 30) + "...",
                              description:
                                product.description.slice(0, 40) + "...",
                              price: product.valueNumber,
                            }}
                          />
                        </div>
                      )
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            )}
          </section>
          <section className="advertising-container">
            <div className="advertising">
              <section>
                <h2>Actividad</h2>
                <p>
                  Proyectos completados:{" "}
                  <span>{foundUserInformation.completedWorks}</span>
                </p>
                {foundUserInformation.objetive === "Profesor" && (
                  <p>
                    Proyectos en curso: <span>{tasksTaken}</span>
                  </p>
                )}
                {foundUserInformation.objetive === "Alumno" && (
                  <p>
                    Publicaciones actuales:{" "}
                    <span>{thousandsSystem(userProducts.length)}</span>
                  </p>
                )}
              </section>
              <section>
                <h2>Información</h2>
                {foundUserInformation.objetive === "Profesor" && (
                  <p>
                    Cobro por hora:{" "}
                    <span>
                      {foundUserInformation.valuePerHour === null ||
                      foundUserInformation.valuePerHour === 0
                        ? "indefinido"
                        : `$${thousandsSystem(
                            foundUserInformation.valuePerHour
                          )}/Hr`}
                    </span>
                  </p>
                )}
                <p>
                  Calificaciones de{" "}
                  {foundUserInformation.objetive === "Profesor"
                    ? "Alumnos"
                    : "Profesores"}
                  : <span>{thousandsSystem(score.count)}</span>
                </p>
                <p>
                  Incumplimientos a las normas:{" "}
                  <span>{thousandsSystem(foundUserInformation.breaches)}</span>
                </p>
                {foundUserInformation.objetive === "Profesor" && (
                  <p>
                    Facultad:{" "}
                    <span>
                      {foundUserInformation.faculties.length === 0
                        ? "indefinido"
                        : foundUserInformation.faculties[0]}
                    </span>
                  </p>
                )}
              </section>
            </div>
          </section>
        </div>
        {imgSrc && (
          <div className="select-image-crop-container">
            <div className="select-image-crop">
              <h1 className="select-image-title">
                SELECCIONAR IMAGEN DE PERFIL
              </h1>
              <div>
                <div className="container-crop">
                  <Cropper
                    image={imgSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1 / 1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(
                      croppedAreaPercentage,
                      croppedAreaPixels
                    ) => {
                      setCroppedAreaPixels(croppedAreaPixels);
                    }}
                    cropSize={cropSize}
                  />
                </div>
                <input
                  type="range"
                  className="zoom-range"
                  value={zoom}
                  min="1"
                  max="3"
                  step="0.1"
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                />
              </div>
              <div className="container-crop-buttons">
                <button
                  className="save-crop-profile-image"
                  onClick={() => saveCroppedImage()}
                >
                  Guardar
                </button>
                <button
                  className="cancel-crop-profile-image"
                  onClick={() => closeCropArea()}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        <span ref={newsSpan} className="news-span">
          !Guardado con éxito!
        </span>
      </div>
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
