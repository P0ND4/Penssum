import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { getDashboardInformation } from "../api";
import { change } from "../features/user/completeInformationSlice";

import Main from "../pages/completeInformation/Main";
import Subjects from "../pages/completeInformation/Subjects";
import Topics from "../pages/completeInformation/Topics";
import Error404 from "./Error404";

function CompleteForm() {
  const user = useSelector((state) => state.user);
  const zone = useSelector((state) => state.zone);

  const [count, setCount] = useState(1);

  const dispatch = useDispatch();

  const getSubjects = useCallback(async () => {
    const { subjects } = await getDashboardInformation();
    dispatch(change({ subjects }));
  }, [dispatch]);

  useEffect(() => {
    getSubjects();
  }, [getSubjects]);

  useEffect(() => {
    if (zone === "main") setCount(1);
    if (zone === "subjects") setCount(2);
    if (zone === "topics") setCount(3);
  }, [zone]);

  useEffect(() => {
    if (user.specialty.subjects.length > 0) {
      const subjects = user.specialty.subjects
        .split(",")
        .map((subject) => subject.trimLeft());
      dispatch(change({ selectedSubject: subjects }));
    }

    if (user.specialty.topics.length > 0) {
      const topics = user.specialty.topics
        .split(",")
        .map((topic) => topic.trimLeft());
      dispatch(change({ tags: topics }));
    }
  }, [user, dispatch]);

  useEffect(() => window.scrollTo(0, 0), [count]);

  const styleProgressCircle = (circle) => {
    return {
      border: circle <= count ? "4px solid #3282B8" : "",
      background: circle <= count ? "#3282B8" : "",
      color: circle <= count ? "#FFFFFF" : "",
    };
  };

  return (
    <div className="complete-form-container">
      {user.objetive === "Profesor" && (
        <div className="progress-bar-container">
          <div
            className="progress"
            style={{ width: `${((count - 1) / (3 - 1)) * 100}%` }}
          ></div>
          <div className="progress-circle" style={styleProgressCircle(1)}>
            1
          </div>
          <div className="progress-circle" style={styleProgressCircle(2)}>
            2
          </div>
          <div className="progress-circle" style={styleProgressCircle(3)}>
            3
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default CompleteForm;
