import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getDashboardInformation } from "../api";
import { changeEvent } from "../features/product/activitySlice"
import Cookies from "universal-cookie";

const cookies = new Cookies();

function LoadingZone({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const getSubjects = async () => {
      const { subjects } = await getDashboardInformation();
      dispatch(changeEvent({ subjects }));
    };
    getSubjects();
  }, [dispatch]);

  useEffect(() => {
    if (!cookies.get("pay-for-penssum"))
      dispatch(changeEvent({ payForPenssum: true }));
  }, [dispatch]);

  return <>{children}</>;
}

export default LoadingZone;
