import Constants from "expo-constants";
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Constants.statusBarHeight,
    padding: 20
  },
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    padding: 20
  },
});

export default {
  styles,
  colors: {
    main1: "#1B262C",
    main2: "#3282B8",
    main3: "#0F4C75",
    main4: "#EEEEEE",
    main5: "#283841",
    main6: "#FF6600",
    colorTextLight: "#666666",
    colorTextDark: "#1B262C"
  },
  width,
  height,
  statusBarHeight: Constants.statusBarHeight
};