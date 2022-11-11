import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import theme from "../theme";
import TextStyle from "./TextStyle";

const CustomNotification = ({
  type,
  activate,
  setActivate,
  success,
  info,
  error,
  title,
  componentLeft,
  componentRight,
}) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activate) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }).start();
      }, 1500);
    }

    return () => setActivate(false);
  }, [activate]);

  const currentStyle = [
    styles.notification,
    (error || type === "error") && { backgroundColor: theme.colors.main3 },
    (success || type === "success") && { backgroundColor: theme.colors.main2 },
  ];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          currentStyle,
          {
            transform: [
              {
                scaleY: animation,
              },
            ],
          },
        ]}
      >
        {componentLeft && componentLeft()}
        <TextStyle
          color={
            (success ||
              info ||
              error ||
              type === "error" ||
              type === "success") &&
            "white"
          }
          customStyle={{ marginHorizontal: 5 }}
        >
          {title}
        </TextStyle>
        {componentRight && componentRight()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  notification: {
    backgroundColor: theme.colors.main4,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CustomNotification;
