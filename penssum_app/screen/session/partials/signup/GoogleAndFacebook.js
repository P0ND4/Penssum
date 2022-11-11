import { useState, useEffect } from "react";
import { View, SafeAreaView } from "react-native";

import Progress from "../../../../components/Progress";

import Basic from "../email/Basic";
import Information from "../email/Information";
import StudentInformation from '../email/StudentInformation';
import TeacherInformation from '../email/TeacherInformation';
import SelectionOfSubjects from "../email/SelectionOfSubjects";
import SelectionOfTopics from "../email/SelectionOfTopics";

import Ionicons from "@expo/vector-icons/Ionicons";

import theme from "../../../../theme";

import { getDashboardInformation } from "../../../../api";

const GoogleAndFacebook = ({ route, navigation }) => {
  const [exit, setExit] = useState(false);
  const [progress, setProgress] = useState(1);

  const { data } = route.params;

  const [tags, setTags] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [subjectsSelected, setSubjectsSelected] = useState([]);

  const [progressSetting, setProgressSetting] = useState({
    // Configuracion de la barra de progreso
    width: 200,
    height: 10,
    steps: [1, 2, 3],
  });

  const [currentData, setCurrentData] = useState({
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
    valuePerHour: ""
  });

  const getSubjects = async () => {
    const result = await getDashboardInformation();
    setSubjects(result.subjects);
  };

  useEffect(() => {
    getSubjects();

    const dataObtained = {
      ...currentData,
      ...data
    };

    setCurrentData(dataObtained);
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
                  steps: [1, 2, 3],
                });
              }
              setProgress(progress - 1);
            }
          }}
        />
      </View>
      {progress === 1 ? (
        <Basic
          information="social"
          progress={progress}
          setProgress={setProgress}
          data={currentData}
          setData={setCurrentData}
        />
      ) : progress === 2 ? (
        <Information
          information="social"
          data={currentData}
          setData={setCurrentData}
          setProgress={setProgress}
          setProgressSetting={setProgressSetting}
          progressSetting={progressSetting}
        />
      ) : progress === 3 && currentData.objetive === "Alumno" ? (
        <StudentInformation
          information="social"
          setProgress={setProgress}
          data={currentData}
          setData={setCurrentData}
          subjects={subjectsSelected}
          tags={tags}
        />
      ) : progress === 3 && currentData.objetive === "Profesor" ? (
        <TeacherInformation
          setProgress={setProgress}
          data={currentData}
          setData={setCurrentData}
        />
      ) : progress === 4 && currentData.objetive === "Profesor" ? (
        <SelectionOfSubjects
          setProgress={setProgress}
          subjects={subjects}
          setSubjectsSelected={setSubjectsSelected}
          subjectsSelected={subjectsSelected}
        />
      ) : (
        <SelectionOfTopics
          information="social"
          setProgress={setProgress}
          data={currentData}
          tags={tags}
          setTags={setTags}
          subjects={subjectsSelected}
        />
      )}
    </SafeAreaView>
  );
};

export default GoogleAndFacebook;
