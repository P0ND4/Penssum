import { useState, useEffect, useRef } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  getDashboardInformation,
  getProducts,
  getUsers,
  getAllUsers,
  getTransaction,
  socket,
  markNotification,
  getNotifications,
  getCoupons,
  createCoupon,
  removeCoupon,
} from "../../../api";
import {
  WeeklyRegisteredUsers,
  UserState,
  PublishedProducts,
} from "../../parts/dashboard/Graphics";
import { changeDate, thousandsSystem } from "../../helpers/";
import swal from "sweetalert";

import StatisticsCard from "../../parts/dashboard/StatisticsCard";
import ReviewProduct from "./ReviewProduct";
import PreferenceToggle from "../../parts/user/PreferenceToggle";
import FounUser from "../../parts/dashboard/FoundUser";
import PaymentCard from "../../parts/dashboard/PaymentCard";
import DashboardPreferencePart from "../../parts/dashboard/DashboardPreferencePart";
import DashboardPasswordPart from "../../parts/dashboard/DashboardPasswordPart";
import PlainNotification from "../../parts/PlainNotification";
import NotificationSection from "../../parts/NotificationSection";
import SubjectBackground from "../../parts/SubjectBackground";

import Loading from "../../parts/Loading";

function Dashboard({ setProducts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [information, setInformation] = useState(null);
  const [productsToReview, setProductsToReview] = useState(null);
  const [users, setUsers] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [isOpenPlainNotification, setIsOpenPlainNotification] = useState(false);
  const [countInNotification, setCountInNotification] = useState(0);
  const [notifications, setNotifications] = useState(null);
  const [sendingInformation, setSendingInformation] = useState(false);
  const [selectedTool, setSelectedTool] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [coupons, setCoupons] = useState([]);
  const [activeCreateCoupon, setActiveCreateCoupon] = useState(false);
  const [IsSubjectsOpen, setSubjectsOpen] = useState(false);
  const [dataCoupons, setDataCoupons] = useState({
    name: "",
    amount: "",
    utility: "",
    time: "",
    activeUtility: false,
    activeTime: false,
  });

  const { attribute } = useParams();
  let menuDashboard = useRef();
  let tools = useRef();
  const plainNotificationBell = useRef();

  window.addEventListener("resize", () => setWidth(window.innerWidth));

  useEffect(() => {
    const menuDashboardhandler = (e) => {
      if (!menuDashboard.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", menuDashboardhandler);

    const handlerPlainNotification = (e) => {
      if (!plainNotificationBell.current.contains(e.target)) {
        setIsOpenPlainNotification(false);
      }
    };

    document.addEventListener("mousedown", handlerPlainNotification);

    return () => {
      document.removeEventListener("mousedown", menuDashboardhandler);
      document.removeEventListener("mousedown", handlerPlainNotification);
    };
  });

  useEffect(() => {
    const obtainCountInformation = async () => {
      const briefNotifications = await getNotifications("Admin");

      let count = 0;

      for (let i = 0; i < briefNotifications.length; i++) {
        if (!briefNotifications[i].view) count += 1;
      }

      setCountInNotification(count);
      setNotifications(briefNotifications);
    };
    obtainCountInformation();
  }, []);

  useEffect(() => {
    const getInformation = async () => {
      const result = await getDashboardInformation();
      setInformation(result);
      const products = await getProducts({ review: true });
      setProductsToReview(products);
      const users = await getUsers();
      setUsers(users);
      const transactions = await getTransaction();
      setTransactions(transactions);
      const coupons = await getCoupons();
      setCoupons(coupons);
    };
    getInformation();
  }, []);

  useEffect(() => {
    if (width <= 600)
      document
        .querySelector(".dashboard-sections-container")
        .classList.add("dashboard-sections-container-in-mobile");
    else
      document
        .querySelector(".dashboard-sections-container")
        .classList.remove("dashboard-sections-container-in-mobile");
  }, [width, attribute]);

  useEffect(() => {
    document
      .querySelectorAll(".dashboard-sections")
      .forEach((section) => section.classList.remove("dashboard-active"));
    if (attribute === "mod=general")
      document.querySelector(".dashboard").classList.add("dashboard-active");
    if (attribute === "mod=products")
      document
        .querySelector(".dashboard-product")
        .classList.add("dashboard-active");
    if (attribute === "mod=users")
      document
        .querySelector(".dashboard-users")
        .classList.add("dashboard-active");
    if (attribute === "mod=payments")
      document
        .querySelector(".dashboard-payments")
        .classList.add("dashboard-active");
    if (attribute === "mod=rules")
      document
        .querySelector(".dashboard-rules")
        .classList.add("dashboard-active");
    if (attribute === "mod=setting")
      document
        .querySelector(".dashboard-setting")
        .classList.add("dashboard-active");
    if (attribute === "mod=coupons")
      document
        .querySelector(".dashboard-tools")
        .classList.add("dashboard-active");
    if (attribute === "mod=behaviour")
      document
        .querySelector(".dashboard-behaviour")
        .classList.add("dashboard-active");
  }, [attribute]);

  const searchAllUsers = async () => {
    const value = document.getElementById("search-user-dashboard").value;

    if (value !== "") {
      setSendingInformation(true);
      const result = await getAllUsers(value);

      if (result.error) setUsers(null);
      else setUsers(result);

      setTimeout(() => setSendingInformation(false), 800);
    }
  };

  const sendMessageToEachUser = () => {
    swal({
      title: "ESCRIBE EL MENSAJE",
      content: {
        element: "input",
        attributes: {
          placeholder: "Mensaje para todos los usuarios",
          type: "text",
        },
      },
      button: "Enviar",
    }).then((value) => {
      if (value === null) return;

      if (value) {
        socket.emit("send_message_to_each_user", value);
        socket.emit("received event");

        swal({
          title: "Enviado",
          text: "Mensaje enviado con exito.",
          icon: "success",
          timer: "2000",
          button: false,
        });
      }
    });
  };

  const makeCoupon = async () => {
    setSendingInformation(true);

    const data = {
      name: dataCoupons.name,
      amount: parseInt(dataCoupons.amount.replace(/\./g, "")),
      utility: parseInt(dataCoupons.utility.replace(/\./g, "")),
      time: dataCoupons.time,
    };

    const result = await createCoupon(data);

    if (!result.error) {
      const coupons = await getCoupons();
      setCoupons(coupons);
      setActiveCreateCoupon(false);

      setDataCoupons({
        name: "",
        amount: "",
        utility: "",
        time: "",
        activeUtility: false,
        activeTime: false,
      });

      swal({
        title: "Creado",
        text: "Cupón creado correctamente.",
        icon: "success",
        timer: "2000",
        button: false,
      });
    } else {
      swal({
        title: "!OOPS!",
        text: "El cupón ya existe.",
        icon: "error",
        timer: "2000",
        button: false,
      });
    }

    setSendingInformation(false);
  };

  const deleteCoupon = (id) => {
    swal({
      title: "¿Estás seguro?",
      text: "¿Quieres eliminar el cupón?",
      icon: "warning",
      buttons: ["No", "Si"],
    }).then(async (res) => {
      if (res) {
        await removeCoupon({ id_coupon: id });
        const coupons = await getCoupons();
        setCoupons(coupons);
      }
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sections-container">
        <h1 className="dashboard-sections-title">
          <i className="fas fa-smile-beam"></i>Admin
        </h1>
        <hr />
        <Link
          to="/dashboard/mod=general"
          className="dashboard-sections dashboard"
        >
          <i className="fas fa-tachometer-alt"></i>
          <p>Dashboard</p>
        </Link>
        <hr />
        <div>
          <p className="dashboard-divider-title">CONTROL</p>
          <div>
            <Link
              to="/dashboard/mod=products"
              className="dashboard-sections dashboard-product"
            >
              <i className="fas fa-boxes"></i>
              <p>
                Publicaciones{" "}
                {information === null ? (
                  ""
                ) : information.productsToReview === 0 ? (
                  ""
                ) : (
                  <span id="dashboard-product-account">
                    {information.productsToReview}
                  </span>
                )}
              </p>
            </Link>
            <Link
              to="/dashboard/mod=users"
              className="dashboard-sections dashboard-users"
            >
              <i className="fas fa-users"></i>
              <p>Usuarios</p>
            </Link>
            <Link
              to="/dashboard/mod=payments"
              className="dashboard-sections dashboard-payments"
            >
              <i className="fas fa-file-invoice-dollar"></i>
              <p>
                Pagos{" "}
                {transactions === null ? (
                  ""
                ) : transactions.length === 0 ? (
                  ""
                ) : (
                  <span id="dashboard-payments-account">
                    {transactions.length}
                  </span>
                )}
              </p>
            </Link>
          </div>
        </div>
        <hr />
        <div>
          <h4 className="dashboard-divider-title">AVANZADO</h4>
          <div>
            {/*<Link to="/dashboard/mod=rules" className="dashboard-sections dashboard-rules">
                            <i className="fas fa-ruler-combined"></i>
                            <p>Reglas</p>
                        </Link>*/}
            <div className="selectable-dashboard-container">
              <section
                className="dashboard-sections dashboard-tools"
                onClick={() => {
                  if (!selectedTool)
                    tools.current.style.height = `${tools.current.scrollHeight}px`;
                  else tools.current.style.height = "";
                  setSelectedTool(!selectedTool);
                }}
              >
                <i className="fas fa-tools"></i>
                <p>Herramientas</p>
                <i
                  className="fa-solid fa-angle-right"
                  id="arror-right-dashboard"
                  style={{ transform: selectedTool ? "rotate(90deg)" : "" }}
                ></i>
              </section>

              <section className="selectable-dashboard" ref={tools}>
                <ul>
                  <li>
                    <Link to="/dashboard/mod=coupons">
                      Cupones{" "}
                      <i
                        className="fa-solid fa-ticket"
                        id="icon-ticket-dashboard"
                      ></i>
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
            <Link
              to="/dashboard/mod=behaviour"
              className="dashboard-sections dashboard-behaviour"
            >
              <i className="fa-solid fa-ruler" id="rules-icon-dashboard"></i>
              <p>Comportamiento</p>
            </Link>
            <Link
              to="/dashboard/mod=setting"
              className="dashboard-sections dashboard-setting"
            >
              <i className="fas fa-cog"></i>
              <p>Configuración</p>
            </Link>
          </div>
        </div>
      </div>
      {productsToReview !== null &&
      information !== null &&
      transactions !== null ? (
        <div className="main-dashboard-section">
          <nav className="dashboard-nav">
            <div ref={menuDashboard}>
              <div className="main-dashboard-icon">
                <div ref={plainNotificationBell}>
                  <div
                    className="user-span-container"
                    onClick={() => {
                      if (countInNotification > 0) markNotification("Admin");
                      setCountInNotification(0);
                      setIsOpenPlainNotification(!isOpenPlainNotification);
                    }}
                  >
                    <i className="fas fa-bell" id="bell-dashboard"></i>
                    {countInNotification > 0 ? (
                      <span className="user-count">
                        {countInNotification > 3 ? "+3" : countInNotification}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                  <div
                    className="plain-notification-dashboard-container"
                    style={{
                      display: isOpenPlainNotification ? "block" : "none",
                    }}
                  >
                    {notifications !== null && notifications.length > 0 ? (
                      notifications.map(
                        (notification, index) =>
                          index < 3 && (
                            <div key={notification._id}>
                              <Link
                                to="/dashboard/mod=notifications"
                                style={{ textDecoration: "none" }}
                                onClick={() =>
                                  setIsOpenPlainNotification(false)
                                }
                              >
                                <PlainNotification
                                  title={notification.title}
                                  description={notification.description}
                                  color={notification.color}
                                  image={notification.image}
                                />
                              </Link>
                            </div>
                          )
                      )
                    ) : (
                      <p className="thereAreNoPlainNotification">
                        No hay notificaciones
                      </p>
                    )}
                    {notifications !== null && notifications.length > 0 ? (
                      <Link
                        to="/dashboard/mod=notifications"
                        className="notification-view"
                        onClick={() => setIsOpenPlainNotification(false)}
                      >
                        Ver todas las notificaciones
                      </Link>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {/*<div>
                                    <i className="fas fa-envelope"></i>
                                    <span id="message-active-dashboard"></span>
                                </div>*/}
                <i
                  className="fas fa-user-circle"
                  onClick={() => setIsOpen(!isOpen)}
                ></i>
              </div>
              <div
                className="options-dashboard"
                style={{ display: isOpen ? "flex" : "none" }}
              >
                <div className="options-divider-dashboard">
                  <Link
                    to="/dashboard/mod=general"
                    className="option-link-dashboard"
                  >
                    <i className="fas fa-user-alt"></i> Perfil
                  </Link>
                </div>
                <div className="options-divider-dashboard">
                  <Link
                    to="/dashboard/mod=setting"
                    className="option-link-dashboard"
                  >
                    <i className="fas fa-cog"></i> Configuraciones
                  </Link>
                </div>
                {/*<div className="options-divider-dashboard">
                                    <Link to="/" className="option-link-dashboard"><i className="fa-solid fa-chart-line"></i> Actividad</Link>
                                </div>*/}
                <hr />
                <div className="options-divider-dashboard">
                  <Link to="/" className="option-link-dashboard">
                    <i className="fas fa-sign-out-alt"></i> Salir
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <i
            className="fas fa-chevron-left"
            id="fa-chevron-left-dashboard"
            onClick={() =>
              document
                .querySelector(".dashboard-sections-container")
                .classList.remove("dashboard-sections-container-in-mobile")
            }
          ></i>
          {attribute === "mod=general" ? (
            <div className="commomStylePadding dashboard-general">
              <div className="main-header-dashboard">
                <h1>
                  Bienvenido {information !== null ? information.name : ""}
                </h1>
                {/*<button><i className="fas fa-download"></i>Generar Reporte</button>*/}
              </div>
              <div className="statistics-card-container">
                <StatisticsCard
                  color="#2c373d"
                  name="Usuarios"
                  information={
                    information === null ? "..." : information.totalUsers
                  }
                  icono="fas fa-users"
                />
                <StatisticsCard
                  color="#0F4C75"
                  name="Publicaciones"
                  information={
                    information === null ? "..." : information.totalProducts
                  }
                  icono="fas fa-boxes"
                />
                <StatisticsCard
                  color="#06a1c4"
                  name="Ofertas concretadas"
                  information={
                    information === null ? "..." : information.concreteOffers
                  }
                  icono="far fa-handshake"
                />
                <StatisticsCard
                  color="#ffa600"
                  name="Productos a revisar"
                  information={
                    information === null ? "..." : information.productsToReview
                  }
                  icono="fas fa-history"
                />

                <StatisticsCard
                  color="#009e00"
                  name="Videollamadas concretadas"
                  information={
                    information === null ? "..." : information.videoCallsMade
                  }
                  icono="fas fa-video"
                />
                <StatisticsCard
                  color="#830163"
                  name="Violaciones de normas"
                  information={
                    information === null ? "..." : information.violationsTotal
                  }
                  icono="fas fa-exclamation-triangle"
                />
                <StatisticsCard
                  color="#970000"
                  name="Visitas a Penssum"
                  information={
                    information === null
                      ? "..."
                      : information.totalViews >= 1000 &&
                        information.totalViews <= 1000000
                      ? `${(information.totalViews * 0.001).toFixed(1)}K`
                      : information.totalViews
                  }
                  icono="fas fa-eye"
                />
                <StatisticsCard
                  color="#3282B8"
                  name="Reportes"
                  information={
                    information === null ? "..." : information.reports
                  }
                  icono="fas fa-sticky-note"
                />
              </div>
              <div>
                <div className="graphics-container">
                  <div className="WeeklyRegisteredUsers">
                    <WeeklyRegisteredUsers
                      registeredUsers={
                        information === null
                          ? [0, 0, 0, 0, 0, 0, 0]
                          : information.registeredUsers
                      }
                    />
                  </div>
                  <div className="UserState">
                    <UserState
                      state={
                        information === null
                          ? [0, 0, 0]
                          : information.usersStatus
                      }
                    />
                  </div>
                </div>
                <div className="graphics">
                  <PublishedProducts
                    currentProducts={
                      information === null
                        ? [0, 0, 0, 0, 0, 0, 0]
                        : information.currentProducts
                    }
                    lastProducts={
                      information === null
                        ? [0, 0, 0, 0, 0, 0, 0]
                        : information.lastProducts
                    }
                  />
                </div>
              </div>
            </div>
          ) : attribute === "mod=products" ? (
            <div>
              <div className="commomStylePadding dashboard-products">
                {productsToReview !== null && productsToReview.length > 0 ? (
                  productsToReview.map((product) => {
                    return (
                      <div key={product._id + product.title.length * 5}>
                        <ReviewProduct
                          data={{
                            id: product._id,
                            onwer: product.owner,
                            product,
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
                            setProductsToReview,
                            information,
                            setInformation,
                            setProducts,
                          }}
                        />
                      </div>
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
              {productsToReview === null || productsToReview.length === 0 ? (
                <h1 className="thereAreNoProductsInDashboard">
                  NO HAY PUBLICACIONES A REVISAR
                </h1>
              ) : (
                <></>
              )}
            </div>
          ) : attribute === "mod=users" ? (
            <div className="commomStylePadding dashboard-users">
              <div className="header-users-dashboard">
                <div className="search-user-dashboard-container">
                  <input
                    type="text"
                    id="search-user-dashboard"
                    placeholder="Buscar usuarios"
                    onChange={async (e) => {
                      if (e.target.value === "") {
                        const users = await getUsers();
                        setUsers(users);
                      }
                    }}
                  />
                  <i
                    className="fas fa-search"
                    id="dashboard-user-search"
                    style={{
                      background: sendingInformation ? "#3282B8" : "",
                      opacity: sendingInformation ? ".4" : "",
                      cursor: sendingInformation ? "not-allowed" : "",
                    }}
                    onClick={() => {
                      if (!sendingInformation) searchAllUsers();
                    }}
                  ></i>
                </div>
                <div className="dashboard-user-section-option">
                  <i
                    className="fas fa-envelope-open-text"
                    title="Enviar mensajes a todos los usuarios"
                    onClick={() => sendMessageToEachUser()}
                  ></i>
                </div>
              </div>
              <div className="found-users-container">
                {users !== null && users.length > 0 ? (
                  users.map((user) => {
                    return (
                      <div
                        key={
                          user._id +
                          user.username +
                          changeDate(user.creationDate)
                        }
                      >
                        <FounUser
                          id={user._id}
                          username={user.username}
                          date={changeDate(user.creationDate)}
                          setUsers={setUsers}
                          userInformation={user}
                          data={{
                            property: `${user._id}-information-dashboard`,
                            registered: user.registered,
                            objetive: user.objetive,
                            email: user.email,
                            firstName: user.firstName,
                            secondName: user.secondName,
                            lastName: user.lastName,
                            secondSurname: user.secondSurname,
                            description: user.description,
                            profilePicture: user.profilePicture,
                            coverPhoto: user.coverPhoto,
                            identification: user.identification,
                            yearsOfExperience: user.yearsOfExperience,
                            phoneNumber: user.phoneNumber,
                            availability: user.availability,
                            virtualClasses: user.virtualClasses,
                            faceToFaceClasses: user.faceToFaceClasses,
                            subjects: user.specialty.subjects,
                            topics: user.specialty.topics,
                            showMyNumber: user.showMyNumber,
                            typeOfUser: user.typeOfUser,
                            validated: user.validated,
                          }}
                          setProducts={setProducts}
                        />
                      </div>
                    );
                  })
                ) : (
                  <h1 className="thereAreNoUsersInDashboard">
                    NO HAY USUARIOS EN LA APLICACIÓN
                  </h1>
                )}
              </div>
            </div>
          ) : attribute === "mod=payments" ? (
            <div className="commomStylePadding dashboard-payments">
              <h2 className="dashboard-payments-title">PAGOS PENDIENTES</h2>
              <div className="dashboard-payments-card-container">
                <div className="payment-card-dashboard-container">
                  {transactions !== null && transactions.length > 0 ? (
                    transactions.map((transaction) => {
                      return (
                        <div key={transaction._id}>
                          <PaymentCard
                            id={transaction._id}
                            productTitle={transaction.productTitle}
                            username={transaction.username}
                            method={transaction.method}
                            advance={transaction.advance}
                            amount={transaction.amount}
                            bank={transaction.bank}
                            accountNumber={transaction.accountNumber}
                            accountType={transaction.accountType}
                            userId={transaction.userId}
                            ownerId={transaction.ownerId}
                            productId={transaction.productId}
                            orderId={transaction.orderId}
                            transactionId={transaction.transactionId}
                            operationDate={transaction.operationDate}
                            paymentType={transaction.paymentType}
                            paymentNetwork={transaction.paymentNetwork}
                            setTransaction={setTransactions}
                            transactions={transactions}
                            verification={transaction.verification}
                            files={transaction.files}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <h2 className="thereAreNoPayments">
                      NO HAY PAGOS PENDIENTES
                    </h2>
                  )}
                </div>
              </div>
            </div>
          ) : attribute === "mod=rules" ? (
            <div className="commomStylePadding dashboard-rules">
              <PreferenceToggle
                h4="Permitir revicion de productos"
                p="Permite la revicion de productos, si esta desactivado los productos se publicaran sin necesidad de revicion"
                idContainer="allowProductReview"
                idButton="buttonAllowProductReview"
              />
              <PreferenceToggle
                h4="Permitir videollamadas"
                p="Bloquea las reuniones por videollamadas en la plataforma"
                idContainer="allowVideoCall"
                idButton="buttonAllowVideoCall"
              />
            </div>
          ) : attribute === "mod=coupons" ? (
            <div className="commomStylePadding dashboard-coupons">
              <div className="coupon-title-container">
                <h2 className="coupon-title">
                  CUPONES <i className="fa-solid fa-ticket"></i>
                </h2>
                <h1 className="coupon-subtitle">AYUDA A TUS USUARIOS</h1>
              </div>
              <div className="coupons-container">
                <div className="nav-coupons">
                  <h2>
                    {coupons.length === 0
                      ? "NO HAY CUPONES"
                      : "CUPONES ACTUALES"}
                  </h2>
                  <button onClick={() => setActiveCreateCoupon(true)}>
                    Crear
                  </button>
                </div>
                {coupons.map((coupon) => (
                  <div className="coupons" key={coupon.name}>
                    <div className="cuopon">
                      <p>
                        Código: <span>{coupon.name}</span>
                      </p>
                      <p>
                        Monto:{" "}
                        <span>
                          $
                          {coupon.amount >= 1000
                            ? thousandsSystem(coupon.amount)
                            : coupon.amount}
                        </span>
                      </p>
                      <p>
                        Uso restante:{" "}
                        <span>
                          {coupon.utility >= 1000
                            ? thousandsSystem(coupon.utility)
                            : coupon.utility
                            ? coupon.utility
                            : "Ilimitado"}
                        </span>
                      </p>
                      <p>
                        Expira:{" "}
                        <span>
                          {coupon.time ? changeDate(coupon.time) : "No Expira"}
                        </span>
                      </p>
                      <button
                        title="Eliminar"
                        onClick={() => deleteCoupon(coupon._id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {activeCreateCoupon && (
                <div
                  className="create-coupon-container"
                  onClick={(e) =>
                    e.target.className === "create-coupon-container" &&
                    setActiveCreateCoupon(false)
                  }
                >
                  <div className="create-coupon">
                    <h1>CREA UN CUPON</h1>
                    <div className="create-coupon-body">
                      <input
                        className="create-coupon-name"
                        type="text"
                        placeholder="Nombre del cupon a utilizar"
                        value={dataCoupons.name}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) {
                            setDataCoupons({
                              ...dataCoupons,
                              name: e.target.value.trim(),
                            });
                          }
                        }}
                      />
                      <input
                        className="create-coupon-amount"
                        type="text"
                        placeholder="Dinero a abonar"
                        value={dataCoupons.amount}
                        onChange={(e) => {
                          if (
                            e.target.value.length < 14 &&
                            /^[0-9.]{0,20}$/.test(e.target.value)
                          ) {
                            var num = e.target.value.replace(/\./g, "");
                            if (!isNaN(num)) {
                              num = num
                                .toString()
                                .split("")
                                .reverse()
                                .join("")
                                .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                              num = num
                                .split("")
                                .reverse()
                                .join("")
                                .replace(/^[.]/, "");
                              setDataCoupons({ ...dataCoupons, amount: num });
                            } else
                              setDataCoupons({ ...dataCoupons, amount: num });
                          }
                        }}
                      />
                      <div className="divider-create-coupon">
                        <div className="divider-create">
                          <p>¿Quieres agregar un límite de uso?</p>
                          <button
                            className="dashboard-selection-button"
                            onClick={() => {
                              setDataCoupons({
                                ...dataCoupons,
                                activeUtility: !dataCoupons.activeUtility,
                                utility: "",
                              });
                            }}
                          >
                            <div
                              style={{
                                transform: !dataCoupons.activeUtility
                                  ? "translateX(0)"
                                  : "translateX(33px)",
                                background: !dataCoupons.activeUtility
                                  ? "#283841"
                                  : "#3282B8",
                              }}
                            >
                              {!dataCoupons.activeUtility ? "No" : "Si"}
                            </div>
                          </button>
                        </div>
                        <input
                          disabled={!dataCoupons.activeUtility ? true : false}
                          type="text"
                          placeholder="Cuantas veces se va a utilizar el cupon"
                          value={dataCoupons.utility}
                          onChange={(e) => {
                            if (
                              e.target.value.length < 10 &&
                              /^[0-9.]{0,20}$/.test(e.target.value)
                            ) {
                              var num = e.target.value.replace(/\./g, "");
                              if (!isNaN(num)) {
                                num = num
                                  .toString()
                                  .split("")
                                  .reverse()
                                  .join("")
                                  .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
                                num = num
                                  .split("")
                                  .reverse()
                                  .join("")
                                  .replace(/^[.]/, "");
                                setDataCoupons({
                                  ...dataCoupons,
                                  utility: num,
                                });
                              } else
                                setDataCoupons({
                                  ...dataCoupons,
                                  utility: num,
                                });
                            }
                          }}
                          style={{
                            cursor: !dataCoupons.activeUtility
                              ? "not-allowed"
                              : "",
                            background: !dataCoupons.activeUtility
                              ? "#CCCCCC"
                              : "",
                          }}
                        />
                      </div>
                      <div className="divider-create-coupon">
                        <div className="divider-create">
                          <p>¿Quieres agregar una fecha de expedición?</p>
                          <button
                            className="dashboard-selection-button"
                            onClick={() =>
                              setDataCoupons({
                                ...dataCoupons,
                                activeTime: !dataCoupons.activeTime,
                                time: "",
                              })
                            }
                          >
                            <div
                              style={{
                                transform: !dataCoupons.activeTime
                                  ? "translateX(0)"
                                  : "translateX(33px)",
                                background: !dataCoupons.activeTime
                                  ? "#283841"
                                  : "#3282B8",
                              }}
                            >
                              {!dataCoupons.activeTime ? "No" : "Si"}
                            </div>
                          </button>
                        </div>
                        <input
                          onChange={(e) => {
                            setDataCoupons({
                              ...dataCoupons,
                              time: e.target.value,
                            });
                          }}
                          value={dataCoupons.time}
                          disabled={!dataCoupons.activeTime ? true : false}
                          type="date"
                          style={{
                            cursor: !dataCoupons.activeTime
                              ? "not-allowed"
                              : "",
                            background: !dataCoupons.activeTime
                              ? "#CCCCCC"
                              : "",
                          }}
                        />
                      </div>
                      <div className="divider-create-coupon button-container-coupon">
                        <button
                          style={{
                            background: sendingInformation ? "#3282B8" : "",
                            opacity: sendingInformation ? ".4" : "",
                            cursor: sendingInformation ? "not-allowed" : "",
                          }}
                          onClick={() => {
                            if (!sendingInformation) {
                              setActiveCreateCoupon(false);
                              setDataCoupons({
                                name: "",
                                amount: "",
                                utility: "",
                                time: "",
                                activeUtility: false,
                                activeTime: false,
                              });
                            }
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() =>
                            dataCoupons.name &&
                            parseInt(dataCoupons.amount.replace(/\./g, "")) >
                              0 &&
                            dataCoupons.amount !== "" &&
                            !sendingInformation &&
                            makeCoupon()
                          }
                          style={{
                            background:
                              !dataCoupons.name ||
                              parseInt(
                                dataCoupons.amount.replace(/\./g, "")
                              ) === 0 ||
                              dataCoupons.amount === "" ||
                              sendingInformation
                                ? "#3282B8"
                                : "",
                            opacity:
                              !dataCoupons.name ||
                              parseInt(
                                dataCoupons.amount.replace(/\./g, "")
                              ) === 0 ||
                              dataCoupons.amount === "" ||
                              sendingInformation
                                ? ".4"
                                : "",
                            cursor:
                              !dataCoupons.name ||
                              parseInt(
                                dataCoupons.amount.replace(/\./g, "")
                              ) === 0 ||
                              dataCoupons.amount === "" ||
                              sendingInformation
                                ? "not-allowed"
                                : "",
                          }}
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : attribute === "mod=setting" ? (
            <div className="commomStylePadding dashboard-setting">
              <DashboardPreferencePart
                name="name"
                property="Nombre"
                value={information !== null ? information.name : ""}
                id="name"
                idInput="name-dashboard-preference"
                inputType="text"
                placeholder="¿Cómo quiere que lo llamemos?"
                information={information}
                setInformation={setInformation}
              />
              <DashboardPreferencePart
                name="firstEmail"
                property="Primer correo"
                value={information !== null ? information.firstEmail : ""}
                id="firstEmail"
                idInput="firstEmail-dashboard-preference"
                inputType="email"
                placeholder="Escriba el nuevo correo principal"
                information={information}
                setInformation={setInformation}
              />
              <DashboardPasswordPart
                property="Cambiar contraseña principal"
                i="fab fa-keycdn"
                description="Elige una contraseña principal segura para que puedas entrar desde el login."
                id="edit-password"
                typePassword={1}
              />
              <DashboardPreferencePart
                name="secondEmail"
                property="Segundo correo"
                value={information !== null ? information.secondEmail : ""}
                id="secondEmail"
                idInput="secondEmail-dashboard-preference"
                inputType="email"
                placeholder="Escriba el nuevo correo segundario"
                information={information}
                setInformation={setInformation}
              />
              <DashboardPasswordPart
                property="Cambiar contraseña segundaria"
                i="fab fa-keycdn"
                description="Elige una contraseña segundaria segura para que puedas entrar en la segunda capa de seguridad."
                id="edit-password"
                typePassword={2}
              />
              <DashboardPreferencePart
                name="keyword"
                property="Palabra clave"
                value={information !== null ? information.keyword : ""}
                id="keyword"
                idInput="keyword-dashboard-preference"
                inputType="text"
                placeholder="Escriba la nueva palabra clave"
                information={information}
                setInformation={setInformation}
              />
            </div>
          ) : attribute === "mod=notifications" ? (
            <div className="commomStylePadding">
              <div className="notifications-dashboard-container">
                <h1>NOTIFICACIONES</h1>
                <div className="notifications-dashboard-section">
                  {notifications !== null ? (
                    notifications.length > 0 ? (
                      notifications.map((notification) => {
                        return (
                          <div key={notification._id}>
                            <NotificationSection
                              productId={notification.productId}
                              username={notification.username}
                              title={notification.title}
                              creationDate={notification.creationDate}
                              description={notification.description}
                              files={notification.files}
                              admin={true}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <h1 className="thereAreNoNotifications">
                        NO HAY NOTIFICACIONES
                      </h1>
                    )
                  ) : (
                    <Loading margin="auto" />
                  )}
                </div>
              </div>
            </div>
          ) : attribute === "mod=behaviour" ? (
            <div className="commomStylePadding">
              <div className="behaviuor-dashboard-container">
                <button
                  className="behaviuor-dashboard-subjects-container"
                  onClick={() => setSubjectsOpen(true)}
                >
                  <section className="behaviuor-dashboard-subjects">
                    <h1>Materias</h1>
                    <p>
                      Esto ayudará a la selección de materias dentro de penssum
                    </p>
                    <span>
                      Materias totales ({information.subjects.length})
                    </span>
                  </section>
                </button>
              </div>
              {IsSubjectsOpen && (
                <SubjectBackground
                  title="Materias"
                  description="Configura las materias que podrán ver los profesores y alumnos."
                  edit={true}
                  subjects={information.subjects}
                  setOpen={setSubjectsOpen}
                  information={information}
                  setInformation={setInformation}
                />
              )}
            </div>
          ) : (
            <Navigate to="/dashboard/mod=general" />
          )}
        </div>
      ) : (
        <Loading
          center={true}
          background={true}
          optionText={{
            text: "...Cargando Informacion...",
            colorText: "#FFFFFF",
            fontSize: "26px",
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;
