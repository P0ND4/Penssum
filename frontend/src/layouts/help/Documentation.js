import { useEffect, useState } from "react";
import { Link, Navigate, Routes, Route, useLocation } from "react-router-dom";

// Pages

import Security from "../../pages/help/Security";
import Penssum from "../../pages/help/Penssum";
import Accounts from "../../pages/help/Accounts";
import Publications from "../../pages/help/Publications";
import FrequentQuestions from "../../pages/help/FrequentQuestions";
import TermsAndConditions from "../../pages/help/TermsAndConditions";

function HelpInformation() {
  const [isOpen, setOpen] = useState(true);

  const location = useLocation();
  const pathname = location.pathname.split("/")[3];

  useEffect(() => setOpen(true),[pathname]);

  const links = [
    {
      extension: "penssum",
      icon: "fas fa-cog",
      name: "Penssum",
    },
    {
      extension: "security",
      icon: "fas fa-shield-alt",
      name: "Seguridad",
    },
    {
      extension: "accounts",
      icon: "fas fa-users",
      name: "Cuentas",
    },
    {
      extension: "products",
      icon: "fas fa-store-alt",
      name: "Servicios",
    },
    {
      extension: "frequent_questions",
      icon: "far fa-question-circle",
      name: "Preguntas frecuentes",
    },
    {
      extension: "terms_and_conditions",
      icon: "fas fa-book",
      name: "Términos y condiciones",
    },
  ];

  return (
    <div className="helpInformation-container">
      <div
        className="helpInformation-sections-container"
        style={{ transform: window.innerWidth <= 600 && isOpen ? "translateX(-600px)" : "" }}
      >
        <h1 className="helpInformation-sections-title">Informacion</h1>
        <hr />
        {links.map((link, index) => (
          <Link
            key={index}
            to={`/help/information/${link.extension}`}
            className="helpInformation-sections"
            style={{
              background: pathname === link.extension ? "#1B262C" : "",
            }}
          >
            <i className={link.icon}></i>
            <p>{link.name}</p>
          </Link>
        ))}
      </div>
      <div className="main-helpInformation-section">
        <i
          className="fas fa-chevron-left"
          id="fa-chevron-left-helpInformation"
          onClick={() => setOpen(false)}
        ></i>

        <Routes>
          <Route path="/penssum" element={<Penssum />} />
          <Route path="/security" element={<Security />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/products" element={<Publications />} />
          <Route path="/frequent_questions" element={<FrequentQuestions />} />
          <Route
            path="/terms_and_conditions"
            element={<TermsAndConditions />}
          />
          <Route
            path="*"
            element={<Navigate to="/help/information/penssum" />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default HelpInformation;