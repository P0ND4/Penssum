import { TouchableOpacity, StyleSheet } from "react-native";
import TextStyle from "./TextStyle";

import theme from "../theme";

const styles = StyleSheet.create({
  default: {
    width: "100%",
    marginVertical: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
});

const ButtonStyle = ({
  children,
  backgroundColor = "main2",
  color = "white",
  customButtonStyle,
  onPress,
  small,
  paragrahp = true,
  medium,
  subtitle,
  title,
  split
}) => {
  const styleOption = [
    styles.default,
    backgroundColor === "white"
      ? { backgroundColor: "#FFFFFF" }
      : backgroundColor === "main1"
      ? { backgroundColor: theme.colors.main1 }
      : backgroundColor === "main2"
      ? { backgroundColor: theme.colors.main2 }
      : backgroundColor === "main3"
      ? { backgroundColor: theme.colors.main3 }
      : backgroundColor === "main5"
      ? { backgroundColor: theme.colors.main5 }
      : backgroundColor === "main6"
      ? { backgroundColor: theme.colors.main6 }
      : { backgroundColor },
    customButtonStyle && customButtonStyle,
    split === 2 && { width: '49%' }
  ];

  return (
    <TouchableOpacity style={styleOption} onPress={onPress}>
      <TextStyle
        small={small}
        paragrahp={paragrahp}
        medium={medium}
        subtitle={subtitle}
        title={title}
        color={color}
      >
        {children}
      </TextStyle>
    </TouchableOpacity>
  );
};

export default ButtonStyle;
