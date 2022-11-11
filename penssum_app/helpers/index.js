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

export const fileEvent = {
  insertFiles: async (files, editing, obtainedFiles, setObtainedFiles) => {
    const formData = new FormData();
    for (const file of files) formData.append("productFiles", file);
    const result = await fileSelection(formData);

    if (!editing) setObtainedFiles(result.successfulFiles);
    else {
      if (result.successfulFiles.length > 0) {
        const currentFiles = obtainedFiles;
        setObtainedFiles(null);
        result.successfulFiles.forEach((file, index) => {
          currentFiles.push(file);
          if (index + 1 === result.successfulFiles.length)
            setObtainedFiles(currentFiles);
        });
      }
    }

    if (result.errors.length > 0) {
      return {
        error: true,
        type: "some files were not uploaded becuase they break file rules",
      };
    }

    return result;
  },
  uploadFiles: async (files, allowedCount, obtainedFiles, setObtainedFiles) => {
    if (files.length <= allowedCount) {
      const missingAccount =
        obtainedFiles === null
          ? undefined
          : -obtainedFiles.length + allowedCount;

      if (missingAccount === undefined)
        return await fileEvent.insertFiles(
          files,
          false,
          obtainedFiles,
          setObtainedFiles
        );

      if (missingAccount > 0) {
        const newCollection = [];
        for (let i = 0; i < missingAccount; i++) {
          newCollection.push(files[i]);
        }
        return await fileEvent.insertFiles(
          newCollection,
          true,
          obtainedFiles,
          setObtainedFiles
        );
      }
    }

    return { error: true, type: "Exceeds the number of files allowed" };
  },
  remove: async (currentFile, obtainedFiles, setObtainedFiles) => {
    const currentFiles = [];

    obtainedFiles.forEach((file, index) => {
      if (file.fileName !== currentFile.fileName) currentFiles.push(file);
      if (index + 1 === obtainedFiles.length)
        return setObtainedFiles(
          currentFiles.length === 0 ? null : currentFiles
        );
    });

    await removeFiles(currentFile);
  },
};

export const thousandsSystem = num => {
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

export const defineName = (foundUserInformation, complete) => {
  if (complete) {
    if (
      foundUserInformation.firstName === "" &&
      foundUserInformation.lastName === ""
    ) {
      return foundUserInformation.username;
    } else {
      return `${foundUserInformation.firstName} ${foundUserInformation.lastName}`;
    }
  }

  if (
    foundUserInformation.firstName === "" &&
    foundUserInformation.secondName === "" &&
    foundUserInformation.lastName === "" &&
    foundUserInformation.secondSurname === ""
  ) {
    return foundUserInformation.username;
  } else {
    if (foundUserInformation.objetive === "Alumno") {
      if (foundUserInformation.firstName !== undefined)
        return `${foundUserInformation.firstName}`;
      else return `${foundUserInformation.username}`;
    } else if (
      foundUserInformation.firstName !== undefined &&
      foundUserInformation.secondName !== undefined &&
      foundUserInformation.lastName !== undefined &&
      foundUserInformation.secondSurname !== undefined
    ) {
      return `
                    ${
                      foundUserInformation.firstName !== ""
                        ? foundUserInformation.firstName
                        : ""
                    } 
                    ${
                      foundUserInformation.secondtName !== ""
                        ? foundUserInformation.secondName
                        : ""
                    }
                    ${
                      foundUserInformation.lastName !== ""
                        ? foundUserInformation.lastName
                        : ""
                    } 
                    ${
                      foundUserInformation.secondSurname !== ""
                        ? foundUserInformation.secondSurname
                        : ""
                    }  
                `;
    }
  }
};
