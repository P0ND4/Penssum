import io from "socket.io-client";
import { fileSelection, removeFiles } from "../api";

export const definePhoto = (files) => {
  const imagesAllowed = /jpg|png|jpeg|tiff|tif|psd|webp/;
  let url = "";
  for (let i = 0; i < files.length; i++) {
    if (imagesAllowed.test(files[i].extname)) {
      url = files[i].url;
      break;
    } else {
      url = "/img/document_image.svg";
    }
  }
  return url;
};

export const socketio = (API) => io(API);

export const changeDate = (date, full) => {
  const currentDate = new Date(date);
  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();

  let time = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;

  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  if (day < 10) day = `0${day}`;
  if (month < 10) month = `0${month}`;

  return `${day}-${month}-${year} ${
    full ? `${hours}:${minutes}:${seconds} ${time}` : ""
  }`;
};

export const deleteFiles = async (file, currentFiles) => {
  const totalFiles = [];

  for (let i = 0; i < currentFiles.length; i++) {
    if (currentFiles[i].fileName !== file.fileName)
      totalFiles.push(currentFiles[i]);
  }

  await removeFiles(file);
  return totalFiles;
};

export const insertFiles = async (files, editing, currentFiles) => {
  const formData = new FormData();
  for (const file of files) formData.append("productFiles", file);
  const result = await fileSelection(formData);

  const schema = {
    error: result.errors.length > 0,
    type:
      result.errors.length > 0
        ? "some files were not uploaded becuase they break file rules"
        : null,
    failedFiles: result.errors,
    success: result.successfulFiles.length > 0,
  };

  if (!editing)
    return {
      ...schema,
      successfulFiles: result.successfulFiles,
    };
  else {
    let newFiles = [];
    const resultsFile = result.successfulFiles;
    for (let i = 0; i < resultsFile.length; i++) {
      newFiles.push(resultsFile[i]);
    }
    return {
      ...schema,
      successfulFiles: currentFiles.concat(newFiles),
    };
  }
};

export const uploadFiles = async (files, allowedCount, currentFiles) => {
  if (files.length <= allowedCount) {
    const missingAccount =
      currentFiles.length === 0
        ? undefined
        : allowedCount - currentFiles.length;
    if (missingAccount === undefined)
      return await insertFiles(files, false, currentFiles);
    if (missingAccount > 0) {
      const newCollection = [];
      for (let i = 0; i < missingAccount; i++) {
        newCollection.push(files[i]);
      }
      return await insertFiles(newCollection, true, currentFiles);
    }
  }
  return { error: true, type: "Exceeds the number of files allowed" };
};

export const thousandsSystem = (num) => {
  num = num
    .toString()
    .split("")
    .reverse()
    .join("")
    .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
  num = num.split("").reverse().join("").replace(/^[.]/, "");
  return num;
};

export const getRemainTime = (deadline) => {
  const now = new Date();
  const remainTime = (new Date(deadline) - now + 1000) / 1000;
  const remainSeconds = ("0" + Math.floor(remainTime % 60)).slice(-2);
  const remainMinutes = ("0" + Math.floor((remainTime / 60) % 60)).slice(-2);
  const remainHours = ("0" + Math.floor((remainTime / 3600) % 24)).slice(-2);
  const remainDays = Math.floor(remainTime / (3600 * 24));

  return {
    remainTime,
    remainSeconds,
    remainMinutes,
    remainHours,
    remainDays,
  };
};

export const verificationOfInformation = (typeOfUser, userInformation) => {
  if (typeOfUser === "Profesor") {
    if (
      userInformation.firstName &&
      userInformation.secondName &&
      userInformation.lastName &&
      userInformation.secondSurname &&
      userInformation.description &&
      userInformation.identification &&
      userInformation.phoneNumber &&
      userInformation.valuePerHour
    )
      return true;
    else return false;
  }

  if (typeOfUser === "Alumno") {
    if (
      userInformation.firstName &&
      userInformation.lastName &&
      userInformation.phoneNumber
    )
      return true;
    else return false;
  }
  return { error: true, type: "You need a typeOfUser" };
};

export const randomName = (repeat, options) => {
  const possibleGlobal =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  if (options === undefined || Object.keys(options).length === 0) {
    let stringRandom = "";
    for (let i = 0; i < repeat; i++) {
      stringRandom += possibleGlobal.charAt(
        Math.floor(Math.random() * possibleGlobal.length)
      );
    }
    return stringRandom;
  } else {
    const { Number, String, Letters, Signs } = options;

    let possible = "";

    if (Number) possible += "1234567890";
    if (String && Letters === "both")
      possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (String && Letters === "lowercase")
      possible += "abcdefghijklmnopqrstuvwxyz";
    if (String && Letters === "uppercase")
      possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (Signs) possible += "!@#$%^&*()_+=-[]{}|/~";
    if (possible === "") possible = possibleGlobal;
    let stringRandom = "";

    for (let i = 0; i < repeat; i++) {
      stringRandom += possible.charAt(
        Math.floor(Math.random() * possible.length)
      );
    }
    return stringRandom;
  }
};

export const defineName = (foundUserInformation, complete) => {
  const u = foundUserInformation;

  if (complete) {
    if (u.firstName === "" && u.lastName === "") {
      return u.username;
    } else {
      return `${u.firstName} ${u.lastName}`;
    }
  }

  if (
    u.firstName === "" &&
    u.secondName === "" &&
    u.lastName === "" &&
    u.secondSurname === ""
  ) {
    return u.username;
  } else {
    if (u.objetive === "Alumno") {
      if (u.firstName !== undefined) return `${u.firstName}`;
      else return `${u.username}`;
    } else
      return `${u.firstName !== "" ? u.firstName : ""} 
      ${u.secondName !== "" ? u.secondName : ""}
      ${u.lastName !== "" ? u.lastName : ""} 
      ${u.secondSurname !== "" ? u.secondSurname : ""}`;
  }
};

export const getHoursAndMinutes = (message) => {
  const date = new Date(message.creationDate);

  let hours = date.getHours();

  const AMPM = hours >= 12 ? "p. m." : "a. m.";

  let minutes = ("0" + date.getMinutes()).slice(-2);

  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${AMPM}`;
};
