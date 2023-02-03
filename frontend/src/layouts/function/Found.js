import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { getUsers } from "../../api";
import Loading from "../../components/Loading";
import ProfileProvider from "../../components/ProfileProvider";
import { changeDate } from "../../helpers/";
import Product from "../../components/Product";

import Cookies from "universal-cookie";

const cookies = new Cookies();

function Found() {
  const products = useSelector(state => state.products);
  const user = useSelector(state => state.user);
  const auth = useSelector(state => state.auth);
  const filter = useSelector(state => state.filter);

  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [teachers, setTeachers] = useState(null);

  const { profile_provider } = useParams();

  const timer = useRef();

  useEffect(() => {
    const searchUsers = async () => {
      const users = await getUsers();
      const teachers = users.filter(
        (u) =>
          u._id !== user._id &&
          u.objetive === "Profesor" &&
          u.description.length > 5 &&
          u.typeOfUser.user !== "block" &&
          u.validated === true
      );
      setTeachers(teachers);
    };
    searchUsers();
  }, [user]);

  useEffect(() => {
    timer.current = setTimeout(() => {
      let result;
      if (profile_provider === "mod=filter") {
        if (user.objetive === "Profesor") setData(products);
        if (user.objetive === "Alumno") setData(teachers);
        return;
      }

      const changeWord = (word) => {
        if (Array.isArray(word)) word = word.toString();
        return word
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      };

      if (teachers && (user.objetive === "Alumno" || !auth)) {
        result = teachers
          .filter(
            (teacher) =>
              changeWord(teacher.firstName).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.secondName).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.lastName).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.secondSurname).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.username).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.faculties).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.specialty.subjects).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.specialty.topics).includes(
                changeWord(profile_provider)
              ) ||
              changeWord(teacher.email).includes(changeWord(profile_provider))
          )
          .sort((a, b) => a.completedWorks - b.completedWorks)
          .reverse()
          .slice(0, 50);
      }

      if (user.objetive === "Profesor") {
        result = products.filter(
          (product) =>
            changeWord(product.category).includes(
              changeWord(profile_provider)
            ) ||
            changeWord(product._id).includes(
              changeWord(profile_provider)
            ) ||
            changeWord(product.creatorUsername).includes(
              changeWord(profile_provider)
            ) ||
            changeWord(product.subCategory).includes(
              changeWord(profile_provider)
            ) ||
            changeWord(product.customCategory).includes(
              changeWord(profile_provider)
            ) ||
            changeWord(product.title).includes(
              changeWord(profile_provider)
            ) ||
            changeWord(product.description).includes(
              changeWord(profile_provider)
            )
        ).slice(0, 50);
      }

      if (result && result.length > 0) setData(result);
      else setError(true);
    }, 800);

    return () => {
      clearTimeout(timer.current);
      setTimeout(() => {
        setError(false);
        setData([]);
      }, 100);
    };
  }, [profile_provider, filter, user, auth, teachers, products]);

  const name = (firstName, lastName, username) => {
    if (firstName === "" && lastName === "") {
      return username;
    } else {
      return `${firstName} ${lastName}`;
    }
  };

  return (
    <div className="found-container">
      {(user.objetive === "Alumno" || !auth) && (
        <div className="found">
          <h1 className="main-data-title-found">
            {data.length > 0 && !error
              ? "Resultado de la búsqueda"
              : !error
              ? "Buscando..."
              : "No se ha encontrado ningún profesor"}
          </h1>
          <section className="profile_provider-found">
            {data.length > 0 && !error ? (
              data.map((user) =>
                user._id !== cookies.get("id") ? (
                  <div key={user._id} className="profile-provider-container">
                    <ProfileProvider
                      id={user._id}
                      coverImage={
                        user.coverPhoto === null
                          ? "/img/cover.jpg"
                          : user.coverPhoto
                      }
                      profileImage={
                        user.profilePicture === null
                          ? "/img/noProfilePicture.png"
                          : user.profilePicture
                      }
                      name={name(user.firstName, user.lastName, user.username)}
                      description={`${user.description.slice(0, 140)}${
                        user.description.length > 160 ? "..." : ""
                      }`}
                      valuePerHour={user.valuePerHour}
                      link={user.username}
                    />
                  </div>
                ) : (
                  <></>
                )
              )
            ) : !error ? (
              <Loading />
            ) : (
              <img
                src="/img/usersNotFound.svg"
                alt="user not found"
                className="img-data-not-found-search"
              />
            )}
          </section>
        </div>
      )}
      {user.objetive === "Profesor" && (
        <div className="found">
          <h1 className="main-data-title-found">
            {data.length > 0 && !error
              ? "Resultado de la búsqueda"
              : !error
              ? "Buscando..."
              : "No se ha encontrado ninguna publicación"}
          </h1>
          <section className="products-found-container">
            <div className="products-found">
              {data.length > 0 &&
                !error &&
                data.map((product) => (
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
                        title: product.title,
                        description: product.description.slice(0, 40) + "...",
                        price: product.value,
                      }}
                    />
                  </div>
                ))}
            </div>
            {!error && data.length === 0 ? (
              <Loading />
            ) : data.length === 0 ? (
              <img
                src="/img/usersNotFound.svg"
                alt="user not found"
                className="img-data-not-found-search"
              />
            ) : (
              <></>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Found;
