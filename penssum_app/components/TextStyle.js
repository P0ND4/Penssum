import { Text, StyleSheet } from "react-native";
import theme from "../theme";

const styles = StyleSheet.create({
  default: {
    fontSize: 24,
    textAlign: "center",
    color: theme.colors.colorTextLight
  },
  small: { fontSize: 16 },
  paragrahp: { fontSize: 20 },
  medium: { fontSize: 26 },
  subtitle: { fontSize: 30 },
  title: { fontSize: 36 },
  justify: { textAlign: 'justify' }
});

const TextStyle = ({
  small,
  paragrahp,
  medium,
  subtitle,
  title,
  children,
  customStyle,
  left,
  right,
  color,
  onPress,
  justify
}) => {
  const styleOption = [
    styles.default,
    small && styles.small,
    paragrahp && styles.paragrahp,
    medium && styles.medium,
    subtitle && styles.subtitle,
    title && styles.title,
    left && { textAlign: "left" },
    right && { textAlign: "right" },
    color === "white"
      ? { color: "#FFFFFF" }
      : color === "main1"
      ? { color: theme.colors.main1 }
      : color === "main2"
      ? { color: theme.colors.main2 }
      : color === "main3"
      ? { color: theme.colors.main3 }
      : color === "main5"
      ? { color: theme.colors.main5 }
      : color === "main6"
      ? { color: theme.colors.main6 }
      : color && { color },
    justify && styles.justify,
    customStyle && customStyle,
  ];

  return <Text style={styleOption} onPress={onPress}>{children}</Text>;
};

export default TextStyle;
