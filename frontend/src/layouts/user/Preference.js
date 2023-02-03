import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, Routes, Route, useLocation } from "react-router-dom";

import General from "../../pages/user/preference/General";
import Security from "../../pages/user/preference/Security";
import ProfileInformation from "../../pages/user/preference/ProfileInformation";
import Privacy from "../../pages/user/preference/Privacy";
import Payment from "../../pages/user/preference/Payment";
import PaymentPayu from "../../pages/user/preference/PaymentPayu";

function Preference() {
  const [isOpen, setOpen] = useState(true);
  const [links, setLinks] = useState([
    {
      extension: "general",
      icon: "fas fa-cog",
      name: "General",
    },
    {
      extension: "security",
      icon: "fas fa-shield-alt",
      name: "Seguridad",
    },
    {
      extension: "profile_information",
      icon: "fas fa-th",
      name: "Información de perfil",
    },
    {
      extension: "payment",
      icon: "fa-solid fa-money-bills",
      name: "Pago",
    },
    {
      extension: "privacy",
      icon: "fas fa-user-lock",
      name: "Privacidad",
    },
  ]);
  const [informationLoaded,setInformationLoaded] = useState(false);

  const user = useSelector((state) => state.user);

  const location = useLocation();
  const pathname = location.pathname.split("/")[2];

  useEffect(() => setOpen(true), [pathname]);

  useEffect(() => {
    if (user.objetive === "Alumno" && !informationLoaded) {
      setLinks(links.filter((link) => link.extension !== "payment"));
      setInformationLoaded(true);
    }
  }, [user.objetive, links, informationLoaded]);

  return (
    <div className="preference-container">
      <div className="preference">
        <div
          className="preference-sections-container"
          style={{
            transform:
              window.innerWidth <= 600 && isOpen ? "translateX(-600px)" : "",
          }}
        >
          <h1 className="preference-sections-title">Configuración</h1>
          <hr />
          {links.map((link, index) => (
            <Link
              key={index}
              to={`/preference/${link.extension}`}
              className="preference-sections"
              style={{
                background: link.extension === pathname ? "#1B262C" : "",
              }}
            >
              <i className={link.icon}></i>
              <p>{link.name}</p>
            </Link>
          ))}
        </div>
        <div className="main-preference-section">
          <i
            className="fas fa-chevron-left"
            id="fa-chevron-left-preference"
            onClick={() => setOpen(false)}
          ></i>
          <Routes>
            <Route path="/general" element={<General />} />
            <Route path="/security" element={<Security />} />
            <Route
              path="/profile_information"
              element={<ProfileInformation />}
            />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment_payu" element={<PaymentPayu />} />
            <Route path="*" element={<Navigate to="/preference/general" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Preference;