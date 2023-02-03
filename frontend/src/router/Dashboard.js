import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Navigate, Routes, Route } from "react-router-dom";
import { getNotifications } from "../api";

// Slice redux
import {
  change as changeNotifications,
  set,
} from "../features/dashboard/notificationsSlice";

//

import Nav from "../partials/DashNav";

import General from "../pages/dashboard/General";
import Publications from "../pages/dashboard/Publications";
import Users from "../pages/dashboard/Users";
import Payments from "../pages/dashboard/Payments";
import Rules from "../pages/dashboard/Rules";
import Coupons from "../pages/dashboard/Coupons";
import Settings from "../pages/dashboard/Settings";
import Notifications from "../pages/dashboard/Notifications";
import Behaviour from "../pages/dashboard/Behaviour";
import DashSidebar from "../components/DashSidebar";

function Dashboard() {
  const validated = useSelector((state) => state.validated);

  const [isOpen, setOpen] = useState(true);

  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    const obtainCountInformation = async () => {
      const briefNotifications = await getNotifications("Admin");

      let count = 0;

      for (let i = 0; i < briefNotifications.length; i++) {
        if (!briefNotifications[i].view) count += 1;
      }

      dispatch(set(count));
      dispatch(changeNotifications(briefNotifications));
    };
    obtainCountInformation();
  }, [dispatch]);

  useEffect(() => setOpen(true), [pathname]);

  return validated ? (
    <div className="dashboard-container">
      <DashSidebar isOpen={isOpen} />
      <div className="main-dashboard-section">
        <Nav />
        <i
          className="fas fa-chevron-left"
          id="fa-chevron-left-dashboard"
          onClick={() => setOpen(false)}
        ></i>
        <Routes>
          <Route path="/general" element={<General />} />
          <Route path="/products" element={<Publications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/rules" element={<Rules />} /> {/* ACOMODAR ESTO */}
          <Route path="/coupons" element={<Coupons />} />{" "}
          {/* ACOMODAR VENTANA FLOTANTE */}
          <Route path="/behaviour" element={<Behaviour />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/dashboard/general" />} />
        </Routes>
      </div>
    </div>
  ) : (
    <Navigate to="/" />
  );
}

export default Dashboard;