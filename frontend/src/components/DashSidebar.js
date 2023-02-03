import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

function DashSidebar({ isOpen }) {
  const information = useSelector((state) => state.dashboardInformation);
  const transactions = useSelector((state) => state.transactions);

  const location = useLocation();
  const pathname = location.pathname.split("/")[2];

  const [selectedTool, setSelectedTool] = useState(false);

  let tools = useRef();

  return (
    <div
      className="dashboard-sections-container"
      style={{
        transform:
          window.innerWidth <= 600 && isOpen ? "translateX(-600px)" : "",
      }}
    >
      <h1 className="dashboard-sections-title">
        <i className="fas fa-smile-beam"></i>Admin
      </h1>
      <hr />
      <Link
        to="/dashboard/general"
        className="dashboard-sections"
        style={{ background: pathname === "general" ? "#0F4C75" : "" }}
      >
        <i className="fas fa-tachometer-alt"></i>
        <p>Dashboard</p>
      </Link>
      <hr />
      <div>
        <p className="dashboard-divider-title">CONTROL</p>
        <div>
          <Link
            to="/dashboard/products"
            className="dashboard-sections"
            style={{ background: pathname === "products" ? "#0F4C75" : "" }}
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
            to="/dashboard/users"
            className="dashboard-sections"
            style={{ background: pathname === "users" ? "#0F4C75" : "" }}
          >
            <i className="fas fa-users"></i>
            <p>Usuarios</p>
          </Link>
          <Link
            to="/dashboard/payments"
            className="dashboard-sections"
            style={{ background: pathname === "payments" ? "#0F4C75" : "" }}
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
          <div className="selectable-dashboard-container">
            <section
              className="dashboard-sections"
              style={{ background: pathname === "coupons" ? "#0F4C75" : "" }}
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
                  <Link to="/dashboard/coupons">
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
            to="/dashboard/behaviour"
            className="dashboard-sections"
            style={{ background: pathname === "behaviour" ? "#0F4C75" : "" }}
          >
            <i className="fa-solid fa-ruler" id="rules-icon-dashboard"></i>
            <p>Comportamiento</p>
          </Link>
          <Link
            to="/dashboard/settings"
            className="dashboard-sections"
            style={{ background: pathname === "settings" ? "#0F4C75" : "" }}
          >
            <i className="fas fa-cog"></i>
            <p>Configuración</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashSidebar;
