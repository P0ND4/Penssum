import { useState, useEffect } from "react";
import { SafeAreaView, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons"; // iconos
import theme from "../../theme"; // Colores y temas de la aplicacion
import Progress from "../../components/Progress"; // Barra superior de progreso

// Screen

import Basic from "./partials/email/Basic"; // Informacion basica
import Information from "./partials/email/Information"; // Si es profesor o alumno
import SelectionOfSubjects from "./partials/email/SelectionOfSubjects"; // La seleccion de materias por profesor
import TeacherInformation from "./partials/email/TeacherInformation"; // Tomar informacion del profesor
import SelectionOfTopics from "./partials/email/SelectionOfTopics"; // Seleccion de temas por profesor
import StudentInformation from "./partials/email/StudentInformation"; // Tomar informacion del estudiante
import ConfirmEmail from "./partials/email/ConfirmEmail"; // Confirmacion del correo electronico
import CustomNotification from "../../components/CustomNotification";

import { getDashboardInformation } from "../../api";

const SignUpEmail = ({ navigation }) => {
  const [exit, setExit] = useState(false); // Controlar la salida
  const [progress, setProgress] = useState(1); // Nivel de progreso del registro
  const [tags, setTags] = useState([]);
  const [subjects, setSubjetcs] = useState([]);
  const [notificationOptions, setNotificationOptions] = useState({
    type: "",
    title: "",
    componentRight: null,
  });
  const [notificationActive, setNotificationActive] = useState(false);

  const [subjectsSelected, setSubjectsSelected] = useState([]);

  const [progressSetting, setProgressSetting] = useState({
    // Configuracion de la barra de progreso
    width: 200,
    height: 10,
    steps: [1, 2, 3, 4],
  });

  const [data, setData] = useState({
    email: "",
    password: "",
    objetive: "",
    firstName: "",
    secondName: "",
    lastName: "",
    secondSurname: "",
    phoneNumber: "",
    description: "",
    identification: "",
    valuePerHour: "",
  });

  const getSubjects = async () => {
    const result = await getDashboardInformation();
    setSubjetcs(result.subjects);
  };

  useEffect(() => {
    getSubjects();
  }, []);

  return (
    <SafeAreaView style={theme.styles.container}>
      <View style={{ alignItems: "center" }}>
        <Progress
          width={progressSetting.width}
          height={progressSetting.height}
          steps={progressSetting.steps}
          step={progress}
        />
      </View>
      <View style={{ width: "100%" }}>
        <Ionicons
          name="arrow-back"
          size={34}
          color={theme.colors.colorTextDark}
          style={{ width: 100 }}
          onPress={() => {
            if (!exit && progress === 1) {
              navigation.pop();
              setExit(true);
            } else {
              if (progress === 3) {
                setProgressSetting({
                  ...progressSetting,
                  width: 200,
                  steps: [1, 2, 3, 4],
                });
              }
              setProgress(progress - 1);
            }
          }}
        />
      </View>

      {progress === 1 ? (
        <Basic
          information="email"
          progress={progress}
          setProgress={setProgress}
          data={data}
          setData={setData}
        />
      ) : progress === 2 ? (
        <Information
          information="email"
          data={data}
          setData={setData}
          setProgress={setProgress}
          setProgressSetting={setProgressSetting}
          progressSetting={progressSetting}
        />
      ) : progress === 3 && data.objetive === "Alumno" ? (
        <StudentInformation
          setProgress={setProgress}
          data={data}
          setData={setData}
        />
      ) : progress === 3 && data.objetive === "Profesor" ? (
        <TeacherInformation
          setProgress={setProgress}
          data={data}
          setData={setData}
        />
      ) : (progress === 4 && data.objetive === "Alumno") || progress === 6 ? (
        <ConfirmEmail
          data={data}
          subjects={subjectsSelected}
          tags={tags}
          setData={setData}
          setNotificationActive={setNotificationActive}
          setNotificationOptions={setNotificationOptions}
        />
      ) : progress === 4 && data.objetive === "Profesor" ? (
        <SelectionOfSubjects
          setProgress={setProgress}
          subjects={subjects}
          setSubjectsSelected={setSubjectsSelected}
          subjectsSelected={subjectsSelected}
        />
      ) : (
        <SelectionOfTopics
          setProgress={setProgress}
          tags={tags}
          setTags={setTags}
        />
      )}
      <CustomNotification
        activate={notificationActive}
        setActivate={setNotificationActive}
        type={notificationOptions.type}
        title={notificationOptions.title}
        componentRight={notificationOptions.componentRight}
      />
    </SafeAreaView>
  );
};

export default SignUpEmail;
