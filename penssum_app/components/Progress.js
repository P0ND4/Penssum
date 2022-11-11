import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, FlatList } from "react-native";
import TextStyle from "./TextStyle";

import theme from "../theme";

const Progress = ({ width, steps, step, height }) => {
  const progressBar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressBar, {
      toValue: (-width + width * step) / (steps.length - 1),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step,steps]);

  return (
    <View style={[styles.progressContainer, { width }]}>
      <View style={[styles.progress, { backgroundColor: "#DDDDDD", height }]}>
        <Animated.View
          style={[
            styles.progress,
            {
              transform: [{ translateY: -4 }],
            },
            { backgroundColor: theme.colors.main2, width: progressBar, height },
          ]}
        ></Animated.View>
      </View>
      {steps.map((number) => (
        <View
          style={[
            styles.circle,
            {
              backgroundColor: number <= step ? theme.colors.main2 : "#DDDDDD",
            },
          ]}
          key={number}
        >
          <TextStyle color={number <= step && "white"}>{number}</TextStyle>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  circle: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 19,
  },
  progress: {
    position: "absolute",
    width: "100%",
    top: "40%",
    borderRadius: 60,
  },
});

export default Progress;
