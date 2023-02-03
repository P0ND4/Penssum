import { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getNotifications,
  changePhoto,
  blockUser,
  socket,
  getProducts,
  removeBlock,
} from "../../../api";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../components/user/cropImage";
import swal from "sweetalert";
import { changeDate, defineName } from "../../../helpers";

// Slice redux
import {
  change as changeNotifications,
  set,
} from "../../../features/user/notificationsSlice";
import { save as saveUser } from "../../../features/user/userSlice";
import {
  changeBlocked,
  set as setProfile,
} from "../../../features/function/profileSlice";
import { save as saveProducts } from "../../../features/product/productsSlice";
import { change as changeReport } from "../../../features/user/reportSlice";

//

function Header() {
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const {
    user: foundUserInformation,
    score,
    isBlocked,
  } = useSelector((state) => state.profile);

  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 });
  const [photoType, setPhotoType] = useState("");
  const [informationIsActivated, setInformationIsActivated] = useState(false);

  const userProfile = useRef();
  const userInformationDetails = useRef();
  const changePhotoToCover = useRef();
  const searchPhoto = useRef();
  const newsSpan = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { username } = useParams();

  const getNotificationsInProfile = async () => {
    const briefNotifications = await getNotifications(user._id);

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
      formData.set("id", user._id);

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
          dispatch(saveUser({ ...user, profilePicture: result.url }));
          dispatch(setProfile({ profilePicture: result.url }));
        } else if (photoType === "cover") {
          dispatch(setProfile({ coverPhoto: result.url }));
          dispatch(saveUser({ ...user, coverPhoto: result.url }));
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
    user,
    dispatch,
    photoType,
  ]);

  const closeCropArea = () => {
    setImgSrc(null);
    searchPhoto.current.value = "";
    document.querySelector("body").style.overflow = "auto";
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
            blockSearch: user._id,
          });
          dispatch(saveProducts(products));

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

  const uploadedImage = (image, photoType) => {
    photoType === "cover"
      ? setCropSize({ width: 350, height: 100 })
      : setCropSize({ width: 200, height: 200 });
    window.scrollTo(0, 0);
    document.querySelector("body").style.overflow = "hidden";
    setImgSrc(URL.createObjectURL(image));
  };

  return (
    <>
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
              {user.username === username ? (
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
            {user.username !== username && auth && !isBlocked.blocked && (
              <div
                className="user-option-icon"
                style={{
                  justifyContent:
                    (foundUserInformation.objetive === "Alumno" &&
                      user.objetive === "Alumno") ||
                    (foundUserInformation.objetive === "Profesor" &&
                      user.objetive === "Profesor")
                      ? "center"
                      : "",
                  width:
                    (foundUserInformation.objetive === "Alumno" &&
                      user.objetive === "Alumno") ||
                    (foundUserInformation.objetive === "Profesor" &&
                      user.objetive === "Profesor")
                      ? "60px"
                      : "",
                }}
              >
                {((foundUserInformation.objetive === "Profesor" &&
                  user.objetive === "Alumno") ||
                  (foundUserInformation.objetive === "Alumno" &&
                    user.objetive === "Profesor")) && (
                  <i
                    className="fas fa-ban"
                    title="Bloquear"
                    onClick={() => block(user._id, foundUserInformation._id)}
                  ></i>
                )}
                <i
                  className="fas fa-exclamation-triangle"
                  title="Reportar usuario"
                  onClick={() => {
                    dispatch(changeReport(username));
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
                    from: user._id,
                    to: foundUserInformation._id,
                  });
                  dispatch(changeBlocked({ blocked: false, userView: null }));

                  const products = await getProducts({
                    blockSearch: user._id,
                  });
                  dispatch(saveProducts(products));
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
                      color: Math.round(score.votes) >= 4 ? "#fbff00" : "",
                    }}
                  ></i>
                  <i
                    className="fas fa-star"
                    style={{
                      color: Math.round(score.votes) >= 3 ? "#fbff00" : "",
                    }}
                  ></i>
                  <i
                    className="fas fa-star"
                    style={{
                      color: Math.round(score.votes) >= 2 ? "#fbff00" : "",
                    }}
                  ></i>
                  <i
                    className="fas fa-star"
                    style={{
                      color: Math.round(score.votes) >= 1 ? "#fbff00" : "",
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
                if (user.username === username)
                  changePhotoToCover.current.style.transform = "scaleY(0)";
              } else {
                userProfile.current.style.transform = "scaleY(1)";
                userInformationDetails.current.style.transform = "scaleY(0)";
                if (user.username === username)
                  changePhotoToCover.current.style.transform = "scaleY(1)";
              }

              setInformationIsActivated(!informationIsActivated);
            }}
          >
            <i className="fa-solid fa-circle-exclamation view-user-information"></i>
            <p>Más información</p>
          </span>
        )}
        {user.username === username ? (
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
        {user.username === username ? (
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
      </header>
      <span ref={newsSpan} className="news-span">
        !Guardado con éxito!
      </span>
    </>
  );
}

export default Header;
